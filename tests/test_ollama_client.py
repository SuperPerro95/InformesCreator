from unittest.mock import patch, MagicMock
import tempfile
import os

from ollama_client import check_ollama_server, get_available_models, generate_report
from config import Config


def test_check_ollama_server_success():
    with patch("requests.get") as mock_get:
        mock_get.return_value = MagicMock(status_code=200)
        assert check_ollama_server("http://localhost:11434") is True


def test_check_ollama_server_failure():
    import requests
    with patch("requests.get") as mock_get:
        mock_get.side_effect = requests.exceptions.ConnectionError("Connection refused")
        assert check_ollama_server("http://localhost:11434") is False


def test_get_available_models():
    with patch("requests.get") as mock_get:
        mock_get.return_value = MagicMock(
            status_code=200,
            json=lambda: {
                "models": [
                    {"name": "gemma3"},
                    {"name": "llama3"},
                ]
            },
        )
        models = get_available_models("http://localhost:11434")
        assert "gemma3" in models
        assert "llama3" in models


def test_generate_report_success():
    with tempfile.TemporaryDirectory() as tmpdir:
        os.chdir(tmpdir)
        with patch("requests.post") as mock_post:
            mock_post.return_value = MagicMock(
                status_code=200,
                raise_for_status=lambda: None,
                json=lambda: {
                    "message": {"content": "Informe generado correctamente."}
                },
            )
            config = Config()
            result = generate_report("system", "user", config)
            assert result == "Informe generado correctamente."


def test_generate_report_connection_error():
    import requests
    with tempfile.TemporaryDirectory() as tmpdir:
        os.chdir(tmpdir)
        with patch("requests.post") as mock_post:
            mock_post.side_effect = requests.exceptions.ConnectionError("Connection refused")
            config = Config()
            result = generate_report("system", "user", config)
            assert result is None
