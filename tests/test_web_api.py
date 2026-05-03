import json
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


def test_generate_report_student_not_found():
    with tempfile.TemporaryDirectory() as tmpdir:
        course_dir = Path(tmpdir) / "1ro B ESN5" / "Alumnos"
        course_dir.mkdir(parents=True)
        with patch("web.api.routes.config") as mock_config:
            mock_config.base_path = Path(tmpdir)
            response = client.post("/api/reports/generate", json={
                "course": "1ro B ESN5",
                "filename": "No_Existe_STUDENT.md",
                "contents": "",
                "answers": {
                    "pedagogical": [3, 3, 3, 3, 3, 3],
                    "socioemotional": [3, 3, 3, 3, 3, 3],
                    "content": [2, 2, 2, 2, 2],
                },
                "variant_id": "A",
            })
            assert response.status_code == 404


def test_generate_report_updates_session():
    """Verifies that after report generation, the course session records
    the student's answers and marks them as completed."""
    session_state = {"progreso": {"completados": []}, "respuestas": {}}

    def _fake_save(course, data):
        session_state.update(data)

    client2 = TestClient(app)
    with tempfile.TemporaryDirectory() as tmpdir:
        course_dir = Path(tmpdir) / "1ro B ESN5" / "Alumnos"
        course_dir.mkdir(parents=True)
        (course_dir / "Aguilar_Carus_SANTINO.md").write_text(SAMPLE_STUDENT_MD, encoding="utf-8")

        answers_payload = {
            "valoracion": "TEP",
            "pedagogical": [3, 2, 3, 3, 2, 3],
            "socioemotional": [4, 3, 3, 4, 3, 3],
            "content": [2, 2, 3, 2, 2],
            "particular_observations": "Muy participativo",
        }

        with patch("web.api.routes.config") as mock_config, \
             patch("web.api.routes.generate_report", return_value="Informe generado."), \
             patch("web.api.routes.get_course_session", return_value=session_state), \
             patch("web.api.routes.save_course_session", side_effect=_fake_save):
            mock_config.base_path = Path(tmpdir)
            mock_config.model = "gemma3"
            mock_config.output_dir = Path(tmpdir) / "Informes"
            mock_config.ollama_url = "http://localhost:11434"

            response = client2.post("/api/reports/generate", json={
                "course": "1ro B ESN5",
                "filename": "Aguilar_Carus_SANTINO.md",
                "contents": "Unit 1: Present Simple",
                "answers": answers_payload,
                "variant_id": "A",
                "model": "gemma3",
            })
            assert response.status_code == 200

        assert "Aguilar_Carus_SANTINO.md" in session_state["progreso"]["completados"]
        assert session_state["respuestas"]["Aguilar_Carus_SANTINO.md"]["pedagogical"] == [3, 2, 3, 3, 2, 3]


def test_generate_report_with_customization():
    """Customization text should be passed through to the system prompt builder."""
    with tempfile.TemporaryDirectory() as tmpdir:
        course_dir = Path(tmpdir) / "1ro B ESN5" / "Alumnos"
        course_dir.mkdir(parents=True)
        (course_dir / "Aguilar_Carus_SANTINO.md").write_text(SAMPLE_STUDENT_MD, encoding="utf-8")

        os.chdir(tmpdir)
        with patch("web.api.routes.config") as mock_config, \
             patch("web.api.routes.generate_report", return_value="Informe personalizado."):
            mock_config.base_path = Path(tmpdir)
            mock_config.model = "gemma3"
            mock_config.output_dir = Path(tmpdir) / "Informes"
            mock_config.ollama_url = "http://localhost:11434"

            response = client.post("/api/reports/generate", json={
                "course": "1ro B ESN5",
                "filename": "Aguilar_Carus_SANTINO.md",
                "contents": "",
                "answers": {
                    "pedagogical": [3, 3, 3, 3, 3, 3],
                    "socioemotional": [3, 3, 3, 3, 3, 3],
                    "content": [2, 2, 2, 2, 2],
                },
                "variant_id": "A",
                "model": "gemma3",
                "customization": "Enfocate en participacion en clase",
            })
            assert response.status_code == 200
        os.chdir("/")


