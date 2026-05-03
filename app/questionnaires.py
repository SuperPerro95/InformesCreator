"""Gestión de cuestionarios dinámicos para InformesCreator.

Este módulo provee estructuras de datos, carga/guardado y CRUD
para cuestionarios personalizables, con soporte de versionado.
"""

import json
import uuid
from copy import deepcopy
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from paths import user_data_path


# ===================== Archivos de persistencia =====================

_QUESTIONNAIRES_FILE = user_data_path("questionnaires.json")
_COURSE_QUESTIONNAIRES_FILE = user_data_path("course_questionnaires.json")


# ===================== Estructuras de datos =====================

@dataclass
class Question:
    section: str
    title: str
    text: str
    answer_type: str
    options: List[Any]
    labels: List[str]


@dataclass
class Questionnaire:
    id: str
    name: str
    description: str
    version: int
    created_at: str
    questions: List[Question]


# ===================== Cuestionario por defecto =====================

def _parse_title(text: str) -> str:
    """Extrae el título (texto antes de ':'). Si no hay ':', usa todo el texto."""
    if ":" in text:
        return text.split(":", 1)[0].strip()
    return text.strip()


def _make_default_questions() -> List[Question]:
    """Genera las 19 preguntas exactas de ALL_QUESTIONS en app.js."""
    raw = [
        {
            "section": "valoracion",
            "text": "Valoracion preliminar del alumno",
            "answer_type": "tea_tep_ted",
            "options": ["TEA", "TEP", "TED"],
            "labels": [
                "TEA - Trayectoria Educativa Alcanzada",
                "TEP - Trayectoria Educativa en Proceso",
                "TED - Trayectoria Educativa Discontinua",
            ],
        },
        {
            "section": "pedagogical",
            "text": "Participacion: Interviene de manera pertinente durante las explicaciones o debates?",
            "answer_type": "frequency_4",
            "options": [1, 2, 3, 4],
            "labels": ["1 - NUNCA", "2 - RARA VEZ", "3 - EN OCASIONES", "4 - SIEMPRE"],
        },
        {
            "section": "pedagogical",
            "text": "Seguimiento de consignas: Comprende y ejecuta las instrucciones de trabajo a la primera mencion?",
            "answer_type": "frequency_4",
            "options": [1, 2, 3, 4],
            "labels": ["1 - NUNCA", "2 - RARA VEZ", "3 - EN OCASIONES", "4 - SIEMPRE"],
        },
        {
            "section": "pedagogical",
            "text": "Autonomia: Inicia y avanza en sus tareas sin necesidad de supervision constante?",
            "answer_type": "frequency_4",
            "options": [1, 2, 3, 4],
            "labels": ["1 - NUNCA", "2 - RARA VEZ", "3 - EN OCASIONES", "4 - SIEMPRE"],
        },
        {
            "section": "pedagogical",
            "text": "Organizacion: Trae y mantiene ordenados los materiales necesarios para la clase?",
            "answer_type": "frequency_4",
            "options": [1, 2, 3, 4],
            "labels": ["1 - NUNCA", "2 - RARA VEZ", "3 - EN OCASIONES", "4 - SIEMPRE"],
        },
        {
            "section": "pedagogical",
            "text": "Persistencia: Mantiene el esfuerzo ante una tarea que le resulta dificil o compleja?",
            "answer_type": "frequency_4",
            "options": [1, 2, 3, 4],
            "labels": ["1 - NUNCA", "2 - RARA VEZ", "3 - EN OCASIONES", "4 - SIEMPRE"],
        },
        {
            "section": "pedagogical",
            "text": "Cumplimiento: Entrega las actividades o producciones en los plazos establecidos?",
            "answer_type": "frequency_4",
            "options": [1, 2, 3, 4],
            "labels": ["1 - NUNCA", "2 - RARA VEZ", "3 - EN OCASIONES", "4 - SIEMPRE"],
        },
        {
            "section": "socioemotional",
            "text": "Integracion social: Trabaja de forma colaborativa y armonica con sus companeros?",
            "answer_type": "frequency_4",
            "options": [1, 2, 3, 4],
            "labels": ["1 - NUNCA", "2 - RARA VEZ", "3 - EN OCASIONES", "4 - SIEMPRE"],
        },
        {
            "section": "socioemotional",
            "text": "Gestion del error: Acepta las correcciones o los errores sin mostrar frustracion excesiva o bloqueo?",
            "answer_type": "frequency_4",
            "options": [1, 2, 3, 4],
            "labels": ["1 - NUNCA", "2 - RARA VEZ", "3 - EN OCASIONES", "4 - SIEMPRE"],
        },
        {
            "section": "socioemotional",
            "text": "Comunicacion: Expresa sus necesidades, dudas o desacuerdos de manera respetuosa?",
            "answer_type": "frequency_4",
            "options": [1, 2, 3, 4],
            "labels": ["1 - NUNCA", "2 - RARA VEZ", "3 - EN OCASIONES", "4 - SIEMPRE"],
        },
        {
            "section": "socioemotional",
            "text": "Respeto a las normas: Se ajusta a los acuerdos de convivencia establecidos en el aula?",
            "answer_type": "frequency_4",
            "options": [1, 2, 3, 4],
            "labels": ["1 - NUNCA", "2 - RARA VEZ", "3 - EN OCASIONES", "4 - SIEMPRE"],
        },
        {
            "section": "socioemotional",
            "text": "Empatia: Muestra actitudes de ayuda o respeto hacia las dificultades de los demas?",
            "answer_type": "frequency_4",
            "options": [1, 2, 3, 4],
            "labels": ["1 - NUNCA", "2 - RARA VEZ", "3 - EN OCASIONES", "4 - SIEMPRE"],
        },
        {
            "section": "socioemotional",
            "text": "Nivel de motivacion: Muestra curiosidad o disposicion positiva hacia las actividades propuestas?",
            "answer_type": "frequency_4",
            "options": [1, 2, 3, 4],
            "labels": ["1 - NUNCA", "2 - RARA VEZ", "3 - EN OCASIONES", "4 - SIEMPRE"],
        },
        {
            "section": "content",
            "text": "Explica con sus propias palabras",
            "answer_type": "achievement_3",
            "options": [1, 2, 3],
            "labels": ["1 - No Logrado", "2 - En Proceso", "3 - Logrado"],
        },
        {
            "section": "content",
            "text": "Relaciona con temas previos",
            "answer_type": "achievement_3",
            "options": [1, 2, 3],
            "labels": ["1 - No Logrado", "2 - En Proceso", "3 - Logrado"],
        },
        {
            "section": "content",
            "text": "Aplica en ejercicios practicos",
            "answer_type": "achievement_3",
            "options": [1, 2, 3],
            "labels": ["1 - No Logrado", "2 - En Proceso", "3 - Logrado"],
        },
        {
            "section": "content",
            "text": "Usa terminologia adecuada",
            "answer_type": "achievement_3",
            "options": [1, 2, 3],
            "labels": ["1 - No Logrado", "2 - En Proceso", "3 - Logrado"],
        },
        {
            "section": "content",
            "text": "Justifica sus respuestas",
            "answer_type": "achievement_3",
            "options": [1, 2, 3],
            "labels": ["1 - No Logrado", "2 - En Proceso", "3 - Logrado"],
        },
        {
            "section": "observaciones",
            "text": "Observaciones particulares (opcional)",
            "answer_type": "free_text",
            "options": [],
            "labels": [],
        },
    ]
    return [Question(title=_parse_title(r["text"]), **r) for r in raw]


