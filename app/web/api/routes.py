import os
import sys
import tempfile
import uuid
from pathlib import Path
from typing import Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# Agregar raíz del proyecto al path para importar módulos existentes
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from config import Config
from course_manager import (
    add_students_to_course,
    calculate_attendance_from_observations,
    create_course,
    discover_courses,
    get_course_contents,
    get_course_session,
    get_students,
    list_generated_reports,
    save_course_contents,
    save_course_session,
    save_student_observations,
)
from ollama_client import generate_report
from prompt_builder import build_system_prompt, build_user_prompt
from report_saver import save_report
from setup_ollama import get_available_models, is_ollama_installed, is_ollama_running
from student_parser import parse_student_file
from variants import get_variant_by_id, load_variants

router = APIRouter()
config = Config()


# ============== Modelos Pydantic ==============

class CourseContentsRequest(BaseModel):
    contents: str


class StudentObservation(BaseModel):
    fecha: str
    codigo: str
    tipo: str
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
    valoracion: Optional[str] = None
    pedagogical: List[int]
    socioemotional: List[int]
    content: List[int]
    particular_observations: Optional[str] = None
    attendance: Optional[Dict] = None


class ReportGenerateRequest(BaseModel):
    course: str
    filename: str
    contents: str
    answers: QuestionnaireAnswers
    variant_id: str
    model: Optional[str] = None


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


# ============== Endpoints ==============

@router.get("/health")
def health():
    return {"status": "ok"}


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
        courses = discover_courses(config.base_path)
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
    return {
        "contenidos": session["contenidos"],
        "respuestas": session["respuestas"],
        "progreso": session["progreso"],
        "informes_existentes": reports,
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
    content = report_path.read_text(encoding="utf-8")
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
    system_prompt = build_system_prompt(variant)
    answers_dict = req.answers.model_dump()
    user_prompt = build_user_prompt(student, req.contents, answers_dict, variant, req.answers.attendance)

    # Generar con Ollama
    model = req.model or config.model
    config.set("model", model)
    report_content = generate_report(system_prompt, user_prompt, config)

    if not report_content:
        raise HTTPException(status_code=500, detail="No se pudo generar el informe")

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
    for key, value in updates.items():
        config.set(key, value)
    return {"ok": True}


@router.get("/pick-folder")
def pick_folder():
    """Placeholder: el selector de carpetas se hace desde el frontend via File System Access API."""
    return {"error": "Usa el selector del navegador. Si no aparece, escribi la ruta manualmente."}
