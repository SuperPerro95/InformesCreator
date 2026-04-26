#!/usr/bin/env python3
"""
InformesCreator - Script de empaquetado de actualizaciones
Genera un zip que contiene solo app/ (codigo fuente) para distribuir via GitHub Releases.

Uso:
    python build_update.py
    python build_update.py --version 1.0.1
"""

import argparse
import zipfile
from pathlib import Path


def build_update(version: str = None) -> Path:
    root = Path(__file__).resolve().parent
    app_dir = root / "app"
    version_file = app_dir / "version.txt"

    if version is None:
        if version_file.exists():
            version = version_file.read_text(encoding="utf-8").strip()
        else:
            version = "1.0.0"

    # Limpiar prefijo 'v' si viene en argumento
    version = version.lstrip("v")
    zip_name = f"InformesCreator_update_v{version}.zip"
    zip_path = root / zip_name

    # Exclusiones
    excludes = {
        "__pycache__",
        ".pytest_cache",
        ".mypy_cache",
        ".git",
        ".claude",
        "*.pyc",
        "*.pyo",
        ".DS_Store",
        "Thumbs.db",
    }

    def should_exclude(path: Path) -> bool:
        for part in path.parts:
            if part in excludes:
                return True
            if part.endswith(".pyc") or part.endswith(".pyo"):
                return True
            if part in (".DS_Store", "Thumbs.db"):
                return True
        return False

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for filepath in app_dir.rglob("*"):
            if should_exclude(filepath.relative_to(app_dir)):
                continue
            arcname = f"app/{filepath.relative_to(app_dir)}"
            zf.write(filepath, arcname)

    print(f"✅ Update zip generado: {zip_path}")
    print(f"   Version: {version}")
    print(f"   Archivos empaquetados desde: {app_dir}")
    return zip_path


def main():
    parser = argparse.ArgumentParser(description="Genera el zip de actualizacion de InformesCreator")
    parser.add_argument("--version", help="Version a empaquetar (default: lee app/version.txt)")
    args = parser.parse_args()
    build_update(args.version)


if __name__ == "__main__":
    main()
