import json
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

from paths import user_data_path
from student_parser import Student, calculate_attendance_from_observations, parse_student_file


def discover_courses(base_path: Path) -> List[str]:
    """Descubre los cursos disponibles escaneando subcarpetas de base_path."""
    if not base_path.exists():
        return []
    return [d.name for d in base_path.iterdir() if d.is_dir()]


def get_course_contents(course_name: str) -> Optional[str]:
    """Lee los contenidos desarrollados de un curso desde un archivo JSON."""
    slug = _slugify(course_name)
    filepath = user_data_path(f"curso_{slug}.json")
    if filepath.exists():
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("contenidos", None)
    return None


def save_course_contents(course_name: str, contents: str) -> None:
    """Persiste los contenidos desarrollados de un curso en un archivo JSON."""
    slug = _slugify(course_name)
    filepath = user_data_path(f"curso_{slug}.json")
    data = {"curso": course_name, "contenidos": contents}
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)


def get_students(course_path: Path) -> List[Student]:
    """Lista los alumnos de un curso escaneando la carpeta Alumnos/*.md."""
    alumnos_dir = course_path / "Alumnos"
    if not alumnos_dir.exists():
        return []

    students = []
    for md_file in sorted(alumnos_dir.glob("*.md")):
        try:
            student = parse_student_file(md_file)
            students.append(student)
        except Exception:
            continue
    return students


def get_course_session(course_name: str) -> dict:
    """Lee el estado completo de un curso desde su archivo JSON."""
    slug = _slugify(course_name)
    filepath = user_data_path(f"curso_{slug}.json")
    if filepath.exists():
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            return {
                "curso": data.get("curso", course_name),
                "contenidos": data.get("contenidos", ""),
                "respuestas": data.get("respuestas", {}),
                "progreso": data.get("progreso", {"completados": []}),
                "student_questionnaires": data.get("student_questionnaires", {}),
            }
    return {
        "curso": course_name,
        "contenidos": "",
        "respuestas": {},
        "progreso": {"completados": []},
        "student_questionnaires": {},
    }


def get_student_questionnaire(course_name: str, filename: str) -> Optional[str]:
    """Devuelve el ID del cuestionario asignado a un alumno especifico, o None."""
    session = get_course_session(course_name)
    return session.get("student_questionnaires", {}).get(filename)


def set_student_questionnaire(course_name: str, filename: str, qid: str) -> None:
    """Asigna un cuestionario a un alumno especifico."""
    slug = _slugify(course_name)
    filepath = user_data_path(f"curso_{slug}.json")
    existing = {}
    if filepath.exists():
        with open(filepath, "r", encoding="utf-8") as f:
            existing = json.load(f)
    sq = existing.get("student_questionnaires", {})
    if qid:
        sq[filename] = qid
    else:
        sq.pop(filename, None)
    existing["student_questionnaires"] = sq
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(existing, f, indent=4, ensure_ascii=False)


def save_course_session(course_name: str, session_data: dict) -> None:
    """Persiste el estado de un curso (respuestas y progreso) en su archivo JSON."""
    slug = _slugify(course_name)
    filepath = user_data_path(f"curso_{slug}.json")

    # Leer datos existentes para preservar contenidos
    existing = {}
    if filepath.exists():
        with open(filepath, "r", encoding="utf-8") as f:
            existing = json.load(f)

    existing["curso"] = course_name
    if "respuestas" in session_data:
        existing["respuestas"] = session_data["respuestas"]
    if "progreso" in session_data:
        existing["progreso"] = session_data["progreso"]

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(existing, f, indent=4, ensure_ascii=False)


def list_generated_reports(course_name: str, output_dir: Path) -> List[str]:
    """Devuelve la lista de informes ya generados para un curso."""
    reports_dir = output_dir / course_name
    if not reports_dir.exists():
        return []
    return sorted([f.name for f in reports_dir.glob("Informe_*.md")])


def create_student_template(course_name: str, student_name: str, lista_num: int) -> str:
    """Genera el contenido markdown base para un nuevo archivo de alumno."""
    return f"""# {student_name}

**Curso:** {course_name} | **Lista Nº:** {lista_num}

---

## 📝 Observaciones

| Fecha | Código | Tipo | Comentario |
|-------|--------|------|------------|
| | | | |

### Leyenda:
- **P** = Presente
- **A** = Ausente
- **P-EXC** = Presente, excelente trabajo
- **P-x** = Presente, sin material/tarea
- **T** = Tarde

---

## 📊 Resumen

- **Total Presentes:** 0
- **P-EXC:** 0
- **Tarde:** 0
- **Total Ausencias:** 0
- **Inasistencias seguidas:** 0
- **Última actualización:**
"""