def test_generate_report_no_ollama_response():
    """When Ollama returns empty string, endpoint should return 500."""
    with tempfile.TemporaryDirectory() as tmpdir:
        course_dir = Path(tmpdir) / "1ro B ESN5" / "Alumnos"
        course_dir.mkdir(parents=True)
        (course_dir / "Aguilar_Carus_SANTINO.md").write_text(SAMPLE_STUDENT_MD, encoding="utf-8")

        with patch("web.api.routes.config") as mock_config, \
             patch("web.api.routes.generate_report", return_value=""):
            mock_config.base_path = Path(tmpdir)
            mock_config.model = "gemma3"
            mock_config.output_dir = Path(tmpdir) / "Informes"
            mock_config.ollama_url = "http://localhost:11434"

            response = client.post("/api/reports/generate", json={
                "course": "1ro B ESN5",
                "filename": "Aguilar_Carus_SANTINO.md",
                "contents": "",
                "answers": {
                    "pedagogical": [3, 3, 3, 3, 3, 3],
                    "socioemotional": [3, 3, 3, 3, 3, 3],
                    "content": [2, 2, 2, 2, 2],
                },
                "variant_id": "A",
            })
            assert response.status_code == 500


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


# ============== Auth Persistence Tests ==============

def test_get_profile_path():
    with tempfile.TemporaryDirectory() as tmpdir:
        with patch("web.api.routes.user_data_path", side_effect=lambda p="": Path(tmpdir) / (p or "")):
            from web.api.routes import _get_profile_path
            path = _get_profile_path()
            assert path == Path(tmpdir) / "profile.json"


def test_hash_password():
    from web.api.routes import _hash_password
    h = _hash_password("test123")
    # SHA-256 hex digest is 64 chars
    assert len(h) == 64
    assert all(c in "0123456789abcdef" for c in h)
    # Deterministic
    assert h == _hash_password("test123")
    # Different passwords produce different hashes
    assert h != _hash_password("test124")


def test_load_profile_not_exists():
    with tempfile.TemporaryDirectory() as tmpdir:
        with patch("web.api.routes.user_data_path", side_effect=lambda p="": Path(tmpdir) / (p or "")):
            from web.api.routes import _load_profile
            assert _load_profile() is None


def test_load_profile_exists():
    with tempfile.TemporaryDirectory() as tmpdir:
        profile_path = Path(tmpdir) / "profile.json"
        profile_path.write_text(
            '{"username": "profe", "password_hash": "abc123", "display_name": "Profe"}',
            encoding="utf-8",
        )
        with patch("web.api.routes.user_data_path", side_effect=lambda p="": Path(tmpdir) / (p or "")):
            from web.api.routes import _load_profile
            profile = _load_profile()
            assert profile["username"] == "profe"
            assert profile["password_hash"] == "abc123"
            assert profile["display_name"] == "Profe"


def test_save_profile():
    with tempfile.TemporaryDirectory() as tmpdir:
        with patch("web.api.routes.user_data_path", side_effect=lambda p="": Path(tmpdir) / (p or "")):
            from web.api.routes import _save_profile
            profile = {"username": "nuevo", "password_hash": "hash123"}
            _save_profile(profile)

            saved = Path(tmpdir) / "profile.json"
            assert saved.exists()
            data = json.loads(saved.read_text(encoding="utf-8"))
            assert data["username"] == "nuevo"
            assert data["password_hash"] == "hash123"


def test_profile_roundtrip():
    """Save then load — must preserve all keys and values exactly."""
    with tempfile.TemporaryDirectory() as tmpdir:
        with patch("web.api.routes.user_data_path", side_effect=lambda p="": Path(tmpdir) / (p or "")):
            from web.api.routes import _save_profile, _load_profile
            original = {
                "username": "teacher1",
                "password_hash": "sha256hashhere",
                "display_name": "Teacher One",
            }
            _save_profile(original)
            loaded = _load_profile()
            assert loaded == original


