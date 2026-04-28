from typing import Any, Dict, List, Optional

from student_parser import Student
from variants import ReportVariant


# Mapeo de respuestas numéricas a palabras para el prompt
FREQUENCY_MAP = {
    1: "NUNCA",
    2: "RARA VEZ",
    3: "EN OCASIONES",
    4: "SIEMPRE",
}

CONTENT_LEVEL_MAP = {
    1: "No Logrado",
    2: "En Proceso",
    3: "Logrado",
}

# Preguntas del cuestionario
PEDAGOGICAL_QUESTIONS = [
    "Participación: ¿Interviene de manera pertinente durante las explicaciones o debates?",
    "Seguimiento de consignas: ¿Comprende y ejecuta las instrucciones de trabajo a la primera mención?",
    "Autonomía: ¿Inicia y avanza en sus tareas sin necesidad de supervisión constante?",
    "Organización: ¿Trae y mantiene ordenados los materiales necesarios para la clase?",
    "Persistencia: ¿Mantiene el esfuerzo ante una tarea que le resulta difícil o compleja?",
    "Cumplimiento: ¿Entrega las actividades o producciones en los plazos establecidos?",
]

SOCIOEMOTIONAL_QUESTIONS = [
    "Integración social: ¿Trabaja de forma colaborativa y armónica con sus compañeros?",
    "Gestión del error: ¿Acepta las correcciones o los errores sin mostrar frustración excesiva o bloqueo?",
    "Comunicación: ¿Expresa sus necesidades, dudas o desacuerdos de manera respetuosa?",
    "Respeto a las normas: ¿Se ajusta a los acuerdos de convivencia establecidos en el aula?",
    "Empatía: ¿Muestra actitudes de ayuda o respeto hacia las dificultades de los demás?",
    "Nivel de motivación: ¿Muestra curiosidad o disposición positiva hacia las actividades propuestas?",
]

CONTENT_INDICATORS = [
    "Explica con sus palabras",
    "Relaciona con temas previos",
    "Aplica en ejercicios prácticos",
    "Usa terminología adecuada",
    "Justifica sus respuestas",
]

_SECTION_TITLES = {
    "pedagogical": "COMPORTAMIENTO PEDAGÓGICO",
    "socioemotional": "COMPORTAMIENTO SOCIOEMOCIONAL",
    "content": "DOMINIO DE CONTENIDOS",
}


def _roman(num: int) -> str:
    val = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
    syb = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"]
    roman_num = ""
    for i in range(len(val)):
        count = int(num / val[i])
        roman_num += syb[i] * count
        num -= val[i] * count
    return roman_num


def _group_questions_by_section(questions: List[Any]) -> Dict[str, List[Any]]:
    """Agrupa preguntas por sección preservando el orden de aparición."""
    sections: Dict[str, List[Any]] = {}
    for q in questions:
        section = getattr(q, "section", "")
        sections.setdefault(section, []).append(q)
    return sections


def _get_answer_mapping(answer_type: str) -> Optional[Dict]:
    if answer_type == "frequency_4":
        return FREQUENCY_MAP
    if answer_type == "achievement_3":
        return CONTENT_LEVEL_MAP
    return None


def _build_dynamic_dimension_summary(title: str, questions: List[Any], answers: List) -> str:
    lines = [f"{title}:"]
    has_any = False
    for i, q in enumerate(questions):
        if i < len(answers) and answers[i] is not None and answers[i] != 0 and answers[i] != "":
            value = answers[i]
            mapping = _get_answer_mapping(getattr(q, "answer_type", ""))
            if mapping and value in mapping:
                value = mapping[value]
            display_text = getattr(q, "text", "") or getattr(q, "title", "")
            lines.append(f"- {display_text} → {value}")
            has_any = True
    if not has_any:
        return ""
    return "\n".join(lines) + "\n"


def build_system_prompt(variant: ReportVariant, customization: Optional[str] = None) -> str:
    """Construye el system prompt para Ollama."""
    custom_section = f"\n{customization}\n" if customization else ""
    return f"""Sos docente de este alumno.
Redactá un informe de avance en primera persona, con tono descriptivo y objetivo.
NO lo redactes como carta dirigida a la familia. No uses "su hijo/a", "les informamos", etc.
El informe debe ser conciso: usá la menor cantidad de palabras posible.
Debe sonar como escrito por un docente humano, no por una inteligencia artificial.
El objetivo es registrar el avance del alumno de manera clara y breve.

{variant.tone_instructions}{custom_section}
"""


