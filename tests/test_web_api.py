import os
import tempfile
from pathlib import Path
from unittest.mock import patch, MagicMock

import pytest
from fastapi.testclient import TestClient

# Asegurar que la raiz del proyecto este en el path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from web.main import app
from config import Config

client = TestClient(app)

SAMPLE_STUDENT_MD = """# Aguilar Carus, SANTINO

**Curso:** 1ro B ESN5 | **Lista Nº:** 1

---

## 📝 Observaciones

| Fecha | Código | Tipo | Comentario |
|-------|--------|------|------------|
| | | | |
| 2026-04-22 | P | Presente | Conversó y molestó toda la clase |
| 2026-04-23 | P-EXC | Presente excelente | Excelente trabajo en grupo |
| 2026-04-24 | A | Ausente | |

### Leyenda:
- **P** = Presente
- **A** = Ausente

---

## 📊 Resumen

- **Total Presentes:** 1
- **P-EXC:** 1
- **Tarde:** 0
- **Total Ausencias:** 1
- **Inasistencias seguidas:** 1
- **Última actualización:** 2026-04-24
"""


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_ollama_status():
    with patch("web.api.routes.is_ollama_installed", return_value=True), \
         patch("web.api.routes.is_ollama_running", return_value=True), \
         patch("web.api.routes.get_available_models", return_value=["gemma3"]):
        response = client.get("/api/ollama/status")
        assert response.status_code == 200
        data = response.json()
        assert data["installed"] is True
        assert data["running"] is True
        assert "gemma3" in data["models"]


def test_ollama_models():
    with patch("web.api.routes.get_available_models", return_value=["gemma3", "llama3"]):
        response = client.get("/api/ollama/models")
        assert response.status_code == 200
        assert "gemma3" in response.json()["models"]


def test_list_courses():
    with tempfile.TemporaryDirectory() as tmpdir:
        # Crear estructura de cursos
        (Path(tmpdir) / "1ro B ESN5" / "Alumnos").mkdir(parents=True)
        (Path(tmpdir) / "2do A ESN5" / "Alumnos").mkdir(parents=True)

        with patch("web.api.routes.config") as mock_config:
            mock_config.base_path = Path(tmpdir)
            response = client.get("/api/courses")
            assert response.status_code == 200
            courses = response.json()["courses"]
            assert "1ro B ESN5" in courses
            assert "2do A ESN5" in courses


def test_list_students():
    with tempfile.TemporaryDirectory() as tmpdir:
        course_dir = Path(tmpdir) / "1ro B ESN5" / "Alumnos"
        course_dir.mkdir(parents=True)
        (course_dir / "Aguilar_Carus_SANTINO.md").write_text(SAMPLE_STUDENT_MD, encoding="utf-8")

        with patch("web.api.routes.config") as mock_config:
            mock_config.base_path = Path(tmpdir)
            response = client.get("/api/courses/1ro%20B%20ESN5/students")
            assert response.status_code == 200
            students = response.json()["students"]
            assert len(students) == 1
            assert students[0]["nombre_completo"] == "Aguilar Carus, SANTINO"


def test_get_contents():
    with tempfile.TemporaryDirectory() as tmpdir:
        from course_manager import save_course_contents
        os.chdir(tmpdir)
        save_course_contents("1ro B ESN5", "Present simple, Past simple")

        with patch("web.api.routes.config") as mock_config:
            mock_config.base_path = Path(tmpdir)
            response = client.get("/api/courses/1ro%20B%20ESN5/contents")
            assert response.status_code == 200
            assert response.json()["contents"] == "Present simple, Past simple"

        os.chdir("/")


def test_post_contents():
    with tempfile.TemporaryDirectory() as tmpdir:
        os.chdir(tmpdir)
        with patch("web.api.routes.config") as mock_config:
            mock_config.base_path = Path(tmpdir)
            response = client.post(
                "/api/courses/1ro%20B%20ESN5/contents",
                json={"contents": "Vocabulary, Grammar"}
            )
            assert response.status_code == 200
            assert response.json()["ok"] is True
        os.chdir("/")


