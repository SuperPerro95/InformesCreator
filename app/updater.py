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
GITHUB_OWNER = "mrberru"
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

            self._update_status("Reemplazando archivos...", "#d97706", 80)
            backup_dir = ROOT_DIR / "app_backup"
            if backup_dir.exists():
                shutil.rmtree(backup_dir)
            if APP_DIR.exists():
                shutil.move(str(APP_DIR), str(backup_dir))
            shutil.move(str(extracted_app), str(APP_DIR))

            # Verificar si cambio requirements.txt
            self._update_status("Verificando dependencias...", "#d97706", 90)
            req_file = APP_DIR / "requirements.txt"
            venv_python = ROOT_DIR / ".venv" / "Scripts" / "python.exe"
            if req_file.exists() and venv_python.exists():
                pip_path = ROOT_DIR / ".venv" / "Scripts" / "pip.exe"
                if pip_path.exists():
                    subprocess.run(
                        [str(pip_path), "install", "-r", str(req_file)],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL,
                        creationflags=0x08000000 if sys.platform == "win32" else 0,
                        check=False,
                    )

            # Limpieza
            zip_path.unlink(missing_ok=True)
            if extract_dir.exists():
                shutil.rmtree(extract_dir)
            if backup_dir.exists():
                shutil.rmtree(backup_dir)

            self._update_status(
                "Actualizacion completada correctamente.", "#16a34a", 100
            )
            self.btn_restart.pack(side=tk.LEFT, padx=5)

        except Exception as e:
            self._update_status(f"Error aplicando actualizacion: {e}", "#dc2626", 100)
            # Restaurar backup si existe
            backup_dir = ROOT_DIR / "app_backup"
            if backup_dir.exists() and not APP_DIR.exists():
                shutil.move(str(backup_dir), str(APP_DIR))

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
