import shutil
import subprocess
import sys
import time
from pathlib import Path
from typing import Optional, Tuple

import requests


def _is_wsl_available() -> bool:
    """Verifica si wsl esta disponible en el PATH."""
    return shutil.which("wsl") is not None


def _find_ollama_wsl() -> Optional[str]:
    """Busca ollama dentro de WSL."""
    wsl_candidates = ["wsl"]
    if sys.platform == "win32":
        wsl_candidates.extend([
            r"C:\Windows\System32\wsl.exe",
            r"C:\Windows\SysWOW64\wsl.exe",
        ])
    for wsl_exe in wsl_candidates:
        try:
            result = subprocess.run(
                [wsl_exe, "which", "ollama"],
                capture_output=True,
                text=True,
                timeout=15,
            )
            if result.returncode == 0:
                path = result.stdout.strip()
                if path:
                    return path
        except Exception:
            continue
    return None


def _find_ollama_executable() -> Tuple[Optional[str], bool]:
    """
    Busca el ejecutable de Ollama en el PATH, rutas comunes, y WSL.
    Retorna (path, is_wsl).
    """
    # 1. Buscar en PATH nativo
    cmd = shutil.which("ollama")
    if cmd:
        return cmd, False

    # 2. Windows: buscar en rutas típicas
    if sys.platform == "win32":
        common_paths = [
            Path.home() / "AppData" / "Local" / "Programs" / "Ollama" / "ollama.exe",
            Path("C:") / "Program Files" / "Ollama" / "ollama.exe",
            Path("C:") / "Program Files (x86)" / "Ollama" / "ollama.exe",
            Path.home() / "ollama" / "ollama.exe",
        ]
        for p in common_paths:
            if p.exists():
                return str(p), False

    # 3. Buscar en WSL
    wsl_path = _find_ollama_wsl()
    if wsl_path:
        return wsl_path, True

    return None, False


def is_ollama_installed() -> bool:
    """Verifica si Ollama está instalado buscando el ejecutable (nativo o WSL)."""
    path, _ = _find_ollama_executable()
    return path is not None


def _run_ollama(args: list, **kwargs) -> subprocess.CompletedProcess:
    """Ejecuta Ollama usando la ruta resuelta automáticamente."""
    exe, is_wsl = _find_ollama_executable()
    if exe is None:
        raise FileNotFoundError("Ollama executable not found")
    if is_wsl:
        return subprocess.run(["wsl", "ollama"] + args, **kwargs)
    return subprocess.run([exe] + args, **kwargs)


def is_ollama_running(url: str = "http://localhost:11434") -> bool:
    """Verifica si el servidor Ollama está respondiendo."""
    try:
        response = requests.get(f"{url}/api/tags", timeout=5)
        return response.status_code == 200
    except requests.exceptions.RequestException:
        return False


