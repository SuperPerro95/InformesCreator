import hashlib
import json
import os
import sys
import tempfile
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Response, Cookie, Request
from pydantic import BaseModel, ConfigDict

# Agregar raíz del proyecto al path para importar módulos existentes
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from config import Config
from course_manager import (
    add_students_to_course,
    create_course,
    discover_courses,
    get_course_contents,
    get_course_session,
    get_students,
    list_generated_reports,
    save_course_contents,
    save_course_session,
    save_student_observations,
    get_student_questionnaire,
    set_student_questionnaire,
)
from ollama_client import generate_report
from paths import user_data_path
from prompt_builder import build_system_prompt, build_user_prompt
from report_saver import save_report
from setup_ollama import get_available_models, is_ollama_installed, is_ollama_running
from student_parser import parse_student_file
from variants import get_variant_by_id, load_variants
from questionnaires import (
    assign_questionnaire_to_course,
    create_questionnaire,
    delete_questionnaire,
    duplicate_questionnaire,
    get_course_questionnaire,
    get_questionnaire,
    get_questionnaire_versions,
    load_questionnaires,
    restore_questionnaire_version,
    update_questionnaire,
)

router = APIRouter()
config = Config()


# ============== Modelos Pydantic ==============

class CourseContentsRequest(BaseModel):
    contents: str


class StudentObservation(BaseModel):
    fecha: str
    codigo: str = ""
    tipo: str = ""
    comentario: str


class StudentDetail(BaseModel):
    nombre_completo: str
    lista_numero: int
    curso: str
    observaciones: List[StudentObservation]
    total_ausencias: int
    total_presentes: int
    presentes_exc: int
    tarde: int
    inasistencias_seguidas: int
    ultima_actualizacion: str


class QuestionnaireAnswers(BaseModel):
    model_config = ConfigDict(extra='allow')

    valoracion: Optional[str] = None
    pedagogical: List[int] = []
    socioemotional: List[int] = []
    content: List[int] = []
    particular_observations: Optional[str] = None
    attendance: Optional[Dict] = None


class ReportGenerateRequest(BaseModel):
    course: str
    filename: str
    contents: str
    answers: QuestionnaireAnswers
    variant_id: str
    model: Optional[str] = None
    customization: Optional[str] = None


class ReportResponse(BaseModel):
    report_content: str
    saved_path: str


class VariantResponse(BaseModel):
    id: str
    name: str
    description: str
    word_count_target: str
    tone_instructions: str


class OllamaStatusResponse(BaseModel):
    installed: bool
    running: bool
    models: List[str]


class CreateCourseRequest(BaseModel):
    course_name: str
    students: List[Dict]


class SaveObservationsRequest(BaseModel):
    observaciones: List[StudentObservation]


class RegisterRequest(BaseModel):
    username: str
    password: str
    display_name: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class ProfileResponse(BaseModel):
    username: str
    display_name: Optional[str] = None


class QuestionItem(BaseModel):
    section: str
    title: str
    text: str
    answer_type: str
    options: List[Any]
    labels: List[str]


class CreateQuestionnaireRequest(BaseModel):
    name: str
    description: str = ""
    questions: List[QuestionItem]


class UpdateQuestionnaireRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    questions: Optional[List[QuestionItem]] = None


class DuplicateQuestionnaireRequest(BaseModel):
    new_name: str


class AssignQuestionnaireRequest(BaseModel):
    questionnaire_id: str


# ============== Profile Helpers ==============

USERS_FILE = "users.json"


def _get_users_path() -> Path:
    return user_data_path(USERS_FILE)


def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def _load_users() -> Dict:
    path = _get_users_path()
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    
    # Migrar desde profile.json antiguo si existe
    old_path = user_data_path("profile.json")
    if old_path.exists():
        with open(old_path, "r", encoding="utf-8") as f:
            old = json.load(f)
            users = {old["username"]: old}
            _save_users(users)
            return users
    return {}


def _save_users(users: Dict) -> None:
    path = _get_users_path()
    with open(path, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=4, ensure_ascii=False)


