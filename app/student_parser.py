import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List


def calculate_attendance_from_observations(observaciones: List) -> dict:
    """Calcula totales de asistencia a partir de las observaciones."""
    total_presentes = 0
    presentes_exc = 0
    tarde = 0
    total_ausencias = 0
    inasistencias_seguidas = 0
    max_seguidas = 0
    seguidas_actual = 0

    for obs in observaciones:
        codigo = (obs.codigo if hasattr(obs, "codigo") else obs.get("codigo", "")).strip().upper()
        if codigo == "P":
            total_presentes += 1
            seguidas_actual = 0
        elif codigo == "P-EXC":
            total_presentes += 1
            presentes_exc += 1
            seguidas_actual = 0
        elif codigo == "P-X":
            total_presentes += 1
            seguidas_actual = 0
        elif codigo == "T":
            total_presentes += 1
            tarde += 1
            seguidas_actual = 0
        elif codigo == "A":
            total_ausencias += 1
            seguidas_actual += 1
            if seguidas_actual > max_seguidas:
                max_seguidas = seguidas_actual
        else:
            seguidas_actual = 0

    inasistencias_seguidas = max_seguidas

    return {
        "total_presentes": total_presentes,
        "presentes_exc": presentes_exc,
        "tarde": tarde,
        "total_ausencias": total_ausencias,
        "inasistencias_seguidas": inasistencias_seguidas,
    }


@dataclass
class Observation:
    """Representa una observación de clase de un alumno."""
    fecha: str
    codigo: str
    tipo: str
    comentario: str


@dataclass
class Student:
    """Representa los datos estructurados de un alumno."""
    nombre_completo: str
    lista_numero: int
    curso: str
    observaciones: List[Observation] = field(default_factory=list)
    total_ausencias: int = 0
    total_presentes: int = 0
    presentes_exc: int = 0
    tarde: int = 0
    inasistencias_seguidas: int = 0
    ultima_actualizacion: str = ""


def parse_student_file(filepath: Path) -> Student:
    """Parsea un archivo markdown de alumno y devuelve un objeto Student."""
    content = filepath.read_text(encoding="utf-8")

    # Extraer nombre del header (# Apellido, NOMBRE)
    nombre_match = re.search(r"^#\s+(.+)", content, re.MULTILINE)
    nombre = nombre_match.group(1).strip() if nombre_match else filepath.stem

    # Extraer curso y lista número
    curso_match = re.search(r"\*\*Curso:\*\*\s+(.+?)\s*\|", content)
    curso = curso_match.group(1).strip() if curso_match else ""

    lista_match = re.search(r"\*\*Lista Nº:\*\*\s+(\d+)", content)
    lista_numero = int(lista_match.group(1)) if lista_match else 0

    # Extraer observaciones de la tabla
    observaciones = _parse_observations_table(content)

    # Recalcular asistencia desde observaciones (ignorar Resumen potencialmente desactualizado)
    stats = calculate_attendance_from_observations(observaciones)

    # Extraer última actualización del Resumen
    ultima_act_match = re.search(r"\*\*Última actualización:\*\*\s*(.+)", content)
    ultima_actualizacion = ultima_act_match.group(1).strip() if ultima_act_match else ""

    return Student(
        nombre_completo=nombre,
        lista_numero=lista_numero,
        curso=curso,
        observaciones=observaciones,
        total_ausencias=stats["total_ausencias"],
        total_presentes=stats["total_presentes"],
        presentes_exc=stats["presentes_exc"],
        tarde=stats["tarde"],
        inasistencias_seguidas=stats["inasistencias_seguidas"],
        ultima_actualizacion=ultima_actualizacion,
    )


def _extract_int(content: str, pattern: str) -> int:
    match = re.search(pattern, content)
    return int(match.group(1)) if match else 0


def _parse_observations_table(content: str) -> List[Observation]:
    """Extrae las observaciones de la tabla markdown de forma robusta."""
    observaciones = []

    # Encontrar la sección de observaciones usando expresiones regulares flexibles
    obs_match = re.search(r"##\s*📝\s*Observaciones(.*?)(?:##|###\s*Leyenda)", content, re.DOTALL | re.IGNORECASE)
    if not obs_match:
        # Intento alternativo si no está la leyenda
        obs_match = re.search(r"##\s*📝\s*Observaciones(.*)", content, re.DOTALL | re.IGNORECASE)
        if not obs_match:
            return observaciones

    table_section = obs_match.group(1)
    
    # Extraer todas las filas de la tabla (líneas que empiezan y terminan con '|')
    for line in table_section.split("\n"):
        line = line.strip()
        if not line.startswith("|") or not line.endswith("|"):
            continue

        # Separar celdas y limpiar espacios, ignorando los bordes vacíos
        parts = [p.strip() for p in line.split("|")[1:-1]]
        
        if len(parts) >= 4:
            first_cell = parts[0]
            # Ignorar líneas de separación (ej. |---|---|) y cabeceras
            if set(first_cell) <= set("-:| "):
                continue
            if first_cell.lower() in ("fecha", "date"):
                continue

            fecha, codigo, tipo, comentario = parts[0], parts[1], parts[2], parts[3]
            
            # Ignorar filas vacías donde fecha y comentario están vacíos
            if not fecha and not comentario:
                continue

            observaciones.append(
                Observation(
                    fecha=fecha,
                    codigo=codigo,
                    tipo=tipo,
                    comentario=comentario,
                )
            )

    return observaciones