def _slugify(text: str) -> str:
    """Convierte un nombre de curso a un slug válido para nombre de archivo."""
    return text.lower().replace(" ", "_").replace("\\", "").replace("/", "")


def create_course(base_path: Path, course_name: str) -> Path:
    """Crea la estructura de carpetas para un nuevo curso."""
    course_path = base_path / course_name
    alumnos_dir = course_path / "Alumnos"
    alumnos_dir.mkdir(parents=True, exist_ok=True)
    return course_path


def add_students_to_course(base_path: Path, course_name: str, students: List[dict]) -> None:
    """Crea archivos .md vacíos para una lista de alumnos.
    students: list of dicts with keys 'nombre' and optionally 'lista_numero'.
    """
    course_path = base_path / course_name
    alumnos_dir = course_path / "Alumnos"
    alumnos_dir.mkdir(parents=True, exist_ok=True)

    for i, s in enumerate(students, start=1):
        name = s.get("nombre", "").strip()
        if not name:
            continue
        lista_num = s.get("lista_numero", i)
        safe_name = name.replace(", ", "_").replace(",", "_").replace(" ", "_")
        filename = f"{safe_name}.md"
        filepath = alumnos_dir / filename

        if not filepath.exists():
            content = create_student_template(course_name, name, lista_num)
            filepath.write_text(content, encoding="utf-8")


def format_observations_table(observaciones: List) -> str:
    """Formatea una lista de observaciones como tabla markdown."""
    lines = ["| Fecha | Código | Tipo | Comentario |", "|-------|--------|------|------------|"]
    if not observaciones:
        lines.append("| | | | |")
    else:
        for obs in observaciones:
            fecha = obs.get("fecha", "") if isinstance(obs, dict) else getattr(obs, "fecha", "")
            codigo = obs.get("codigo", "") if isinstance(obs, dict) else getattr(obs, "codigo", "")
            tipo = obs.get("tipo", "") if isinstance(obs, dict) else getattr(obs, "tipo", "")
            comentario = obs.get("comentario", "") if isinstance(obs, dict) else getattr(obs, "comentario", "")
            lines.append(f"| {fecha} | {codigo} | {tipo} | {comentario} |")
    return "\n".join(lines)


def save_student_observations(course_path: Path, filename: str, observations: List[dict]) -> None:
    """Actualiza el archivo .md de un alumno con nuevas observaciones y recalcula resumen."""
    filepath = course_path / "Alumnos" / filename
    if not filepath.exists():
        raise FileNotFoundError(f"Archivo no encontrado: {filepath}")

    content = filepath.read_text(encoding="utf-8")

    # Extraer datos actuales del encabezado
    nombre_match = re.search(r"^#\s+(.+)", content, re.MULTILINE)
    nombre = nombre_match.group(1).strip() if nombre_match else filename.replace(".md", "").replace("_", " ")

    curso_match = re.search(r"\*\*Curso:\*\*\s+(.+?)\s*\|", content)
    curso = curso_match.group(1).strip() if curso_match else ""

    lista_match = re.search(r"\*\*Lista Nº:\*\*\s+(\d+)", content)
    lista_numero = int(lista_match.group(1)) if lista_match else 0

    # Calcular asistencia
    stats = calculate_attendance_from_observations(observations)

    # Reconstruir contenido
    table = format_observations_table(observations)
    new_content = f"""# {nombre}

**Curso:** {curso} | **Lista Nº:** {lista_numero}

---

## 📝 Observaciones

{table}

### Leyenda:
- **P** = Presente
- **P-EXC** = Presente, excelente trabajo
- **P-x** = Presente, sin material/tarea
- **T** = Tarde

---

## 📊 Resumen

- **Total Presentes:** {stats["total_presentes"]}
- **P-EXC:** {stats["presentes_exc"]}
- **Tarde:** {stats["tarde"]}
- **Total Ausencias:** {stats["total_ausencias"]}
- **Inasistencias seguidas:** {stats["inasistencias_seguidas"]}
- **Última actualización:** {datetime.now().strftime("%d/%m/%Y")}
"""
    filepath.write_text(new_content, encoding="utf-8")
