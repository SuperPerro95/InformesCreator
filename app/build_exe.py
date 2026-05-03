#!/usr/bin/env python3
"""
Script para empaquetar InformesCreator como ejecutable .exe para Windows.
Uso:
    python build_exe.py
Requisitos:
    pip install pyinstaller
"""

import os
import shutil
import subprocess
import sys
from pathlib import Path


def main():
    project_root = Path(__file__).resolve().parent
    os.chdir(project_root)

    # Verificar PyInstaller
    try:
        import PyInstaller
    except ImportError:
        print("Instalando PyInstaller...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])

    # Archivos a incluir
    static_dir = project_root / "web" / "static"
    api_dir = project_root / "web" / "api"
    root_py_files = [
        "config.py",
        "course_manager.py",
        "ollama_client.py",
        "prompt_builder.py",
        "questionnaire.py",
        "report_saver.py",
        "setup_ollama.py",
        "student_parser.py",
        "variants.py",
        "check_ollama.py",
    ]

    # Construir comando PyInstaller
    cmd = [
        sys.executable, "-m", "PyInstaller",
        "--name", "InformesCreator",
        "--onefile",
        "--windowed",  # No muestra consola en Windows
        "--add-data", f"web/static{os.pathsep}web/static",
        "--add-data", f"web/api{os.pathsep}web/api",
        "--hidden-import", "uvicorn.logging",
        "--hidden-import", "uvicorn.loops",
        "--hidden-import", "uvicorn.loops.auto",
        "--hidden-import", "uvicorn.protocols",
        "--hidden-import", "uvicorn.protocols.http",
        "--hidden-import", "uvicorn.protocols.http.auto",
        "--hidden-import", "uvicorn.protocols.websockets",
        "--hidden-import", "uvicorn.protocols.websockets.auto",
        "--hidden-import", "uvicorn.lifespan",
        "--hidden-import", "uvicorn.lifespan.on",
        "--hidden-import", "fastapi",
        "--hidden-import", "pydantic",
        "--hidden-import", "requests",
        "--hidden-import", "rich",
        "--distpath", "dist",
        "--workpath", "build",
        "--specpath", ".",
        "--clean",
        "web/main.py",
    ]

    # Agregar archivos raíz como datos
    for f in root_py_files:
        if (project_root / f).exists():
            cmd.extend(["--add-data", f"{f}{os.pathsep}.{f}"])

    print("=" * 60)
    print("  Empaquetando InformesCreator para Windows")
    print("=" * 60)
    print(f"\nComando: {' '.join(cmd)}\n")

    try:
        subprocess.check_call(cmd)
        print("\n" + "=" * 60)
        print("  Empaquetado completo!")
        print(f"  Ejecutable: {project_root / 'dist' / 'InformesCreator.exe'}")
        print("=" * 60)
    except subprocess.CalledProcessError as e:
        print(f"\nError durante el empaquetado: {e}")
        sys.exit(1)

    # Crear script .bat adicional (opcional, para modo consola)
    bat_path = project_root / "dist" / "InformesCreator_Console.bat"
    bat_content = """@echo off
chcp 65001 > nul
"%~dp0InformesCreator.exe"
pause
"""
    bat_path.write_text(bat_content, encoding="utf-8")
    print(f"\nTambien se creo: {bat_path}")


if __name__ == "__main__":
    main()
