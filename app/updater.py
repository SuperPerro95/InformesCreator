#!/usr/bin/env python3
"""
InformesCreator - Actualizador automatico
Ejecuta independientemente del launcher para poder reemplazar app/.
Uso:
    pythonw updater.py
"""

import json
import os
import shutil
import subprocess
import sys
import tkinter as tk
import zipfile
from pathlib import Path
from tkinter import messagebox, ttk
from urllib.request import Request, urlopen

# Configuracion: repositorio GitHub donde se publican los releases
GITHUB_OWNER = "SuperPerro95"
GITHUB_REPO = "InformesCreator"

APP_DIR = Path(__file__).resolve().parent
ROOT_DIR = APP_DIR.parent
VERSION_FILE = APP_DIR / "version.txt"


def _read_local_version() -> str:
    try:
        return VERSION_FILE.read_text(encoding="utf-8").strip()
    except Exception:
        return "0.0.0"


def _compare_versions(v1: str, v2: str) -> int:
    """Compara dos versiones semanticas. Retorna >0 si v1>v2, <0 si v1<v2, 0 si iguales."""
    try:
        a = [int(x) for x in v1.lstrip("v").split(".")]
        b = [int(x) for x in v2.lstrip("v").split(".")]
        for i in range(max(len(a), len(b))):
            av = a[i] if i < len(a) else 0
            bv = b[i] if i < len(b) else 0
            if av != bv:
                return av - bv
        return 0
    except Exception:
        return 0


class UpdaterApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("InformesCreator - Actualizador")
        self.geometry("500x280")
        self.resizable(False, False)
        self.configure(bg="#ffffff")

        self.update_idletasks()
        x = (self.winfo_screenwidth() // 2) - (500 // 2)
        y = (self.winfo_screenheight() // 2) - (280 // 2)
        self.geometry(f"+{x}+{y}")

        self.local_version = _read_local_version()
        self.latest_version = None
        self.download_url = None

        self._build_ui()
        self.after(200, self._check_update)

    def _build_ui(self):
        tk.Label(
            self,
            text="InformesCreator - Actualizador",
            font=("Nunito", 18, "bold"),
            bg="#ffffff",
            fg="#111827",
        ).pack(pady=(20, 5))

        self.version_lbl = tk.Label(
            self,
            text=f"Version actual: {self.local_version}",
            font=("Inter", 11),
            bg="#ffffff",
            fg="#6b7280",
        )
        self.version_lbl.pack(pady=2)

        self.status_lbl = tk.Label(
            self,
            text="Buscando actualizaciones...",
            font=("Inter", 11),
            bg="#ffffff",
            fg="#2563eb",
        )
        self.status_lbl.pack(pady=5)

        self.progress = ttk.Progressbar(
            self, orient=tk.HORIZONTAL, length=420, mode="determinate"
        )
        self.progress.pack(pady=10)
        self.progress["value"] = 0

        self.btn_frame = tk.Frame(self, bg="#ffffff")
        self.btn_frame.pack(pady=15)

        self.btn_restart = tk.Button(
            self.btn_frame,
            text="Reiniciar InformesCreator",
            font=("Inter", 11, "bold"),
            bg="#16a34a",
            fg="#ffffff",
            activebackground="#15803d",
            bd=0,
            padx=20,
            pady=8,
            cursor="hand2",
            command=self._restart_app,
        )

        self.btn_close = tk.Button(
            self.btn_frame,
            text="Cerrar",
            font=("Inter", 11, "bold"),
            bg="#6b7280",
            fg="#ffffff",
            activebackground="#4b5563",
            bd=0,
            padx=20,
            pady=8,
            cursor="hand2",
            command=self.destroy,
        )
        self.btn_close.pack(side=tk.LEFT, padx=5)

    def _update_status(self, text: str, color: str = "#6b7280", progress: int = None):
        self.status_lbl.config(text=text, fg=color)
        if progress is not None:
            self.progress["value"] = progress
        self.update_idletasks()

    def _check_update(self):
        try:
            api_url = (
                f"https://api.github.com/repos/{GITHUB_OWNER}/{GITHUB_REPO}/releases/latest"
            )
            req = Request(api_url, headers={"User-Agent": "InformesCreator-Updater"})
            with urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read().decode())

            self.latest_version = data.get("tag_name", "").lstrip("v")
            assets = data.get("assets", [])
            for asset in assets:
                name = asset.get("name", "")
                if name.startswith("InformesCreator_update_") and name.endswith(".zip"):
                    self.download_url = asset.get("browser_download_url")
                    break

            if not self.latest_version:
                self._update_status("No se pudo determinar la ultima version.", "#dc2626", 100)
                return

            if _compare_versions(self.latest_version, self.local_version) <= 0:
                self._update_status(
                    "Estas en la ultima version.", "#16a34a", 100
                )
                return

            if not self.download_url:
                self._update_status(
                    "Nueva version disponible pero no se encontro el paquete de actualizacion.",
                    "#d97706",
                    100,
                )
                return

            self.version_lbl.config(
                text=f"Version actual: {self.local_version}  →  Nueva: {self.latest_version}"
            )
            self._download_and_apply()

        except Exception as e:
            self._update_status(f"Error buscando actualizaciones: {e}", "#dc2626", 100)

    def _download_and_apply(self):
        self._update_status("Descargando actualizacion...", "#d97706", 10)
        zip_path = ROOT_DIR / f"InformesCreator_update_v{self.latest_version}.zip"
        try:
            req = Request(self.download_url, headers={"User-Agent": "InformesCreator-Updater"})
            with urlopen(req, timeout=120) as resp:
                total = int(resp.headers.get("Content-Length", 0))
                downloaded = 0
                chunk_size = 64 * 1024
                with open(zip_path, "wb") as f:
                    while True:
                        chunk = resp.read(chunk_size)
                        if not chunk:
                            break
                        f.write(chunk)
                        downloaded += len(chunk)
                        if total:
                            pct = 10 + int((downloaded / total) * 40)
                            self._update_status(
                                f"Descargando... {downloaded // 1024} / {total // 1024} KB",
                                "#d97706",
                                pct,
                            )

            self._update_status("Extrayendo actualizacion...", "#d97706", 55)
            extract_dir = ROOT_DIR / "app_update"
            if extract_dir.exists():
                shutil.rmtree(extract_dir)
            extract_dir.mkdir(parents=True, exist_ok=True)

            with zipfile.ZipFile(zip_path, "r") as zf:
                zf.extractall(extract_dir)

            self._update_status("Verificando paquete...", "#d97706", 70)
            extracted_app = extract_dir / "app"
            if not extracted_app.exists():
                # Algunos zips pueden tener la carpeta app/ directamente
                # o los archivos sueltos. Ajustamos.
                if (extract_dir / "version.txt").exists():
                    extracted_app = extract_dir
                else:
                    raise RuntimeError("Estructura del zip invalida: no se encontro app/")

            new_version_file = extracted_app / "version.txt"
            if new_version_file.exists():
                new_ver = new_version_file.read_text(encoding="utf-8").strip()
                if new_ver != self.latest_version:
                    self._update_status(
                        f"Advertencia: version del zip ({new_ver}) no coincide con la esperada.",
                        "#d97706",
                        75,
                    )

            self._update_status("Preparando reinicio...", "#d97706", 85)
            try:
                batch_path = self._write_update_batch(extract_dir, extracted_app, zip_path)
                self._launch_update_batch(batch_path)
                self._update_status(
                    "Actualizacion lista. Reiniciando...", "#16a34a", 100
                )
                self.btn_restart.pack(side=tk.LEFT, padx=5)
                self.after(1000, self.destroy)
            except Exception as batch_err:
                self._update_status(
                    f"Error preparando reinicio: {batch_err}", "#dc2626", 100
                )

        except Exception as e:
            self._update_status(f"Error aplicando actualizacion: {e}", "#dc2626", 100)
            # Restaurar backup si existe
            backup_dir = ROOT_DIR / "app_backup"
            if backup_dir.exists() and not APP_DIR.exists():
                shutil.move(str(backup_dir), str(APP_DIR))

    def _write_update_batch(self, extract_dir: Path, extracted_app: Path, zip_path: Path) -> Path:
        """Escribe un .bat que hace el swap de carpetas despues de que este proceso muera."""
        batch_path = ROOT_DIR / "update_helper.bat"
        app_name = APP_DIR.name
        backup_name = "app_backup"
        extract_name = extract_dir.name
        extracted_name = extracted_app.name
        zip_name = zip_path.name

        batch_content = f'''@echo off
chcp 65001 > nul
echo [InformesCreator] Preparando actualizacion...

:: Esperar a que el proceso padre libere los archivos
timeout /t 2 /nobreak > nul

:: Borrar backup anterior si existe
if exist "{backup_name}" rmdir /s /q "{backup_name}"

:: Mover app actual a backup
if exist "{app_name}" move "{app_name}" "{backup_name}"

:: Mover nueva app (puede estar dentro de app_update o ser app_update mismo)
if exist "{extract_name}\\{extracted_name}" (
    move "{extract_name}\\{extracted_name}" "{app_name}"
) else (
    move "{extract_name}" "{app_name}"
)

:: Limpiar directorio de extraccion residual
if exist "{extract_name}" rmdir /s /q "{extract_name}"

:: Instalar dependencias si hay venv
set PIP=.venv\\Scripts\\pip.exe
if exist "%PIP%" (
    if exist "{app_name}\\requirements.txt" (
        "%PIP%" install -r "{app_name}\\requirements.txt" > nul 2>&1
    )
)

:: Borrar zip de actualizacion
if exist "{zip_name}" del "{zip_name}"

:: Reiniciar aplicacion
set PYTHONW=.venv\\Scripts\\pythonw.exe
if not exist "%PYTHONW%" set PYTHONW=pythonw
start "" "%PYTHONW%" "{app_name}\\launcher.py"
'''
        batch_path.write_text(batch_content, encoding="utf-8")
        return batch_path

    def _launch_update_batch(self, batch_path: Path) -> None:
        """Ejecuta el .bat en segundo plano (sin ventana)."""
        flags = 0
        if sys.platform == "win32":
            flags = 0x08000000  # CREATE_NO_WINDOW
        subprocess.Popen(
            [str(batch_path)],
            cwd=str(ROOT_DIR),
            creationflags=flags,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

    def _restart_app(self):
        try:
            venv_pythonw = ROOT_DIR / ".venv" / "Scripts" / "pythonw.exe"
            if venv_pythonw.exists():
                pythonw = str(venv_pythonw)
            else:
                pythonw = shutil.which("pythonw") or shutil.which("python")
            if pythonw:
                subprocess.Popen(
                    [pythonw, str(APP_DIR / "launcher.py")],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    creationflags=0x08000000 if sys.platform == "win32" else 0,
                )
        except Exception:
            pass
        self.destroy()


def main():
    app = UpdaterApp()
    app.mainloop()


if __name__ == "__main__":
    main()
