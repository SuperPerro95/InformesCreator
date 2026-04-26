import json
from typing import List, Optional

import requests

from config import Config


def check_ollama_server(url: str) -> bool:
    """Verifica que el servidor Ollama esté respondiendo."""
    try:
        response = requests.get(f"{url}/api/tags", timeout=5)
        return response.status_code == 200
    except requests.exceptions.RequestException:
        return False


def get_available_models(url: str) -> List[str]:
    """Obtiene la lista de modelos instalados en Ollama."""
    try:
        response = requests.get(f"{url}/api/tags", timeout=5)
        if response.status_code == 200:
            data = response.json()
            return [model["name"] for model in data.get("models", [])]
    except requests.exceptions.RequestException:
        pass
    return []


def generate_report(
    system_prompt: str,
    user_prompt: str,
    config: Config,
) -> Optional[str]:
    """Genera un informe llamando a la API de Ollama."""
    url = f"{config.ollama_url}/api/chat"
    payload = {
        "model": config.model,
        "stream": False,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    }

    try:
        response = requests.post(url, json=payload, timeout=120)
        response.raise_for_status()
        data = response.json()
        return data.get("message", {}).get("content", None)
    except requests.exceptions.ConnectionError:
        print("❌ Error: No se pudo conectar con Ollama.")
        print("   Asegurate de que el servidor esté corriendo: ollama serve")
        return None
    except requests.exceptions.Timeout:
        print("❌ Error: La solicitud a Ollama tardó demasiado.")
        return None
    except requests.exceptions.HTTPError as e:
        print(f"❌ Error HTTP de Ollama: {e}")
        return None
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return None
