from pathlib import Path

from student_parser import Student


def save_report(course: str, student: Student, content: str, output_dir: str) -> Path:
    """Guarda el informe generado en un archivo markdown."""
    output_path = Path(output_dir) / course
    output_path.mkdir(parents=True, exist_ok=True)

    # Normalizar nombre de archivo
    safe_name = student.nombre_completo.replace(", ", "_").replace(" ", "_")
    filename = f"Informe_{safe_name}.md"
    filepath = output_path / filename

    report_content = f"""# Informe de Avance: {student.nombre_completo}

**Curso:** {student.curso} | **Lista Nº:** {student.lista_numero}

---

{content}

---

_Generado automáticamente por InformesCreator_
"""

    filepath.write_text(report_content, encoding="utf-8")
    return filepath
