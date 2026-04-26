#!/usr/bin/env python3
"""
InformesCreator - Script de empaquetado de distribucion Windows
Genera InformesCreator_Windows.zip listo para distribuir.

Estructura del zip:
    app/           <- codigo fuente completo
    install.vbs    <- instalador (sin terminal)
    InformesCreator.vbs  <- launcher diario (sin terminal)
    InformesCreator.bat  <- backup launcher
    README.md      <- documentacion

NO incluye: user_data/, Informes/, .venv/, __pycache__/, tests/
"""

import zipfile
from pathlib import Path


def build_dist() -> Path:
    root = Path(__file__).resolve().parent
    zip_path = root / "InformesCreator_Windows.zip"

    # Directorios/archivos a incluir explicitamente
    includes = [
        root / "app",
        root / "install.vbs",
        root / "InformesCreator.vbs",
        root / "InformesCreator.bat",
        root / "install_windows.bat",
        root / "install_gui.bat",
        root / "README.md",
    ]

    # Exclusiones dentro de app/
    exclude_names = {
        "__pycache__",
        ".pytest_cache",
        ".mypy_cache",
        ".git",
        ".claude",
        "tests",
        "*.pyc",
        "*.pyo",
        ".DS_Store",
        "Thumbs.db",
    }

    def should_exclude(path: Path) -> bool:
        for part in path.parts:
            if part in exclude_names:
                return True
            if part.endswith(".pyc") or part.endswith(".pyo"):
                return True
            if part == ".DS_Store" or part == "Thumbs.db":
                return True
        return False

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for item in includes:
            if not item.exists():
                print(f"⚠️  Omitido (no existe): {item.name}")
                continue
            if item.is_dir():
                for filepath in item.rglob("*"):
                    if should_exclude(filepath.relative_to(item)):
                        continue
                    arcname = str(filepath.relative_to(root))
                    zf.write(filepath, arcname)
            else:
                zf.write(item, item.name)

    size_mb = zip_path.stat().st_size / (1024 * 1024)
    print(f"✅ Distribucion generada: {zip_path}")
    print(f"   Tamano: {size_mb:.1f} MB")
    return zip_path


if __name__ == "__main__":
    build_dist()
