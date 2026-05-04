import json
import os
import sys
from pathlib import Path
from typing import Dict, Any


# Asegurar que la raiz del proyecto este en sys.path para imports
_script_dir = Path(__file__).resolve().parent
if str(_script_dir) not in sys.path:
    sys.path.insert(0, str(_script_dir))

from paths import user_data_path, root_path


def _get_config_dir() -> Path:
    """Devuelve el directorio donde se guarda la configuración del usuario."""
    if getattr(sys, "frozen", False):
        # Ejecutando desde un .exe de PyInstaller
        if sys.platform == "win32":
            appdata = os.environ.get("APPDATA", os.path.expanduser("~"))
            return Path(appdata) / "InformesCreator"
        else:
            return Path.home() / ".config" / "informescreator"
    # Desarrollo: usar user_data/ al lado de app/
    return user_data_path()


DEFAULT_CONFIG = {
    "base_path": "",
    "ollama_url": "http://localhost:11434",
    "model": "gemma4:31b-cloud",
    "output_dir": "Informes",
    "default_variant": "A"
}

CONFIG_FILE = "config.json"


class Config:
    """Gestiona la configuración del InformesCreator."""

    def __init__(self, config_path: str = None):
        if config_path is None:
            config_dir = _get_config_dir()
            config_dir.mkdir(parents=True, exist_ok=True)
            self.config_path = config_dir / CONFIG_FILE
        else:
            self.config_path = Path(config_path)
        self._data: Dict[str, Any] = {}
        self.load()

    def load(self) -> None:
        """Carga la configuración desde el archivo JSON.
        Si no existe, crea uno con valores por defecto."""
        if self.config_path.exists():
            with open(self.config_path, "r", encoding="utf-8") as f:
                self._data = json.load(f)
        else:
            self._data = DEFAULT_CONFIG.copy()
            self.save()
            print(f"Se creó el archivo de configuración: {self.config_path}")

    def save(self) -> None:
        """Guarda la configuración actual en el archivo JSON."""
        with open(self.config_path, "w", encoding="utf-8") as f:
            json.dump(self._data, f, indent=4, ensure_ascii=False)

    def get(self, key: str, default=None):
        """Obtiene un valor de configuración por clave."""
        return self._data.get(key, default)

    def set(self, key: str, value: Any) -> None:
        """Establece un valor de configuración y lo persiste."""
        if key == "base_path" or key == "output_dir":
            p = Path(value)
            if not p.is_absolute():
                p = root_path() / p
            value = str(p.resolve())
        self._data[key] = value
        self.save()

    @property
    def base_path(self) -> Path:
        return Path(self.get("base_path", DEFAULT_CONFIG["base_path"]))

    @property
    def ollama_url(self) -> str:
        return self.get("ollama_url", DEFAULT_CONFIG["ollama_url"])

    @property
    def model(self) -> str:
        return self.get("model", DEFAULT_CONFIG["model"])

    @property
    def output_dir(self) -> Path:
        return Path(self.get("output_dir", DEFAULT_CONFIG["output_dir"]))

    @property
    def default_variant(self) -> str:
        return self.get("default_variant", DEFAULT_CONFIG["default_variant"])
