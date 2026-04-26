#!/usr/bin/env python3
"""
Diagnóstico de Ollama - Verifica instalación, servidor, modelos y conectividad.

Uso:
    python check_ollama.py
"""

import sys

import requests

from setup_ollama import is_ollama_installed, is_ollama_running, get_available_models


def classify_model(model: dict) -> str:
    """Determina si un modelo es cloud o local basado en sus campos."""
    if model.get("remote_host") or model.get("remote_model"):
        return "cloud"
    size = model.get("size", 0)
    # Modelos cloud suelen tener tamaños muy pequeños (~300-400 bytes, solo metadata)
    if size < 1024:
        return "cloud"
    return "local"


def probe_model(model_name: str, url: str = "http://localhost:11434") -> dict:
    """Hace una llamada de prueba a un modelo y devuelve resultado del diagnóstico."""
    try:
        response = requests.post(
            f"{url}/api/generate",
            json={"model": model_name, "prompt": "hi", "stream": False},
            timeout=30,
        )
        if response.status_code == 200:
            data = response.json()
            if "response" in data:
                return {"ok": True, "response_preview": data["response"][:80]}
            else:
                return {"ok": False, "error": f"Respuesta inesperada: {list(data.keys())}"}
        else:
            return {"ok": False, "error": f"HTTP {response.status_code}"}
    except requests.exceptions.Timeout:
        return {"ok": False, "error": "Timeout (>30s)"}
    except requests.exceptions.ConnectionError:
        return {"ok": False, "error": "Error de conexión"}
    except Exception as e:
        return {"ok": False, "error": str(e)}


def run_diagnostics():
    print("=" * 60)
    print("  DIAGNÓSTICO DE OLLAMA")
    print("=" * 60)

    # 1. Verificar instalación
    print("\n[1/4] Verificando instalación de Ollama...")
    if is_ollama_installed():
        print("  ✅ Ollama está instalado.")
    else:
        print("  ❌ Ollama NO está instalado o no está en el PATH.")
        print("      → Instalalo desde https://ollama.com/download")
        return False

    # 2. Verificar servidor
    print("\n[2/4] Verificando servidor local...")
    if is_ollama_running():
        print("  ✅ Servidor Ollama local activo en http://localhost:11434")
    else:
        print("  ❌ El servidor Ollama NO está corriendo.")
        print("      → Inicialo con: ollama serve")
        return False

    # 3. Listar modelos
    print("\n[3/4] Modelos disponibles:")
    models = get_available_models()
    if not models:
        print("  ⚠️  No se encontraron modelos.")
        print("      → Descargá uno con: ollama pull gemma-4:31b-cloud")
        return False

    local_models = []
    cloud_models = []

    for m in models:
        name = m.get("name", "desconocido")
        kind = classify_model(m)
        size = m.get("size", 0)
        size_str = f"{size} B" if size < 1024 else f"{size // 1024} KB"
        if kind == "cloud":
            cloud_models.append((name, size_str, m))
        else:
            local_models.append((name, size_str, m))

    if local_models:
        print("  📦 Locales:")
        for name, size_str, _ in local_models:
            print(f"      • {name} ({size_str})")

    if cloud_models:
        print("  ☁️  Cloud:")
        for name, size_str, _ in cloud_models:
            print(f"      • {name} ({size_str})")

    # 4. Probar conectividad
    print("\n[4/4] Probando conectividad con los modelos...")

    tested = False

    # Probar un modelo local primero
    for name, _, _ in local_models:
        print(f"\n  → Probando modelo local: {name}...")
        result = probe_model(name)
        if result["ok"]:
            print(f"    ✅ Respuesta OK (preview: '{result['response_preview']}...')")
        else:
            print(f"    ❌ Error: {result['error']}")
        tested = True
        break  # Solo probar uno

    # Probar un modelo cloud
    for name, _, _ in cloud_models:
        print(f"\n  → Probando modelo cloud: {name}...")
        result = probe_model(name)
        if result["ok"]:
            print(f"    ✅ Respuesta OK (preview: '{result['response_preview']}...')")
        else:
            print(f"    ❌ Error: {result['error']}")
            if "401" in result["error"] or "Unauthorized" in result["error"]:
                print("    ⚠️  Parece haber un problema de autenticación con Ollama Cloud.")
                print("        → Ejecutá: ollama login")
        tested = True
        break  # Solo probar uno

    if not tested:
        print("  ⚠️  No hay modelos para probar.")

    print("\n" + "=" * 60)
    print("  DIAGNÓSTICO COMPLETADO")
    print("=" * 60)
    return True


if __name__ == "__main__":
    success = run_diagnostics()
    sys.exit(0 if success else 1)