class UpdateProfileRequest(BaseModel):
    display_name: Optional[str] = None
    password: Optional[str] = None


# ============== Endpoints ==============

@router.get("/health")
def health():
    return {"status": "ok"}


@router.post("/auth/register")
def register(req: RegisterRequest):
    """Crea un nuevo usuario."""
    users = _load_users()
    if req.username in users:
        raise HTTPException(status_code=400, detail="El nombre de usuario ya existe. Usá /auth/login.")
    if not req.username or not req.password:
        raise HTTPException(status_code=400, detail="Usuario y contraseña requeridos.")
    
    profile = {
        "username": req.username,
        "password_hash": _hash_password(req.password),
        "display_name": req.display_name or req.username,
    }
    users[req.username] = profile
    _save_users(users)
    return {"ok": True, "username": profile["username"]}


@router.post("/auth/login")
def login(req: LoginRequest, response: Response):
    """Valida credenciales y establece cookie de sesión."""
    users = _load_users()
    if not users:
        raise HTTPException(status_code=400, detail="No existen usuarios. Registrate primero.")
    
    profile = users.get(req.username)
    if not profile or profile["password_hash"] != _hash_password(req.password):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos.")
    
    # Establecer cookie (válida por 30 días, HTTPOnly para seguridad)
    response.set_cookie(key="informes_session", value=profile["username"], httponly=True, max_age=30*24*3600)
    
    return {"ok": True, "username": profile["username"], "display_name": profile.get("display_name")}


@router.post("/auth/logout")
def logout(response: Response):
    """Cierra la sesión borrando la cookie."""
    response.delete_cookie("informes_session")
    return {"ok": True}


@router.get("/auth/me", response_model=ProfileResponse)
def me(request: Request):
    """
    Devuelve datos del perfil usando la cookie.
    Si no hay usuarios creados, devuelve 404 (el frontend lo usa para saber si mostrar Registro).
    Si hay usuarios pero no hay sesión, devuelve usuario vacío con 200 (el frontend va a Login).
    """
    users = _load_users()
    if not users:
        raise HTTPException(status_code=404, detail="No hay perfiles creados.")
    
    session_user = request.cookies.get("informes_session")
    if not session_user or session_user not in users:
        # Devolver 200 con un usuario vacío para que el frontend intente loguearse
        # en lugar de enviarlo a registro.
        return {"username": "", "display_name": ""}
        
    profile = users[session_user]
    return {
        "username": profile["username"],
        "display_name": profile.get("display_name"),
    }


@router.put("/auth/profile")
def update_profile(req: UpdateProfileRequest, request: Request):
    """Modifica el nombre o contraseña del usuario logueado."""
    users = _load_users()
    session_user = request.cookies.get("informes_session")
    
    if not session_user or session_user not in users:
        raise HTTPException(status_code=401, detail="No estás autenticado.")
        
    profile = users[session_user]
    
    if req.display_name:
        profile["display_name"] = req.display_name
    if req.password:
        profile["password_hash"] = _hash_password(req.password)
        
    users[session_user] = profile
    _save_users(users)
    
    return {"ok": True, "display_name": profile["display_name"]}


@router.get("/ollama/status", response_model=OllamaStatusResponse)
def ollama_status():
    installed = is_ollama_installed()
    running = is_ollama_running(config.ollama_url)
    models = get_available_models(config.ollama_url) if running else []
    return {
        "installed": installed,
        "running": running,
        "models": models,
    }


@router.get("/ollama/models")
def ollama_models():
    models = get_available_models(config.ollama_url)
    return {"models": models}


@router.get("/courses")
def list_courses():
    try:
        course_names = discover_courses(config.base_path)
        courses = []
        for name in course_names:
            course_path = config.base_path / name / "Alumnos"
            student_count = 0
            if course_path.exists():
                student_count = len([f for f in course_path.iterdir() if f.suffix == '.md'])
            completed_count = 0
            try:
                session = get_course_session(name)
                completed_count = len(session.get("progreso", {}).get("completados", []))
            except Exception:
                pass
            courses.append({
                "name": name,
                "student_count": student_count,
                "completed_count": completed_count,
            })
        return {"courses": courses}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/courses/{course}/students")
