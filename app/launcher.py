#!/usr/bin/env python3
"""
InformesCreator - Launcher Grafico
Reemplaza InformesCreator.bat con una interfaz sin terminales.
Uso:
    python launcher.py
    o
    pythonw launcher.py   (sin terminal)
"""

import json
import os
import shutil
import subprocess
import sys
import threading
import time
import tkinter as tk
import webbrowser
from pathlib import Path
from tkinter import messagebox, ttk
from urllib.request import Request, urlopen


def _read_version() -> str:
    try:
        vfile = Path(__file__).resolve().parent / "version.txt"
        return vfile.read_text(encoding="utf-8").strip()
    except Exception:
        return "0.5.3"


class LauncherApp(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title(f"InformesCreator v{_read_version()}")
        self.geometry("500x340")
        self.resizable(False, False)
        self.configure(bg="#ffffff")

        self.update_idletasks()
        x = (self.winfo_screenwidth() // 2) - (500 // 2)
        y = (self.winfo_screenheight() // 2) - (340 // 2)
        self.geometry(f"+{x}+{y}")

        self.ollama_cmd = None
        self.server_proc = None
        self.model_name = "deepseek-v4-flash:cloud"

        self._build_ui()
        self.protocol("WM_DELETE_WINDOW", self._on_close)

        # Iniciar verificaciones en segundo plano
        threading.Thread(target=self._run_checks, daemon=True).start()

    def _build_ui(self):
        # Titulo
        tk.Label(
            self,
            text="InformesCreator",
            font=("Nunito", 22, "bold"),
            bg="#ffffff",
            fg="#111827",
        ).pack(pady=(25, 5))

        self.status_lbl = tk.Label(
            self,
            text="Verificando entorno...",
            font=("Inter", 12),
            bg="#ffffff",
            fg="#6b7280",
        )
        self.status_lbl.pack(pady=5)

        self.detail_lbl = tk.Label(
            self,
            text="",
            font=("Inter", 10),
            bg="#ffffff",
            fg="#6b7280",
        )
        self.detail_lbl.pack(pady=2)

        self.progress = ttk.Progressbar(
            self, orient=tk.HORIZONTAL, length=420, mode="determinate"
        )
        self.progress.pack(pady=15)
        self.progress["value"] = 0

        self.btn_browser = tk.Button(
            self,
            text="Abrir en navegador",
            font=("Inter", 11, "bold"),
            bg="#2563eb",
            fg="#ffffff",
            activebackground="#1d4ed8",
            bd=0,
            padx=25,
            pady=10,
            cursor="hand2",
            command=self._open_browser,
            state=tk.DISABLED,
        )
        self.btn_browser.pack(pady=10)

        self.btn_login = tk.Button(
            self,
            text="Login en Ollama Cloud",
            font=("Inter", 11, "bold"),
            bg="#7c3aed",
            fg="#ffffff",
            activebackground="#6d28d9",
            bd=0,
            padx=25,
            pady=10,
            cursor="hand2",
            command=self._thread_login,
        )
        self.btn_login.pack(pady=5)
        self.btn_login.pack_forget()

        self.btn_update = tk.Button(
            self,
            text="Buscar actualizaciones",
            font=("Inter", 10),
            bg="#ffffff",
            fg="#2563eb",
            activebackground="#f3f4f6",
            bd=0,
            padx=15,
            pady=5,
            cursor="hand2",
            command=self._run_updater,
        )
        self.btn_update.pack(pady=5)

    def _update_status(self, text, color="#6b7280", detail="", progress=None):
        def _do():
            self.status_lbl.config(text=text, fg=color)
            if detail:
                self.detail_lbl.config(text=detail)
            if progress is not None:
                self.progress["value"] = progress
        self.after(0, _do)

    def _find_ollama(self):
        cmd = shutil.which("ollama")
        if cmd:
            return cmd
        for path in [
            Path.home() / "AppData" / "Local" / "Programs" / "Ollama" / "ollama.exe",
            Path("C:/Program Files/Ollama/ollama.exe"),
            Path("C:/Program Files (x86)/Ollama/ollama.exe"),
        ]:
            if path.exists():
                return str(path)
        return None

    def _find_python(self):
        app_dir = Path(__file__).resolve().parent
        root_venv = app_dir.parent / ".venv" / "Scripts" / "python.exe"
        if root_venv.exists():
            return str(root_venv)
        system_venv = Path.home() / "AppData" / "Local" / "InformesCreator" / ".venv" / "Scripts" / "python.exe"
        if system_venv.exists():
            return str(system_venv)
        for cmd in ["python", "py", "python3"]:
            path = shutil.which(cmd)
            if path:
                return path
        return None

    def _run_checks(self):
        # 1. Verificar Ollama instalado
        self._update_status("Verificando Ollama...", progress=10)
        self.ollama_cmd = self._find_ollama()
        if not self.ollama_cmd:
            self._update_status(
                "❌ Ollama no esta instalado", "#dc2626",
                "Ejecuta install_gui.py para instalarlo."
            )
            return

        # 2. Verificar servidor Ollama
        self._update_status("Verificando servidor Ollama...", progress=25)
        try:
            req = Request("http://localhost:11434/api/tags", method="GET")
            with urlopen(req, timeout=3) as resp:
                if resp.status == 200:
                    pass
        except Exception:
            self._update_status("Iniciando servidor Ollama...", "#d97706", progress=30)
            subprocess.Popen(
                [self.ollama_cmd, "serve"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0,
            )
            for i in range(15):
                time.sleep(1)
                try:
                    req = Request("http://localhost:11434/api/tags", method="GET")
                    with urlopen(req, timeout=3) as resp:
                        if resp.status == 200:
                            break
                except Exception:
                    continue
            else:
                self._update_status(
                    "❌ Ollama no respondio", "#dc2626",
                    "Intenta iniciarlo manualmente con: ollama serve"
                )
                return

        # 3. Verificar modelo
        self._update_status("Verificando modelo...", progress=50)
        try:
            req = Request("http://localhost:11434/api/tags", method="GET")
            with urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode())
                models = [m["name"] for m in data.get("models", [])]
        except Exception:
            models = []

        if self.model_name not in models:
            self._update_status(f"Descargando {self.model_name}...", "#d97706", progress=60)
            proc = subprocess.Popen(
                [self.ollama_cmd, "pull", self.model_name],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0,
            )
            if proc.stdout is None:
                self._update_status(
                    "❌ Error iniciando ollama pull", "#dc2626",
                    "No se pudo capturar la salida del comando"
                )
                return
            for line in proc.stdout:
                line = line.strip()
                if line:
                    self.after(0, lambda t=line: self.detail_lbl.config(text=t))
            proc.wait(timeout=1800)
            if proc.returncode != 0:
                # Probar si es error de auth
                try:
                    test_req = Request(
                        "http://localhost:11434/api/generate",
                        data=json.dumps({"model": self.model_name, "prompt": "hi", "stream": False}).encode(),
                        headers={"Content-Type": "application/json"},
                    )
                    with urlopen(test_req, timeout=10) as r:
                        pass
                except Exception as test_e:
                    err_str = str(test_e)
                    if "401" in err_str or "Unauthorized" in err_str:
                        self._update_status(
                            "⚠️ Login de Ollama Cloud requerido", "#d97706",
                            "Hace clic en 'Login en Ollama Cloud' y segui las instrucciones."
                        )
                        self.after(0, lambda: self.btn_login.pack(pady=5))
                        return
                self._update_status(
                    f"❌ Error descargando modelo", "#dc2626",
                    "Verifica tu conexion o ejecuta ollama pull manualmente."
                )
                return

        # 4. Iniciar servidor web
        self._update_status("Iniciando servidor web...", "#d97706", progress=80)
        python_cmd = self._find_python()
        if not python_cmd:
            self._update_status(
                "❌ Python no encontrado", "#dc2626",
                "No se encontro Python ni el entorno virtual .venv"
            )
            return

        app_dir = Path(__file__).resolve().parent
        self.server_proc = subprocess.Popen(
            [python_cmd, "-m", "uvicorn", "web.main:app", "--host", "0.0.0.0", "--port", "8080"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            cwd=str(app_dir),
            creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0,
        )

        # Esperar a que levante
        for i in range(10):
            time.sleep(1)
            try:
                req = Request("http://localhost:8080", method="GET")
                with urlopen(req, timeout=3) as resp:
                    if resp.status == 200:
                        break
            except Exception:
                continue
        else:
            self._update_status(
                "❌ Servidor web no respondio", "#dc2626",
                "Revisa los logs o ejecuta manualmente."
            )
            return

        self._update_status(
            "✅ InformesCreator esta corriendo", "#16a34a",
            "http://localhost:8080", progress=100
        )
        self.after(0, lambda: self.btn_browser.config(state=tk.NORMAL))

    def _open_browser(self):
        webbrowser.open("http://localhost:8080")

    def _run_updater(self):
        if not messagebox.askyesno(
            "Actualizar InformesCreator",
            "Se cerrara InformesCreator para aplicar la actualizacion.\n\n¿Continuar?",
        ):
            return
        # Terminar uvicorn
        if self.server_proc and self.server_proc.poll() is None:
            self.server_proc.terminate()
            try:
                self.server_proc.wait(timeout=5)
            except Exception:
                self.server_proc.kill()
        # Ejecutar updater.py como proceso independiente
        pythonw = self._find_python()
        if pythonw:
            updater_path = Path(__file__).resolve().parent / "updater.py"
            subprocess.Popen(
                [pythonw, str(updater_path)],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0,
            )
        self.destroy()

    def _thread_login(self):
        self.btn_login.config(state=tk.DISABLED, text="Abriendo login...")
        threading.Thread(target=self._login_cloud, daemon=True).start()

    def _login_cloud(self):
        try:
            if not self.ollama_cmd:
                return
            subprocess.Popen(
                [self.ollama_cmd, "login"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0,
            )
            self._update_status(
                "ℹ️ Login iniciado", "#2563eb",
                "Segui las instrucciones en el navegador. Cuando termines, reinicia el launcher."
            )
        finally:
            self.after(0, lambda: self.btn_login.config(state=tk.NORMAL, text="Login en Ollama Cloud"))

    def _on_close(self):
        if self.server_proc and self.server_proc.poll() is None:
            self.server_proc.terminate()
            try:
                self.server_proc.wait(timeout=5)
            except Exception:
                self.server_proc.kill()
        self.destroy()


def main():
    app = LauncherApp()
    app.mainloop()


if __name__ == "__main__":
    main()
