from pathlib import Path
from unittest.mock import patch, MagicMock

from setup_ollama import (
    is_ollama_installed,
    is_ollama_running,
    get_available_models,
    ensure_model_downloaded,
)


def test_is_ollama_installed_true():
    with patch("setup_ollama._find_ollama_executable", return_value="/usr/bin/ollama"):
        assert is_ollama_installed() is True


def test_is_ollama_installed_false():
    with patch("setup_ollama._find_ollama_executable", return_value=None):
        assert is_ollama_installed() is False


def test_is_ollama_installed_windows_path():
    with patch("setup_ollama.sys.platform", "win32"):
        with patch("shutil.which", return_value=None):
            with patch("pathlib.Path.exists", return_value=True):
                assert is_ollama_installed() is True


def test_is_ollama_running_true():
    with patch("requests.get") as mock_get:
        mock_get.return_value = MagicMock(status_code=200)
        assert is_ollama_running("http://localhost:11434") is True


def test_is_ollama_running_false():
    import requests
    with patch("requests.get") as mock_get:
        mock_get.side_effect = requests.exceptions.ConnectionError()
        assert is_ollama_running("http://localhost:11434") is False


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


def test_ensure_model_downloaded_already_available():
    with patch("setup_ollama.get_available_models") as mock_get:
        mock_get.return_value = ["gemma3", "llama3"]
        assert ensure_model_downloaded("gemma3") is True


def test_ensure_model_downloaded_user_accepts_success():
    with patch("setup_ollama.get_available_models") as mock_get, \
         patch("builtins.input", return_value="S") as mock_input, \
         patch("setup_ollama._run_ollama") as mock_run:
        mock_get.return_value = ["llama3"]
        mock_run.return_value = MagicMock(returncode=0)
        assert ensure_model_downloaded("gemma3") is True
        mock_run.assert_called_once_with(
            ["pull", "gemma3"],
            capture_output=False,
            text=True,
        )


def test_ensure_model_downloaded_user_accepts_failure():
    with patch("setup_ollama.get_available_models") as mock_get, \
         patch("builtins.input", return_value="S") as mock_input, \
         patch("setup_ollama._run_ollama") as mock_run:
        mock_get.return_value = ["llama3"]
        mock_run.return_value = MagicMock(returncode=1)
        assert ensure_model_downloaded("gemma3") is False


def test_ensure_model_downloaded_user_declines():
    with patch("setup_ollama.get_available_models") as mock_get, \
         patch("builtins.input", return_value="N") as mock_input:
        mock_get.return_value = ["llama3"]
        assert ensure_model_downloaded("gemma3") is False


def test_ensure_model_downloaded_exception_on_pull():
    with patch("setup_ollama.get_available_models") as mock_get, \
         patch("builtins.input", return_value="S") as mock_input, \
         patch("setup_ollama._run_ollama", side_effect=Exception("network error")) as mock_run:
        mock_get.return_value = ["llama3"]
        assert ensure_model_downloaded("gemma3") is False