def list_students(course: str):
    course_path = config.base_path / course
    if not course_path.exists():
        raise HTTPException(status_code=404, detail="Curso no encontrado")
    students = get_students(course_path)
    result = []
    alumnos_dir = course_path / "Alumnos"
    md_files = sorted(alumnos_dir.glob("*.md"))
    for s, md_file in zip(students, md_files):
        result.append({
            "nombre_completo": s.nombre_completo,
            "lista_numero": s.lista_numero,
            "curso": s.curso,
            "total_presentes": s.total_presentes,
            "total_ausencias": s.total_ausencias,
            "inasistencias_seguidas": s.inasistencias_seguidas,
            "filename": md_file.name,
        })
    return {"students": result}


@router.get("/courses/{course}/contents")
def get_contents(course: str):
    contents = get_course_contents(course)
    return {"contents": contents if contents else ""}


@router.post("/courses/{course}/contents")
def post_contents(course: str, req: CourseContentsRequest):
    save_course_contents(course, req.contents)
    return {"ok": True}


@router.get("/courses/{course}/session")
def get_session(course: str):
    session = get_course_session(course)
    reports = list_generated_reports(course, config.output_dir)
    qid = get_course_questionnaire(course)
    return {
        "contenidos": session["contenidos"],
        "respuestas": session["respuestas"],
        "progreso": session["progreso"],
        "informes_existentes": reports,
        "questionnaire_id": qid,
        "student_questionnaires": session.get("student_questionnaires", {}),
    }


@router.post("/courses/{course}/session")
def post_session(course: str, req: Dict):
    save_course_session(course, req)
    return {"ok": True}


@router.get("/courses/{course}/reports")
def get_course_reports(course: str):
    reports = list_generated_reports(course, config.output_dir)
    return {"reports": reports}


@router.get("/reports/{course}/{filename}")
def get_report_file(course: str, filename: str):
    report_path = config.output_dir / course / filename
    if not report_path.exists():
        raise HTTPException(status_code=404, detail="Informe no encontrado")
    raw = report_path.read_text(encoding="utf-8")
    parts = raw.split("---")
    content = parts[1].strip() if len(parts) >= 3 else raw
    return {"content": content}


@router.get("/students/{course}/{filename}")
def get_student(course: str, filename: str):
    course_path = config.base_path / course / "Alumnos"
    filepath = course_path / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    student = parse_student_file(filepath)
    return {
        "nombre_completo": student.nombre_completo,
        "lista_numero": student.lista_numero,
        "curso": student.curso,
        "observaciones": [
            {
                "fecha": o.fecha,
                "codigo": o.codigo,
                "tipo": o.tipo,
                "comentario": o.comentario,
            }
            for o in student.observaciones
        ],
        "total_ausencias": student.total_ausencias,
        "total_presentes": student.total_presentes,
        "presentes_exc": student.presentes_exc,
        "tarde": student.tarde,
        "inasistencias_seguidas": student.inasistencias_seguidas,
        "ultima_actualizacion": student.ultima_actualizacion,
    }


@router.get("/variants", response_model=List[VariantResponse])
def list_variants():
    variants = load_variants()
    return [
        {
            "id": v.id,
            "name": v.name,
            "description": v.description,
            "word_count_target": v.word_count_target,
            "tone_instructions": v.tone_instructions,
        }
        for v in variants
    ]


