import tempfile
from pathlib import Path

import pytest

from student_parser import parse_student_file, Observation, Student


SAMPLE_MARKDOWN = """# Aguilar Carus, SANTINO

**Curso:** 1ro B ESN5 | **Lista Nº:** 1

---

## 📝 Observaciones

| Fecha | Código | Tipo | Comentario |
|-------|--------|------|------------|
| | | | |
| 2026-04-22 | P | Presente | Conversó y molestó toda la clase (no prestó atención) |
| 2026-04-23 | P-EXC | Presente excelente | Excelente trabajo en grupo |
| 2026-04-24 | A | Ausente | |

### Leyenda:
- **P** = Presente
- **A** = Ausente
- **P-EXC** = Presente excelente trabajo
- **P-x** = Presente sin material/tarea

---

## 📊 Resumen

- **Total Presentes:** 1
- **P-EXC:** 1
- **Tarde:** 0
- **Total Ausencias:** 1
- **Inasistencias seguidas:** 1
- **Última actualización:** 2026-04-24
"""


def test_parse_student_file():
    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".md", delete=False, encoding="utf-8"
    ) as f:
        f.write(SAMPLE_MARKDOWN)
        temp_path = Path(f.name)

    try:
        student = parse_student_file(temp_path)

        assert student.nombre_completo == "Aguilar Carus, SANTINO"
        assert student.lista_numero == 1
        assert student.curso == "1ro B ESN5"
        assert student.total_ausencias == 1
        assert student.total_presentes == 1
        assert student.presentes_exc == 1
        assert student.tarde == 0
        assert student.inasistencias_seguidas == 1
        assert student.ultima_actualizacion == "2026-04-24"

        assert len(student.observaciones) == 3

        obs1 = student.observaciones[0]
        assert obs1.fecha == "2026-04-22"
        assert obs1.codigo == "P"
        assert obs1.tipo == "Presente"
        assert obs1.comentario == "Conversó y molestó toda la clase (no prestó atención)"

        obs2 = student.observaciones[1]
        assert obs2.codigo == "P-EXC"
        assert obs2.tipo == "Presente excelente"
        assert obs2.comentario == "Excelente trabajo en grupo"

        obs3 = student.observaciones[2]
        assert obs3.codigo == "A"
        assert obs3.tipo == "Ausente"
        assert obs3.comentario == ""

    finally:
        temp_path.unlink()


def test_parse_student_file_argentine_date_format():
    """Verifica que el parser maneje fechas en formato dd/mm/aaaa."""
    markdown = """# Martinez, ALMA

**Curso:** 3ro B ESN5 | **Lista Nº:** 12

---

## 📝 Observaciones

| Fecha | Código | Tipo | Comentario |
|-------|--------|------|------------|
| | | | |
| 16/3/2026 | A | Ausente | |
| 20/3/2026 | A | Ausente | |
| 27/3/2026 | P | Presente | |
| 30/3/2026 | P | Presente | |
| 6/4/2026 | A | Ausente | |
| 10/4/2026 | T | Tarde | |
| 13/4/2026 | P | Presente | |
| 17/4/2026 | P-EXC | Presente excelente | Excelente trabajo |
| 20/4/2026 | A | Ausente | |
| 24/4/2026 | P-EXC | Presente excelente | Excelente trabajo |

### Leyenda:
- **P** = Presente
- **A** = Ausente
- **P-EXC** = Presente excelente trabajo
- **P-x** = Presente sin material/tarea
- **T** = Tarde

---

## 📊 Resumen

- **Total Presentes:** 5
- **P-EXC:** 2
- **Tarde:** 1
- **Total Ausencias:** 4
- **Inasistencias seguidas:** 2
- **Última actualización:** 24/4/2026
"""
    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".md", delete=False, encoding="utf-8"
    ) as f:
        f.write(markdown)
        temp_path = Path(f.name)

    try:
        student = parse_student_file(temp_path)
        assert student.nombre_completo == "Martinez, ALMA"
        assert student.lista_numero == 12
        assert student.curso == "3ro B ESN5"
        assert len(student.observaciones) == 10

        # Verificar primera y última fecha en formato argentino
        assert student.observaciones[0].fecha == "16/3/2026"
        assert student.observaciones[-1].fecha == "24/4/2026"

        # Verificar resumen
        assert student.total_presentes == 5
        assert student.presentes_exc == 2
        assert student.tarde == 1
        assert student.total_ausencias == 4
        assert student.inasistencias_seguidas == 2
        assert student.ultima_actualizacion == "24/4/2026"
    finally:
        temp_path.unlink()


def test_parse_empty_observations():
    markdown = """# Pérez, JUAN

**Curso:** 2do A ESN5 | **Lista Nº:** 5

---

## 📝 Observaciones

| Fecha | Código | Tipo | Comentario |
|-------|--------|------|------------|
| | | | |

### Leyenda:
- **P** = Presente

---

## 📊 Resumen

- **Total Presentes:** 0
- **P-EXC:** 0
- **Tarde:** 0
- **Total Ausencias:** 0
- **Inasistencias seguidas:** 0
- **Última actualización:** 2026-04-25
"""
    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".md", delete=False, encoding="utf-8"
    ) as f:
        f.write(markdown)
        temp_path = Path(f.name)

    try:
        student = parse_student_file(temp_path)
        assert student.nombre_completo == "Pérez, JUAN"
        assert student.lista_numero == 5
        assert len(student.observaciones) == 0
    finally:
        temp_path.unlink()