def test_get_student():
    with tempfile.TemporaryDirectory() as tmpdir:
        course_dir = Path(tmpdir) / "1ro B ESN5" / "Alumnos"
        course_dir.mkdir(parents=True)
        (course_dir / "Aguilar_Carus_SANTINO.md").write_text(SAMPLE_STUDENT_MD, encoding="utf-8")

        with patch("web.api.routes.config") as mock_config:
            mock_config.base_path = Path(tmpdir)
            response = client.get("/api/students/1ro%20B%20ESN5/Aguilar_Carus_SANTINO.md")
            assert response.status_code == 200
            data = response.json()
            assert data["nombre_completo"] == "Aguilar Carus, SANTINO"
            assert data["lista_numero"] == 1
            assert len(data["observaciones"]) == 3


def test_list_variants():
    response = client.get("/api/variants")
    assert response.status_code == 200
    variants = response.json()
    assert len(variants) >= 3
    ids = [v["id"] for v in variants]
    assert "A" in ids
    assert "B" in ids
    assert "C" in ids


def test_generate_report():
    with tempfile.TemporaryDirectory() as tmpdir:
        course_dir = Path(tmpdir) / "1ro B ESN5" / "Alumnos"
        course_dir.mkdir(parents=True)
        (course_dir / "Aguilar_Carus_SANTINO.md").write_text(SAMPLE_STUDENT_MD, encoding="utf-8")

        os.chdir(tmpdir)
        with patch("web.api.routes.config") as mock_config, \
             patch("web.api.routes.generate_report", return_value="SANTINO presenta trayectoria educativa en proceso."):
            mock_config.base_path = Path(tmpdir)
            mock_config.model = "gemma3"
            mock_config.output_dir = Path(tmpdir) / "Informes"
            mock_config.ollama_url = "http://localhost:11434"

            response = client.post("/api/reports/generate", json={
                "course": "1ro B ESN5",
                "filename": "Aguilar_Carus_SANTINO.md",
                "contents": "Present simple, Past simple",
                "answers": {
                    "valoracion": "TEP",
                    "pedagogical": [3, 2, 3, 3, 2, 3],
                    "socioemotional": [4, 3, 3, 4, 3, 3],
                    "content": [2, 2, 3, 2, 2],
                    "particular_observations": "Muy participativo"
                },
                "variant_id": "A",
                "model": "gemma3"
            })
            assert response.status_code == 200
            data = response.json()
            assert "SANTINO" in data["report_content"]
            assert data["saved_path"] != ""
        os.chdir("/")


def test_generate_report_invalid_variant():
    with tempfile.TemporaryDirectory() as tmpdir:
        course_dir = Path(tmpdir) / "Test" / "Alumnos"
        course_dir.mkdir(parents=True)
        (course_dir / "test.md").write_text("# Test", encoding="utf-8")

        with patch("web.api.routes.config") as mock_config:
            mock_config.base_path = Path(tmpdir)
            response = client.post("/api/reports/generate", json={
                "course": "Test",
                "filename": "test.md",
                "contents": "",
                "answers": {
                    "valoracion": "TEP",
                    "pedagogical": [3, 3, 3, 3, 3, 3],
                    "socioemotional": [3, 3, 3, 3, 3, 3],
                    "content": [2, 2, 2, 2, 2],
                    "particular_observations": ""
                },
                "variant_id": "INVALID",
                "model": "gemma3"
            })
            assert response.status_code == 400


def test_config_get():
    with patch("web.api.routes.config") as mock_config:
        mock_config.base_path = Path("/tmp/test")
        mock_config.ollama_url = "http://localhost:11434"
        mock_config.model = "gemma3"
        mock_config.output_dir = Path("/tmp/Informes")
        mock_config.default_variant = "A"
        response = client.get("/api/config")
        assert response.status_code == 200
        data = response.json()
        assert data["model"] == "gemma3"
        assert data["default_variant"] == "A"


def test_config_post():
    with patch("web.api.routes.config") as mock_config:
        response = client.post("/api/config", json={"model": "llama3"})
        assert response.status_code == 200
        assert response.json()["ok"] is True