def get_default_questionnaire() -> Questionnaire:
    """Devuelve el cuestionario por defecto con las 19 preguntas hardcodeadas."""
    return Questionnaire(
        id="default",
        name="Cuestionario estandar",
        description="Cuestionario predeterminado con 19 preguntas distribuidas en 5 secciones.",
        version=1,
        created_at=datetime.now().isoformat(),
        questions=_make_default_questions(),
    )


# ===================== Serialización =====================

def _questionnaire_to_dict(q: Questionnaire) -> dict:
    """Convierte un Questionnaire a dict plano (JSON-serializable)."""
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


def _questionnaire_from_dict(data: dict) -> Questionnaire:
    """Reconstruye un Questionnaire desde dict plano."""
    questions = [
        Question(
            section=q["section"],
            title=q["title"],
            text=q["text"],
            answer_type=q["answer_type"],
            options=q["options"],
            labels=q["labels"],
        )
        for q in data.get("questions", [])
    ]
    return Questionnaire(
        id=data["id"],
        name=data["name"],
        description=data.get("description", ""),
        version=data.get("version", 1),
        created_at=data.get("created_at", datetime.now().isoformat()),
        questions=questions,
    )


# ===================== Persistencia =====================

def load_questionnaires() -> Dict:
    """Lee user_data/questionnaires.json; si no existe, crea el default."""
    if _QUESTIONNAIRES_FILE.exists():
        try:
            with open(_QUESTIONNAIRES_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            pass
    default = get_default_questionnaire()
    data = {
        "questionnaires": {"default": _questionnaire_to_dict(default)},
        "versions": {},
    }
    save_questionnaires(data)
    return data


def save_questionnaires(data: Dict) -> None:
    """Escribe user_data/questionnaires.json."""
    with open(_QUESTIONNAIRES_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)


# ===================== CRUD =====================

def get_questionnaire(qid: str) -> Optional[Questionnaire]:
    """Obtiene un cuestionario por su ID."""
    data = load_questionnaires()
    q_dict = data.get("questionnaires", {}).get(qid)
    if q_dict:
        return _questionnaire_from_dict(q_dict)
    return None


def create_questionnaire(name: str, description: str, questions: List[dict]) -> Questionnaire:
    """Crea un nuevo cuestionario con ID autogenerado."""
    data = load_questionnaires()
    qid = str(uuid.uuid4())
    q = Questionnaire(
        id=qid,
        name=name,
        description=description,
        version=1,
        created_at=datetime.now().isoformat(),
        questions=[
        Question(
            section=qd.get("section", ""),
            title=qd.get("title", _parse_title(qd.get("text", ""))),
            text=qd.get("text", ""),
            answer_type=qd.get("answer_type", "free_text"),
            options=qd.get("options", []),
            labels=qd.get("labels", []),
        )
        for qd in questions
    ],)
    data["questionnaires"][qid] = _questionnaire_to_dict(q)
    save_questionnaires(data)
    return q


def update_questionnaire(qid: str, updates: dict) -> Questionnaire:
    """Actualiza un cuestionario existente, guardando la versión anterior."""
    data = load_questionnaires()
    q_dict = data.get("questionnaires", {}).get(qid)
    if not q_dict:
        raise ValueError(f"Cuestionario no encontrado: {qid}")

    # Guardar versión anterior
    old_version = deepcopy(q_dict)
    versions = data.setdefault("versions", {}).setdefault(qid, [])
    old_version["version_snapshot"] = old_version.get("version", 1)
    versions.append(old_version)

    # Aplicar actualizaciones
    if "name" in updates:
        q_dict["name"] = updates["name"]
    if "description" in updates:
        q_dict["description"] = updates["description"]
    if "questions" in updates:
        q_dict["questions"] = updates["questions"]

    q_dict["version"] = q_dict.get("version", 1) + 1

    data["questionnaires"][qid] = q_dict
    save_questionnaires(data)
    return _questionnaire_from_dict(q_dict)


def delete_questionnaire(qid: str) -> bool:
    """Elimina un cuestionario (no permite borrar el default)."""
    if qid == "default":
        return False
    data = load_questionnaires()
    if qid in data.get("questionnaires", {}):
        del data["questionnaires"][qid]
        if qid in data.get("versions", {}):
            del data["versions"][qid]
        save_questionnaires(data)
        return True
    return False


def duplicate_questionnaire(qid: str, new_name: str) -> Questionnaire:
    """Duplica un cuestionario existente con nuevo nombre."""
    data = load_questionnaires()
    q_dict = data.get("questionnaires", {}).get(qid)
    if not q_dict:
        raise ValueError(f"Cuestionario no encontrado: {qid}")

    new_id = str(uuid.uuid4())
    new_dict = deepcopy(q_dict)
    new_dict["id"] = new_id
    new_dict["name"] = new_name
    new_dict["version"] = 1
    new_dict["created_at"] = datetime.now().isoformat()

    data["questionnaires"][new_id] = new_dict
    save_questionnaires(data)
    return _questionnaire_from_dict(new_dict)


def get_questionnaire_versions(qid: str) -> List[Dict]:
    """Devuelve el historial de versiones de un cuestionario."""
    data = load_questionnaires()
    versions = data.get("versions", {}).get(qid, [])
    return [
        {
            "version": v.get("version_snapshot", v.get("version", 1)),
            "created_at": v.get("created_at", ""),
            "name": v.get("name", ""),
        }
        for v in versions
    ]


def restore_questionnaire_version(qid: str, version: int) -> Questionnaire:
    """Restaura un cuestionario a una versión anterior."""
    data = load_questionnaires()
    versions = data.get("versions", {}).get(qid, [])

    target = None
    for v in versions:
        if v.get("version_snapshot", v.get("version", 1)) == version:
            target = deepcopy(v)
            break

    if not target:
        raise ValueError(f"Versión {version} no encontrada para {qid}")

    # Guardar estado actual como versión antes de restaurar
    current = data.get("questionnaires", {}).get(qid)
    if current:
        current_copy = deepcopy(current)
        current_copy["version_snapshot"] = current_copy.get("version", 1)
        versions.append(current_copy)

    # Restaurar
    target["version"] = target.get("version_snapshot", version)
    data["questionnaires"][qid] = target
    save_questionnaires(data)
    return _questionnaire_from_dict(target)


# ===================== Asignación a cursos =====================

def _load_course_questionnaires() -> Dict[str, str]:
    """Lee el mapeo curso -> cuestionario."""
    if _COURSE_QUESTIONNAIRES_FILE.exists():
        try:
            with open(_COURSE_QUESTIONNAIRES_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            pass
    return {}


def _save_course_questionnaires(mapping: Dict[str, str]) -> None:
    """Escribe el mapeo curso -> cuestionario."""
    with open(_COURSE_QUESTIONNAIRES_FILE, "w", encoding="utf-8") as f:
        json.dump(mapping, f, indent=4, ensure_ascii=False)


def get_course_questionnaire(course_name: str) -> str:
    """Devuelve el ID del cuestionario asignado a un curso (default si no hay)."""
    mapping = _load_course_questionnaires()
    return mapping.get(course_name, "default")


def assign_questionnaire_to_course(course_name: str, qid: str) -> None:
    """Asigna un cuestionario a un curso."""
    mapping = _load_course_questionnaires()
    mapping[course_name] = qid
    _save_course_questionnaires(mapping)