def start_ollama_server() -> bool:
    """Intenta iniciar el servidor de Ollama."""
    print("🚀 Intentando iniciar Ollama...")
    exe, is_wsl = _find_ollama_executable()
    if exe is None:
        print("❌ No se encontró el ejecutable de Ollama.")
        return False

    try:
        if is_wsl:
            subprocess.Popen(
                ["wsl", "ollama", "serve"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        elif sys.platform == "win32":
            subprocess.Popen(
                [exe, "serve"],
                creationflags=subprocess.CREATE_NEW_CONSOLE,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        else:
            subprocess.Popen(
                [exe, "serve"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )

        for _ in range(10):
            time.sleep(1)
            if is_ollama_running():
                print("✅ Ollama iniciado correctamente.")
                return True

        print("⚠️  Ollama no respondió a tiempo.")
        return False
    except Exception as e:
        print(f"❌ Error al iniciar Ollama: {e}")
        return False


def setup_ollama(url: str = "http://localhost:11434") -> bool:
    """
    Configura Ollama verificando instalación, iniciando servidor si es necesario,
    o guiando al usuario para instalarlo.
    """
    print("\n" + "=" * 60)
    print("🔧 CONFIGURACIÓN DE OLLAMA")
    print("=" * 60)

    # PRIORIDAD: si el servidor ya responde, Ollama está funcionando.
    if is_ollama_running(url):
        print("✅ El servidor de Ollama ya está activo.")
        return True

    # Si el servidor NO responde, verificar si está instalado para intentar iniciarlo
    if not is_ollama_installed():
        print("\n❌ Ollama no está instalado en este sistema.")
        print("\n📥 Para instalar Ollama, ejecutá el siguiente comando en PowerShell:")
        print("-" * 60)
        print('irm https://ollama.com/install.ps1 | iex')
        print("-" * 60)
        print("\nUna vez instalado, reiniciá la terminal y volvé a ejecutar este script.")
        return False

    print("✅ Ollama está instalado.")
    print("\n⚠️  Ollama está instalado pero el servidor no está corriendo.")
    start = input("¿Querés intentar iniciarlo automáticamente? (S/N): ").strip().upper()

    if start == "S":
        if start_ollama_server():
            return True
        else:
            print("\nNo se pudo iniciar automáticamente.")
            print("Intentá manualmente con: ollama serve")
            return False
    else:
        print("\nPara iniciar Ollama manualmente, ejecutá:")
        print("  ollama serve")
        return False


def get_available_models(url: str = "http://localhost:11434") -> list:
    """Obtiene la lista de modelos instalados en Ollama."""
    try:
        response = requests.get(f"{url}/api/tags", timeout=5)
        if response.status_code == 200:
            data = response.json()
            return [model["name"] for model in data.get("models", [])]
    except requests.exceptions.RequestException:
        pass
    return []


def select_model(url: str = "http://localhost:11434", current_model: str = "deepseek-v4-flash:cloud") -> Optional[str]:
    """Interactivamente permite al usuario elegir un modelo."""
    models = get_available_models(url)

    if not models:
        print("\n⚠️  No se encontraron modelos instalados.")
        print("📥 Descargá uno con:")
        print(f"   ollama pull {current_model}")
        return None

    print(f"\n📦 Modelos disponibles:")
    for i, m in enumerate(models, 1):
        marker = " ← actual" if m == current_model else ""
        print(f"   {i}. {m}{marker}")

    choice = input(f"\nSeleccioná un modelo (Enter para mantener '{current_model}'): ").strip()

    if not choice:
        return current_model

    try:
        idx = int(choice) - 1
        if 0 <= idx < len(models):
            selected = models[idx]
            if ensure_model_downloaded(selected, url):
                return selected
            else:
                return None
        else:
            print("Opción inválida, se mantiene el modelo actual.")
            return current_model
    except ValueError:
        print("Entrada inválida, se mantiene el modelo actual.")
        return current_model


def ensure_model_downloaded(model_name: str, url: str = "http://localhost:11434") -> bool:
    """
    Verifica si el modelo está descargado. Si no lo está, ofrece descargarlo.
    """
    models = get_available_models(url)

    if model_name in models:
        return True

    print(f"\n⚠️  El modelo '{model_name}' no está descargado.")
    download = input(f"¿Querés descargarlo ahora? (S/N): ").strip().upper()

    if download == "S":
        print(f"📥 Descargando {model_name}...")
        print("   Esto puede tardar varios minutos dependiendo de tu conexión.")
        try:
            result = _run_ollama(
                ["pull", model_name],
                capture_output=False,
                text=True,
            )
            if result.returncode == 0:
                print(f"✅ Modelo '{model_name}' descargado correctamente.")
                return True
            else:
                print(f"❌ Error al descargar el modelo.")
                return False
        except Exception as e:
            print(f"❌ Error: {e}")
            return False
    else:
        print(f"\nPara usar este modelo, descargalo manualmente con:")
        print(f"   ollama pull {model_name}")
        return False