def build_user_prompt(
    student: Student,
    course_contents: str,
    answers: Dict,
    variant: ReportVariant,
    attendance: Optional[Dict] = None,
    questionnaire: Optional[Any] = None,
) -> str:
    """Construye el user prompt combinando todos los datos del alumno."""

    observations_summary = _build_observations_summary(student.observaciones)

    valoracion = answers.get("valoracion", "")
    particular_observations = answers.get("particular_observations", "")

    if questionnaire and questionnaire.questions:
        # Dynamic questionnaire path
        sections = _group_questions_by_section(questionnaire.questions)
        summaries = []
        section_idx = 1

        for section_key, questions in sections.items():
            if section_key in ("valoracion", "observaciones"):
                continue
            section_answers = answers.get(section_key, [])
            title = _SECTION_TITLES.get(section_key, section_key.upper().replace("_", " "))
            summary = _build_dynamic_dimension_summary(
                f"{_roman(section_idx)}. {title}",
                questions,
                section_answers,
            )
            if summary:
                summaries.append(summary)
                section_idx += 1

        dimensions_summary = "".join(summaries)
    else:
        # Backward compatibility: hardcoded arrays
        pedagogical_summary = _build_dimension_summary(
            "I. COMPORTAMIENTO PEDAGÓGICO",
            PEDAGOGICAL_QUESTIONS,
            answers.get("pedagogical", []),
            FREQUENCY_MAP,
        )
        socioemotional_summary = _build_dimension_summary(
            "II. COMPORTAMIENTO SOCIOEMOCIONAL",
            SOCIOEMOTIONAL_QUESTIONS,
            answers.get("socioemotional", []),
            FREQUENCY_MAP,
        )
        content_summary = _build_dimension_summary(
            "III. DOMINIO DE CONTENIDOS",
            CONTENT_INDICATORS,
            answers.get("content", []),
            CONTENT_LEVEL_MAP,
        )
        dimensions_summary = f"{pedagogical_summary}{socioemotional_summary}{content_summary}"

    # Observaciones particulares
    particular_section = ""
    if particular_observations:
        particular_section = f"\nOBSERVACIONES PARTICULARES:\n{particular_observations}\n"

    # Asistencia (si se incluye y supera el 30%)
    attendance_section = ""
    if attendance and attendance.get("include"):
        total_classes = attendance.get("total_classes", 0)
        absences = attendance.get("absences", 0)
        if total_classes > 0 and (absences / total_classes) > 0.30:
            pct = (absences / total_classes) * 100
            attendance_section = f"""\n**ASISTENCIA:** El alumno registra {absences} ausencias de {total_classes} clases totales ({pct:.1f}%).
Esto representa una inasistencia significativa que afecta su trayectoria.
Recordar que la asistencia mínima requerida es del 75%.\n"""

    return f"""GENERÁ UN INFORME DE AVANCE PARA EL SIGUIENTE ALUMNO:

---

DATOS DEL ALUMNO:
- Nombre: {student.nombre_completo}
- Curso: {student.curso}
- Lista Nº: {student.lista_numero}

RESUMEN DE ASISTENCIA:
- Total Presentes: {student.total_presentes}
- Presentes Excelentes: {student.presentes_exc}
- Tarde: {student.tarde}
- Total Ausencias: {student.total_ausencias}
- Inasistencias seguidas: {student.inasistencias_seguidas}

OBSERVACIONES DE CLASE:
{observations_summary}

CONTENIDOS DESARROLLADOS DEL CURSO:
{course_contents}

{f"VALORACIÓN PRELIMINAR: {valoracion}\n\n" if valoracion else ""}{dimensions_summary}{particular_section}{attendance_section}
---

INSTRUCCIONES:
- Escribí el informe en primera persona ("Observo que...", "Noto que...", "Registro que...")
- NO lo dirijas a la familia
- Sé conciso, entre {variant.word_count_target} palabras
- Soná natural, como un docente humano
"""


def _build_observations_summary(observaciones) -> str:
    if not observaciones:
        return "No hay observaciones registradas."

    lines = []
    for obs in observaciones:
        if obs.comentario:
            lines.append(f"- {obs.fecha}: {obs.codigo} | {obs.comentario}")
        else:
            lines.append(f"- {obs.fecha}: {obs.codigo}")
    return "\n".join(lines)


def _build_dimension_summary(title: str, items: List[str], answers: List, mapping: Dict) -> str:
    lines = [f"{title}:"]
    has_any = False
    for i, item in enumerate(items):
        if i < len(answers) and answers[i] is not None and answers[i] != 0:
            value = mapping.get(answers[i], str(answers[i]))
            lines.append(f"- {item} → {value}")
            has_any = True
    if not has_any:
        return ""  # No incluir la seccion si no hay respuestas validas
    return "\n".join(lines) + "\n"