@router.post("/reports/generate", response_model=ReportResponse)
def generate_report_endpoint(req: ReportGenerateRequest):
    # Parsear alumno
    course_path = config.base_path / req.course / "Alumnos"
    filepath = course_path / req.filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    student = parse_student_file(filepath)

    # Obtener variante
    variant = get_variant_by_id(req.variant_id)
    if not variant:
        raise HTTPException(status_code=400, detail="Variante inválida")

    # Construir prompts
    system_prompt = build_system_prompt(variant, req.customization)
    answers_dict = req.answers.model_dump()

    # Obtener cuestionario: primero por alumno, luego por curso
    qid = get_student_questionnaire(req.course, req.filename) or get_course_questionnaire(req.course)
    questionnaire = get_questionnaire(qid)

    user_prompt = build_user_prompt(
        student, req.contents, answers_dict, variant, req.answers.attendance, questionnaire,
    )

    # Generar con Ollama
    model = req.model or config.model
    config.set("model", model)

    # Pre-flight: check Ollama is running
    if not is_ollama_running(config.ollama_url):
        raise HTTPException(
            status_code=503,
            detail="El servidor Ollama no esta corriendo. Abri Ollama desde el menu de inicio o ejecuta 'ollama serve'.",
        )

    # Pre-flight: check model is available
    available_models = get_available_models(config.ollama_url)
    if model not in available_models:
        raise HTTPException(
            status_code=404,
            detail=f"El modelo '{model}' no esta instalado. Descargalo con 'ollama pull {model}' y volve a intentar.",
        )

    report_content = generate_report(system_prompt, user_prompt, config)

    if not report_content:
        raise HTTPException(
            status_code=500,
            detail="La generacion del informe fallo. El modelo puede estar ocupado o no tener suficiente memoria. Intenta de nuevo.",
        )

    # Guardar informe
    output_dir = str(config.output_dir)
    saved_path = save_report(req.course, student, report_content, output_dir)

    # Actualizar progreso en la sesion del curso
    try:
        session = get_course_session(req.course)
        answers_dict = req.answers.model_dump()
        session["respuestas"][req.filename] = answers_dict
        if req.filename not in session["progreso"]["completados"]:
            session["progreso"]["completados"].append(req.filename)
        save_course_session(req.course, {
            "respuestas": session["respuestas"],
            "progreso": session["progreso"],
        })
    except Exception:
        pass  # No fallar si no se puede guardar la sesion

    return {
        "report_content": report_content,
        "saved_path": str(saved_path),
    }


@router.post("/reports/download")
def download_report(content: str):
    """Devuelve el contenido del informe como archivo markdown para descargar."""
    return {"content": content}


