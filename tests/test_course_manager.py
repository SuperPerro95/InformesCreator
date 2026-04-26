import tempfile
from pathlib import Path

from course_manager import (
    discover_courses,
    get_course_contents,
    save_course_contents,
    get_students,
    create_student_template,
)


def test_discover_courses():
    with tempfile.TemporaryDirectory() as tmpdir:
        base = Path(tmpdir)
        (base / "1ro A").mkdir()
        (base / "1ro B").mkdir()
        (base / "archivo.txt").write_text("no es curso")

        cursos = discover_courses(base)
        assert "1ro A" in cursos
        assert "1ro B" in cursos
        assert "archivo.txt" not in cursos


def test_save_and_get_course_contents():
    with tempfile.TemporaryDirectory() as tmpdir:
        import os
        os.chdir(tmpdir)
        save_course_contents("1ro B ESN5", "Present simple, Past simple")
        contenidos = get_course_contents("1ro B ESN5")
        assert contenidos == "Present simple, Past simple"


def test_get_students():
    with tempfile.TemporaryDirectory() as tmpdir:
        base = Path(tmpdir)
        alumnos_dir = base / "Alumnos"
        alumnos_dir.mkdir()

        markdown = """# Aguilar Carus, SANTINO
**Curso:** 1ro B ESN5 | **Lista Nº:** 1
---
## 📝 Observaciones
| Fecha | Código | Tipo | Comentario |
|-------|--------|------|------------|
| 2026-04-22 | P | Presente | Bien |
### Leyenda:
- **P** = Presente
---
## 📊 Resumen
- **Total Presentes:** 1
- **P-EXC:** 0
- **Tarde:** 0
- **Total Ausencias:** 0
- **Inasistencias seguidas:** 0
- **Última actualización:** 2026-04-22
"""
        (alumnos_dir / "Aguilar_Carus_SANTINO.md").write_text(markdown, encoding="utf-8")

        students = get_students(base)
        assert len(students) == 1
        assert students[0].nombre_completo == "Aguilar Carus, SANTINO"


def test_create_student_template():
    template = create_student_template("1ro B ESN5", "García, María", 3)
    assert "# García, María" in template
    assert "**Curso:** 1ro B ESN5 | **Lista Nº:** 3" in template
    assert "## 📝 Observaciones" in template
    assert "## 📊 Resumen" in template
