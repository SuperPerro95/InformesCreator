from unittest.mock import patch, MagicMock

from check_ollama import classify_model, probe_model


def test_classify_model_local():
    model = {"name": "gemma3", "size": 5000000000}
    assert classify_model(model) == "local"


def test_classify_model_cloud_by_remote_host():
    model = {
        "name": "qwen:cloud",
        "size": 5000000000,
        "remote_host": "https://ollama.com:443",
    }
    assert classify_model(model) == "cloud"


def test_classify_model_cloud_by_remote_model():
    model = {
        "name": "qwen:cloud",
        "size": 5000000000,
        "remote_model": "qwen",
    }
    assert classify_model(model) == "cloud"


def test_classify_model_cloud_by_small_size():
    model = {"name": "kimi-k2.5:cloud", "size": 340}
    assert classify_model(model) == "cloud"


def test_probe_model_success():
    with patch("requests.post") as mock_post:
        mock_post.return_value = MagicMock(
            status_code=200,
            json=lambda: {"response": "Hello! How can I help you today?"},
        )
        result = probe_model("gemma3")
        assert result["ok"] is True
        assert result["response_preview"] == "Hello! How can I help you today?"


def test_probe_model_unexpected_response():
    with patch("requests.post") as mock_post:
        mock_post.return_value = MagicMock(
            status_code=200,
            json=lambda: {"error": "model not found"},
        )
        result = probe_model("gemma3")
        assert result["ok"] is False
        assert "Respuesta inesperada" in result["error"]


def test_probe_model_http_error():
    with patch("requests.post") as mock_post:
        mock_post.return_value = MagicMock(status_code=404)
        result = probe_model("gemma3")
        assert result["ok"] is False
        assert "HTTP 404" in result["error"]


def test_probe_model_timeout():
    import requests
    with patch("requests.post", side_effect=requests.exceptions.Timeout):
        result = probe_model("gemma3")
        assert result["ok"] is False
        assert "Timeout" in result["error"]


def test_probe_model_connection_error():
    import requests
    with patch("requests.post", side_effect=requests.exceptions.ConnectionError):
        result = probe_model("gemma3")
        assert result["ok"] is False
        assert "Error de conexión" in result["error"]