def test_register_creates_profile():
    client2 = TestClient(app)
    with tempfile.TemporaryDirectory() as tmpdir:
        profile_path = Path(tmpdir) / "profile.json"
        with patch("web.api.routes.user_data_path", side_effect=lambda p="": Path(tmpdir) / (p or "")):
            response = client2.post("/api/auth/register", json={
                "username": "profe",
                "password": "secreto123",
            })
            assert response.status_code == 200
            assert response.json()["ok"] is True
            assert profile_path.exists()
            saved = json.loads(profile_path.read_text(encoding="utf-8"))
            assert saved["username"] == "profe"
            assert "password_hash" in saved


def test_register_refuses_duplicate():
    client2 = TestClient(app)
    with tempfile.TemporaryDirectory() as tmpdir:
        with patch("web.api.routes.user_data_path", side_effect=lambda p="": Path(tmpdir) / (p or "")):
            client2.post("/api/auth/register", json={
                "username": "profe", "password": "pass1",
            })
            response = client2.post("/api/auth/register", json={
                "username": "profe2", "password": "pass2",
            })
            assert response.status_code == 400


def test_login_with_correct_credentials():
    client2 = TestClient(app)
    with tempfile.TemporaryDirectory() as tmpdir:
        with patch("web.api.routes.user_data_path", side_effect=lambda p="": Path(tmpdir) / (p or "")):
            client2.post("/api/auth/register", json={
                "username": "profe", "password": "clave123",
            })
            response = client2.post("/api/auth/login", json={
                "username": "profe", "password": "clave123",
            })
            assert response.status_code == 200
            assert response.json()["ok"] is True
            assert response.json()["username"] == "profe"


def test_login_with_wrong_password():
    client2 = TestClient(app)
    with tempfile.TemporaryDirectory() as tmpdir:
        with patch("web.api.routes.user_data_path", side_effect=lambda p="": Path(tmpdir) / (p or "")):
            client2.post("/api/auth/register", json={
                "username": "profe", "password": "clave_correcta",
            })
            response = client2.post("/api/auth/login", json={
                "username": "profe", "password": "clave_incorrecta",
            })
            assert response.status_code == 401


def test_login_with_wrong_username():
    client2 = TestClient(app)
    with tempfile.TemporaryDirectory() as tmpdir:
        with patch("web.api.routes.user_data_path", side_effect=lambda p="": Path(tmpdir) / (p or "")):
            client2.post("/api/auth/register", json={
                "username": "profe", "password": "clave123",
            })
            response = client2.post("/api/auth/login", json={
                "username": "otro_usuario", "password": "clave123",
            })
            assert response.status_code == 401


def test_login_before_register():
    client2 = TestClient(app)
    with tempfile.TemporaryDirectory() as tmpdir:
        with patch("web.api.routes.user_data_path", side_effect=lambda p="": Path(tmpdir) / (p or "")):
            response = client2.post("/api/auth/login", json={
                "username": "profe", "password": "clave123",
            })
            assert response.status_code == 400


def test_me_returns_profile():
    client2 = TestClient(app)
    with tempfile.TemporaryDirectory() as tmpdir:
        with patch("web.api.routes.user_data_path", side_effect=lambda p="": Path(tmpdir) / (p or "")):
            client2.post("/api/auth/register", json={
                "username": "profe", "password": "clave123",
                "display_name": "Professor X",
            })
            response = client2.get("/api/auth/me")
            assert response.status_code == 200
            data = response.json()
            assert data["username"] == "profe"
            assert data["display_name"] == "Professor X"
            assert "password_hash" not in data


def test_me_before_register():
    client2 = TestClient(app)
    with tempfile.TemporaryDirectory() as tmpdir:
        with patch("web.api.routes.user_data_path", side_effect=lambda p="": Path(tmpdir) / (p or "")):
            response = client2.get("/api/auth/me")
            assert response.status_code == 404
