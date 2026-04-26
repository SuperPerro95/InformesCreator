"""
InformesCreator - Resolucion de paths centralizada.

Este modulo resuelve las rutas del proyecto para que el codigo encuentre
los datos del usuario (user_data/) independientemente de donde se ejecute.

Uso:
    from paths import user_data_path, app_path, root_path
    config_file = user_data_path("config.json")
"""

import sys
from pathlib import Path


# Detectar la raiz del proyecto
# app/paths.py -> app/ -> raiz
APP_DIR = Path(__file__).resolve().parent
ROOT_DIR = APP_DIR.parent

# Directorio de datos del usuario
USER_DATA_DIR = ROOT_DIR / "user_data"
USER_DATA_DIR.mkdir(exist_ok=True)

# Directorio de salida de informes
REPORTS_DIR = ROOT_DIR / "Informes"
REPORTS_DIR.mkdir(exist_ok=True)


def root_path() -> Path:
    """Devuelve la raiz del proyecto."""
    return ROOT_DIR


def app_path(filename: str = "") -> Path:
    """Devuelve un path dentro de la carpeta app/."""
    if filename:
        return APP_DIR / filename
    return APP_DIR


def user_data_path(filename: str = "") -> Path:
    """Devuelve un path dentro de user_data/. Crea el directorio si no existe."""
    USER_DATA_DIR.mkdir(exist_ok=True)
    if filename:
        return USER_DATA_DIR / filename
    return USER_DATA_DIR


def reports_path() -> Path:
    """Devuelve el directorio de informes generados."""
    REPORTS_DIR.mkdir(exist_ok=True)
    return REPORTS_DIR


# Asegurar que la raiz del proyecto este en sys.path para que los imports
# desde app/ funcionen cuando se corre desde cualquier ubicacion
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