@router.post("/courses/create")
def create_course_endpoint(req: CreateCourseRequest):
    """Crea un nuevo curso con sus alumnos."""
    try:
        create_course(config.base_path, req.course_name)
        add_students_to_course(config.base_path, req.course_name, req.students)
        return {"ok": True, "course": req.course_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/students/{course}/{filename}/observations")
def get_student_observations(course: str, filename: str):
    """Devuelve las observaciones raw de un alumno."""
    course_path = config.base_path / course / "Alumnos"
    filepath = course_path / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    student = parse_student_file(filepath)
    return {
        "observaciones": [
            {"fecha": o.fecha, "codigo": o.codigo, "tipo": o.tipo, "comentario": o.comentario}
            for o in student.observaciones
        ],
        "totales": {
            "total_presentes": student.total_presentes,
            "total_ausencias": student.total_ausencias,
            "presentes_exc": student.presentes_exc,
            "tarde": student.tarde,
            "inasistencias_seguidas": student.inasistencias_seguidas,
        }
    }


@router.post("/students/{course}/{filename}/observations")
def post_student_observations(course: str, filename: str, req: SaveObservationsRequest):
    """Guarda observaciones de un alumno y recalcula asistencia."""
    course_path = config.base_path / course
    filepath = course_path / "Alumnos" / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    try:
        observations = [
            {"fecha": o.fecha, "codigo": o.codigo, "tipo": o.tipo, "comentario": o.comentario}
            for o in req.observaciones
        ]
        save_student_observations(course_path, filename, observations)
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/students/{course}/{filename}/clear")
def clear_student(course: str, filename: str):
    """Borra respuestas, progreso e informe generado de un alumno."""
    # Obtener nombre completo del alumno
    course_path = config.base_path / course
    filepath = course_path / "Alumnos" / filename
    nombre_completo = filename.replace(".md", "").replace("_", " ")
    if filepath.exists():
        try:
            student = parse_student_file(filepath)
            nombre_completo = student.nombre_completo
        except Exception:
            pass

    # Limpiar sesion
    session = get_course_session(course)
    session.setdefault("respuestas", {})
    session.setdefault("progreso", {"completados": []})
    session["progreso"].setdefault("inProgress", {})

    if filename in session["respuestas"]:
        del session["respuestas"][filename]
    if filename in session["progreso"]["inProgress"]:
        del session["progreso"]["inProgress"][filename]
    session["progreso"]["completados"] = [
        f for f in session["progreso"].get("completados", []) if f != filename
    ]

    save_course_session(course, session)

    # Borrar informe generado si existe
    safe_name = nombre_completo.replace(", ", "_").replace(" ", "_")
    report_filename = f"Informe_{safe_name}.md"
    report_path = config.output_dir / course / report_filename
    if report_path.exists():
        report_path.unlink()

    return {"ok": True}


class SetStudentQuestionnaireRequest(BaseModel):
    questionnaire_id: str


@router.get("/courses/{course}/students/{filename}/questionnaire")
def get_student_questionnaire_endpoint(course: str, filename: str):
    qid = get_student_questionnaire(course, filename)
    return {"questionnaire_id": qid or ""}


@router.post("/courses/{course}/students/{filename}/questionnaire")
def set_student_questionnaire_endpoint(course: str, filename: str, req: SetStudentQuestionnaireRequest):
    set_student_questionnaire(course, filename, req.questionnaire_id or "")
    return {"ok": True}


@router.get("/config")
def get_config():
    return {
        "base_path": str(config.base_path),
        "ollama_url": config.ollama_url,
        "model": config.model,
        "output_dir": str(config.output_dir),
        "default_variant": config.default_variant,
    }


@router.post("/config")
def update_config(updates: Dict[str, str]):
    # Si se envia base_path sin output_dir, auto-setear output_dir dentro de base_path
    if "base_path" in updates and "output_dir" not in updates:
        from pathlib import Path
        bp = Path(updates["base_path"])
        if bp.is_absolute():
            updates["output_dir"] = str(bp / "Informes")
        else:
            updates["output_dir"] = str(Path(config.base_path) / bp / "Informes")
    for key, value in updates.items():
        config.set(key, value)
    return {"ok": True}


# ============== Questionnaires ==============

@router.get("/questionnaires")
def list_questionnaires():
    """Lista todos los cuestionarios disponibles."""
    data = load_questionnaires()
    questionnaires = data.get("questionnaires", {})
    return [
        {
            "id": q["id"],
            "name": q["name"],
            "description": q.get("description", ""),
            "version": q.get("version", 1),
            "created_at": q.get("created_at", ""),
            "question_count": len(q.get("questions", [])),
        }
        for q in questionnaires.values()
    ]


@router.get("/questionnaires/{qid}")
def get_questionnaire_endpoint(qid: str):
    """Devuelve un cuestionario completo por ID."""
    q = get_questionnaire(qid)
    if not q:
        raise HTTPException(status_code=404, detail="Cuestionario no encontrado")
    return {
        "id": q.id,
        "name": q.name,
        "description": q.description,
        "version": q.version,
        "created_at": q.created_at,
        "questions": [
            {
                "section": qu.section,
                "title": qu.title,
                "text": qu.text,
                "answer_type": qu.answer_type,
                "options": qu.options,
                "labels": qu.labels,
            }
            for qu in q.questions
        ],
    }


@router.post("/questionnaires")
def create_questionnaire_endpoint(req: CreateQuestionnaireRequest):
    """Crea un nuevo cuestionario."""
    questions = [q.model_dump() for q in req.questions]
    q = create_questionnaire(req.name, req.description, questions)
    return {"id": q.id, "name": q.name, "version": q.version}


@router.put("/questionnaires/{qid}")
def update_questionnaire_endpoint(qid: str, req: UpdateQuestionnaireRequest):
    """Actualiza un cuestionario existente."""
    updates = {}
    if req.name is not None:
        updates["name"] = req.name
    if req.description is not None:
        updates["description"] = req.description
    if req.questions is not None:
        updates["questions"] = [q.model_dump() for q in req.questions]
    try:
        q = update_questionnaire(qid, updates)
        return {"id": q.id, "name": q.name, "version": q.version}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/questionnaires/{qid}")
def delete_questionnaire_endpoint(qid: str):
    """Elimina un cuestionario (no se puede eliminar el default)."""
    ok = delete_questionnaire(qid)
    if not ok:
        raise HTTPException(status_code=400, detail="No se puede eliminar el cuestionario default o no existe")
    return {"ok": True}


@router.post("/questionnaires/{qid}/duplicate")
def duplicate_questionnaire_endpoint(qid: str, req: DuplicateQuestionnaireRequest):
    """Duplica un cuestionario con nuevo nombre."""
    try:
        q = duplicate_questionnaire(qid, req.new_name)
        return {"id": q.id, "name": q.name}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/questionnaires/{qid}/versions")
def list_questionnaire_versions(qid: str):
    """Devuelve el historial de versiones de un cuestionario."""
    return {"versions": get_questionnaire_versions(qid)}


@router.post("/questionnaires/{qid}/restore/{version}")
def restore_questionnaire_version_endpoint(qid: str, version: int):
    """Restaura un cuestionario a una versión anterior."""
    try:
        q = restore_questionnaire_version(qid, version)
        return {"id": q.id, "name": q.name, "version": q.version}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/courses/{course}/questionnaire")
def get_course_questionnaire_endpoint(course: str):
    """Devuelve el ID del cuestionario asignado a un curso."""
    qid = get_course_questionnaire(course)
    return {"questionnaire_id": qid}


@router.post("/courses/{course}/questionnaire")
def assign_course_questionnaire_endpoint(course: str, req: AssignQuestionnaireRequest):
    """Asigna un cuestionario a un curso."""
    assign_questionnaire_to_course(course, req.questionnaire_id)
    return {"ok": True}


@router.get("/pick-folder")
def pick_folder():
    """Abre un dialogo nativo de seleccion de carpeta y devuelve la ruta absoluta."""
    # 1. Tkinter (funciona en Windows/macOS/Linux con display)
    try:
        import tkinter as tk
        from tkinter import filedialog

        root = tk.Tk()
        root.withdraw()
        root.attributes("-topmost", True)
        folder = filedialog.askdirectory(title="Seleccionar carpeta CURSOS")
        root.destroy()

        if folder:
            return {"path": folder}
        return {"path": "", "cancelled": True}
    except Exception:
        pass

    # 2. PowerShell (Windows / WSL)
    try:
        import subprocess

        ps_cmd = (
            'Add-Type -AssemblyName System.Windows.Forms; '
            '$dlg = New-Object System.Windows.Forms.FolderBrowserDialog; '
            '$dlg.Description = "Seleccionar carpeta CURSOS"; '
            'if ($dlg.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { '
            '    Write-Output $dlg.SelectedPath '
            '}'
        )
        result = subprocess.run(
            ["powershell.exe", "-NoProfile", "-Command", ps_cmd],
            capture_output=True,
            text=True,
            timeout=60,
        )
        folder = result.stdout.strip()
        if folder:
            # Convert Windows path to WSL/Linux path if needed
            if folder.startswith("\\") or (len(folder) > 1 and folder[1] == ":"):
                # WSL: convert C:\path to /mnt/c/path
                import re
                folder = re.sub(r"^([A-Za-z]):", lambda m: f"/mnt/{m.group(1).lower()}", folder)
                folder = folder.replace("\\", "/")
            return {"path": folder}
        return {"path": "", "cancelled": True}
    except Exception:
        pass

    # 3. Zenity (Linux con display)
    try:
        import subprocess

        result = subprocess.run(
            ["zenity", "--file-selection", "--directory", "--title=Seleccionar carpeta CURSOS"],
            capture_output=True,
            text=True,
            timeout=60,
        )
        folder = result.stdout.strip()
        if folder:
            return {"path": folder}
        return {"path": "", "cancelled": True}
    except Exception:
        pass

    return {"error": "No se pudo abrir el selector de carpetas. Escribi la ruta manualmente."}
