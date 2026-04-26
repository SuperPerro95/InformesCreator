#!/usr/bin/env python3
"""
InformesCreator - Instalador Grafico (Wizard)
Uso:
    python install_gui.py
    o
    install_gui.bat
"""

import json
import os
import shutil
import subprocess
import sys
import threading
import time
import tkinter as tk
from pathlib import Path
from tkinter import messagebox, ttk
from urllib.request import Request, urlopen


# Directorios base (script ahora vive en app/)
APP_DIR = Path(__file__).resolve().parent
ROOT_DIR = APP_DIR.parent


def _read_version() -> str:
    try:
        vfile = APP_DIR / "version.txt"
        return vfile.read_text(encoding="utf-8").strip()
    except Exception:
        return "1.0.0"

CLOUD_MODELS = [
    ("gemma4:31b-cloud", "~20 GB", "~15-25 min"),
    ("qwen3.5:cloud", "~18 GB", "~12-22 min"),
    ("nemotron-3-super:cloud", "~22 GB", "~18-30 min"),
    ("gemini-3-flash-preview:cloud", "~12 GB", "~8-15 min"),
    ("deepseek-v4-flash:cloud", "~16 GB", "~10-18 min"),
]

LOCAL_MODELS = [
    ("gemma3", "~5 GB", "~5-8 min"),
    ("llama3.1", "~8 GB", "~8-12 min"),
]


class InstallWizard(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title(f"InformesCreator - Instalador v{_read_version()}")
        self.geometry("700x520")
        self.resizable(False, False)
        self.configure(bg="#ffffff")

        # Centrar ventana
        self.update_idletasks()
        x = (self.winfo_screenwidth() // 2) - (700 // 2)
        y = (self.winfo_screenheight() // 2) - (520 // 2)
        self.geometry(f"+{x}+{y}")

        self.current_step = 0
        self.total_steps = 5
        self.python_cmd = None
        self.ollama_cmd = None
        self.model_name = "gemma4:31b-cloud"
        self.server_running = False
        self.installed_models = []

        self._build_ui()
        self._show_step(0)

    def _build_ui(self):
        # Frame superior: barra de progreso
        self.top_frame = tk.Frame(self, bg="#f8f9fa", height=60)
        self.top_frame.pack(fill=tk.X, side=tk.TOP)
        self.top_frame.pack_propagate(False)

        self.step_labels = []
        steps_text = ["Python", "Ollama", "Modelo", "Dependencias", "Listo"]
        for i, text in enumerate(steps_text):
            lbl = tk.Label(
                self.top_frame,
                text=text,
                font=("Inter", 10, "bold"),
                bg="#f8f9fa",
                fg="#9ca3af",
                width=12,
            )
            lbl.pack(side=tk.LEFT, padx=8, pady=10)
            self.step_labels.append(lbl)

        self.progress_bar = ttk.Progressbar(
            self.top_frame, orient=tk.HORIZONTAL, length=650, mode="determinate"
        )
        self.progress_bar.pack(side=tk.BOTTOM, padx=25, pady=(0, 10))
        self.progress_bar["maximum"] = self.total_steps

        # Separador
        ttk.Separator(self, orient=tk.HORIZONTAL).pack(fill=tk.X)

        # Frame de contenido
        self.content_frame = tk.Frame(self, bg="#ffffff")
        self.content_frame.pack(fill=tk.BOTH, expand=True, padx=30, pady=20)

        # Frame de botones
        self.btn_frame = tk.Frame(self, bg="#ffffff", height=60)
        self.btn_frame.pack(fill=tk.X, side=tk.BOTTOM)
        self.btn_frame.pack_propagate(False)

        self.btn_prev = tk.Button(
            self.btn_frame,
            text="Anterior",
            font=("Inter", 11),
            bg="#f3f4f6",
            fg="#374151",
            activebackground="#e5e7eb",
            bd=0,
            padx=20,
            pady=8,
            cursor="hand2",
            command=self._prev_step,
        )
        self.btn_prev.pack(side=tk.LEFT, padx=(25, 10), pady=10)

        self.btn_next = tk.Button(
            self.btn_frame,
            text="Siguiente",
            font=("Inter", 11, "bold"),
            bg="#2563eb",
            fg="#ffffff",
            activebackground="#1d4ed8",
            bd=0,
            padx=20,
            pady=8,
            cursor="hand2",
            command=self._next_step,
        )
        self.btn_next.pack(side=tk.RIGHT, padx=(10, 25), pady=10)

    def _update_progress(self):
        self.progress_bar["value"] = self.current_step
        for i, lbl in enumerate(self.step_labels):
            if i < self.current_step:
                lbl.config(fg="#2563eb")
            elif i == self.current_step:
                lbl.config(fg="#111827")
            else:
                lbl.config(fg="#9ca3af")

    def _clear_content(self):
        for widget in self.content_frame.winfo_children():
            widget.destroy()

    def _show_step(self, step):
        self.current_step = step
        self._update_progress()
        self._clear_content()
        self.btn_prev.config(state=tk.NORMAL if step > 0 else tk.DISABLED)

        # Ajustar altura de ventana segun el paso
        if step == 2:
            self.geometry("700x620")
        else:
            self.geometry("700x520")

        if step == 0:
            self._build_step_python()
        elif step == 1:
            self._build_step_ollama()
        elif step == 2:
            self._build_step_model()
        elif step == 3:
            self._build_step_deps()
        elif step == 4:
            self._build_step_finish()

    def _next_step(self):
        if self.current_step < self.total_steps - 1:
            self._show_step(self.current_step + 1)

    def _prev_step(self):
        if self.current_step > 0:
            self._show_step(self.current_step - 1)

    # ================================================================
    # PASO 1: PYTHON
    # ================================================================
    def _build_step_python(self):
        tk.Label(
            self.content_frame,
            text="Paso 1: Verificar Python",
            font=("Nunito", 18, "bold"),
            bg="#ffffff",
            fg="#111827",
        ).pack(anchor=tk.W, pady=(0, 10))

        self.python_status_lbl = tk.Label(
            self.content_frame,
            text="Verificando...",
            font=("Inter", 12),
            bg="#ffffff",
            fg="#6b7280",
        )
        self.python_status_lbl.pack(anchor=tk.W, pady=5)

        self.python_detail_lbl = tk.Label(
            self.content_frame,
            text="",
            font=("Inter", 10),
            bg="#ffffff",
            fg="#6b7280",
        )
        self.python_detail_lbl.pack(anchor=tk.W, pady=2)

        self.btn_install_python = tk.Button(
            self.content_frame,
            text="Instalar Python",
            font=("Inter", 11, "bold"),
            bg="#2563eb",
            fg="#ffffff",
            activebackground="#1d4ed8",
            bd=0,
            padx=20,
            pady=8,
            cursor="hand2",
            command=self._thread_install_python,
        )
        self.btn_install_python.pack(anchor=tk.W, pady=15)
        self.btn_install_python.pack_forget()  # Ocultar hasta que haga falta

        self.btn_next.config(state=tk.DISABLED)
        self._check_python()

    def _check_python(self):
        for cmd in ["python", "py", "python3"]:
            path = shutil.which(cmd)
            if path:
                try:
                    result = subprocess.run(
                        [path, "--version"],
                        capture_output=True,
                        text=True,
                        timeout=5,
                    )
                    version = result.stdout.strip() or result.stderr.strip()
                    self.python_cmd = path
                    self.python_status_lbl.config(
                        text=f"✅ Python detectado: {version}", fg="#16a34a"
                    )
                    self.python_detail_lbl.config(text=f"Ruta: {path}")
                    self.btn_next.config(state=tk.NORMAL)
                    return
                except Exception:
                    continue

        # Buscar en ubicaciones tipicas de Windows
        for ver in ["312", "311", "310"]:
            path = Path.home() / "AppData" / "Local" / "Programs" / f"Python\\Python{ver}" / "python.exe"
            if path.exists():
                self.python_cmd = str(path)
                self.python_status_lbl.config(
                    text=f"✅ Python detectado: {path.name}", fg="#16a34a"
                )
                self.python_detail_lbl.config(text=f"Ruta: {path}")
                self.btn_next.config(state=tk.NORMAL)
                return

        self.python_status_lbl.config(
            text="❌ Python no esta instalado", fg="#dc2626"
        )
        self.python_detail_lbl.config(
            text="Se necesita Python 3.10 o superior. Hace clic en 'Instalar Python'."
        )
        self.btn_install_python.pack(anchor=tk.W, pady=15)
        self.btn_next.config(state=tk.DISABLED)

    def _thread_install_python(self):
        self.btn_install_python.config(state=tk.DISABLED, text="Instalando...")
        threading.Thread(target=self._install_python, daemon=True).start()

    def _install_python(self):
        try:
            installer_url = "https://www.python.org/ftp/python/3.12.9/python-3.12.9-amd64.exe"
            installer_path = Path("python_installer.exe")

            self.after(0, lambda: self.python_status_lbl.config(
                text="⏳ Descargando Python...", fg="#d97706"
            ))

            # Descargar
            data = urlopen(installer_url, timeout=120).read()
            installer_path.write_bytes(data)

            self.after(0, lambda: self.python_status_lbl.config(
                text="⏳ Instalando Python...", fg="#d97706"
            ))

            # Instalar silenciosamente
            target = Path.home() / "AppData" / "Local" / "Programs" / "Python" / "Python312"
            subprocess.run(
                [
                    str(installer_path),
                    "/quiet",
                    "InstallAllUsers=0",
                    "PrependPath=1",
                    "Include_test=0",
                    f"TargetDir={target}",
                ],
                check=True,
                timeout=300,
            )
            installer_path.unlink(missing_ok=True)

            python_path = target / "python.exe"
            if python_path.exists():
                self.python_cmd = str(python_path)
                self.after(0, lambda: (
                    self.python_status_lbl.config(
                        text="✅ Python instalado correctamente", fg="#16a34a"
                    ),
                    self.python_detail_lbl.config(text=f"Ruta: {python_path}"),
                    self.btn_install_python.pack_forget(),
                    self.btn_next.config(state=tk.NORMAL),
                ))
            else:
                raise FileNotFoundError("No se encontro python.exe despues de instalar")

        except Exception as e:
            self.after(0, lambda: (
                self.python_status_lbl.config(
                    text=f"❌ Error instalando Python: {e}", fg="#dc2626"
                ),
                self.btn_install_python.config(state=tk.NORMAL, text="Reintentar"),
            ))

    # ================================================================
    # PASO 2: OLLAMA
    # ================================================================
    def _build_step_ollama(self):
        tk.Label(
            self.content_frame,
            text="Paso 2: Verificar Ollama",
            font=("Nunito", 18, "bold"),
            bg="#ffffff",
            fg="#111827",
        ).pack(anchor=tk.W, pady=(0, 10))

        self.ollama_status_lbl = tk.Label(
            self.content_frame,
            text="Verificando...",
            font=("Inter", 12),
            bg="#ffffff",
            fg="#6b7280",
        )
        self.ollama_status_lbl.pack(anchor=tk.W, pady=5)

        self.ollama_detail_lbl = tk.Label(
            self.content_frame,
            text="",
            font=("Inter", 10),
            bg="#ffffff",
            fg="#6b7280",
        )
        self.ollama_detail_lbl.pack(anchor=tk.W, pady=2)

        self.btn_install_ollama = tk.Button(
            self.content_frame,
            text="Instalar Ollama",
            font=("Inter", 11, "bold"),
            bg="#2563eb",
            fg="#ffffff",
            activebackground="#1d4ed8",
            bd=0,
            padx=20,
            pady=8,
            cursor="hand2",
            command=self._thread_install_ollama,
        )
        self.btn_start_ollama = tk.Button(
            self.content_frame,
            text="Iniciar servidor Ollama",
            font=("Inter", 11, "bold"),
            bg="#16a34a",
            fg="#ffffff",
            activebackground="#15803d",
            bd=0,
            padx=20,
            pady=8,
            cursor="hand2",
            command=self._thread_start_ollama,
        )

        self.btn_retry_ollama = tk.Button(
            self.content_frame,
            text="Reintentar",
            font=("Inter", 11, "bold"),
            bg="#2563eb",
            fg="#ffffff",
            activebackground="#1d4ed8",
            bd=0,
            padx=20,
            pady=8,
            cursor="hand2",
            command=self._check_ollama,
        )

        self.btn_done_ollama = tk.Button(
            self.content_frame,
            text="Ya esta instalado",
            font=("Inter", 11, "bold"),
            bg="#16a34a",
            fg="#ffffff",
            activebackground="#15803d",
            bd=0,
            padx=20,
            pady=8,
            cursor="hand2",
            command=self._check_ollama,
        )

        self.btn_next.config(state=tk.DISABLED)
        self._check_ollama()

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

    def _check_ollama(self):
        self.ollama_cmd = self._find_ollama()
        if not self.ollama_cmd:
            self.ollama_status_lbl.config(
                text="❌ Ollama no esta instalado", fg="#dc2626"
            )
            self.ollama_detail_lbl.config(
                text="Ollama es necesario para generar informes con IA. Hace clic en 'Instalar Ollama'."
            )
            self.btn_install_ollama.pack(anchor=tk.W, pady=15)
            self.btn_next.config(state=tk.DISABLED)
            return

        self.ollama_status_lbl.config(
            text="✅ Ollama instalado", fg="#16a34a"
        )
        self.ollama_detail_lbl.config(text=f"Ruta: {self.ollama_cmd}")

        # Verificar si el servidor esta corriendo
        try:
            req = Request("http://localhost:11434/api/tags", method="GET")
            with urlopen(req, timeout=3) as resp:
                if resp.status == 200:
                    self.server_running = True
                    self.ollama_status_lbl.config(
                        text="✅ Ollama instalado y servidor activo", fg="#16a34a"
                    )
                    self.btn_next.config(state=tk.NORMAL)
                    return
        except Exception:
            pass

        self.ollama_status_lbl.config(
            text="⚠️ Ollama instalado pero el servidor no esta corriendo", fg="#d97706"
        )
        self.ollama_detail_lbl.config(
            text="Hace clic en 'Iniciar servidor Ollama' para levantarlo."
        )
        self.btn_start_ollama.pack(anchor=tk.W, pady=15)
        self.btn_next.config(state=tk.DISABLED)

    def _thread_install_ollama(self):
        self.btn_install_ollama.config(state=tk.DISABLED, text="Instalando...")
        threading.Thread(target=self._install_ollama, daemon=True).start()

    def _install_ollama(self):
        try:
            self.after(0, lambda: self.ollama_status_lbl.config(
                text="⏳ Descargando Ollama...", fg="#d97706"
            ))

            url = "https://ollama.com/download/OllamaSetup.exe"
            installer = Path("OllamaSetup.exe")
            data = urlopen(url, timeout=120).read()
            installer.write_bytes(data)

            self.after(0, lambda: self.ollama_status_lbl.config(
                text="⏳ Instalando Ollama...", fg="#d97706"
            ))

            subprocess.run([str(installer), "/S"], check=True, timeout=120)
            installer.unlink(missing_ok=True)

            self.ollama_cmd = self._find_ollama()
            if self.ollama_cmd:
                self.after(0, lambda: (
                    self.ollama_status_lbl.config(
                        text="✅ Ollama instalado", fg="#16a34a"
                    ),
                    self.ollama_detail_lbl.config(text=f"Ruta: {self.ollama_cmd}"),
                    self.btn_install_ollama.pack_forget(),
                    self.btn_retry_ollama.pack_forget(),
                    self.btn_done_ollama.pack_forget(),
                    self._check_ollama(),
                ))
            else:
                self.after(0, lambda: (
                    self.ollama_status_lbl.config(
                        text="⚠️ Completa la instalacion de Ollama", fg="#d97706"
                    ),
                    self.ollama_detail_lbl.config(
                        text="Si se abrio un instalador de Ollama, termina la instalacion y hace clic en un boton."
                    ),
                    self.btn_install_ollama.pack_forget(),
                    self.btn_retry_ollama.pack(anchor=tk.W, pady=(5, 0)),
                    self.btn_done_ollama.pack(anchor=tk.W, pady=(5, 0)),
                ))

        except Exception as e:
            self.after(0, lambda: (
                self.ollama_status_lbl.config(
                    text=f"❌ Error instalando Ollama: {e}", fg="#dc2626"
                ),
                self.btn_install_ollama.config(state=tk.NORMAL, text="Reintentar"),
            ))

    def _thread_start_ollama(self):
        self.btn_start_ollama.config(state=tk.DISABLED, text="Iniciando...")
        threading.Thread(target=self._start_ollama, daemon=True).start()

    def _start_ollama(self):
        try:
            if not self.ollama_cmd:
                raise RuntimeError("Ollama no encontrado")

            subprocess.Popen(
                [self.ollama_cmd, "serve"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0,
            )

            self.after(0, lambda: self.ollama_status_lbl.config(
                text="⏳ Esperando a que Ollama este listo...", fg="#d97706"
            ))

            for i in range(15):
                time.sleep(1)
                try:
                    req = Request("http://localhost:11434/api/tags", method="GET")
                    with urlopen(req, timeout=3) as resp:
                        if resp.status == 200:
                            self.server_running = True
                            self.after(0, lambda: (
                                self.ollama_status_lbl.config(
                                    text="✅ Ollama instalado y servidor activo", fg="#16a34a"
                                ),
                                self.ollama_detail_lbl.config(text="Servidor respondiendo en localhost:11434"),
                                self.btn_start_ollama.pack_forget(),
                                self.btn_next.config(state=tk.NORMAL),
                            ))
                            return
                except Exception:
                    continue

            raise TimeoutError("Ollama no respondio despues de 15 segundos")

        except Exception as e:
            self.after(0, lambda: (
                self.ollama_status_lbl.config(
                    text=f"❌ Error iniciando Ollama: {e}", fg="#dc2626"
                ),
                self.btn_start_ollama.config(state=tk.NORMAL, text="Reintentar"),
            ))

    # ================================================================
    # PASO 3: MODELO
    # ================================================================
    def _build_step_model(self):
        # Header con titulo y boton Continuar arriba a la derecha
        header_frame = tk.Frame(self.content_frame, bg="#ffffff")
        header_frame.pack(fill=tk.X, pady=(0, 10))

        tk.Label(
            header_frame,
            text="Paso 3: Configurar modelo de IA",
            font=("Nunito", 18, "bold"),
            bg="#ffffff",
            fg="#111827",
        ).pack(side=tk.LEFT)

        self.btn_continue_top = tk.Button(
            header_frame,
            text="Continuar →",
            font=("Inter", 11, "bold"),
            bg="#2563eb",
            fg="#ffffff",
            activebackground="#1d4ed8",
            bd=0,
            padx=20,
            pady=6,
            cursor="hand2",
            command=self._next_step,
        )
        self.btn_continue_top.pack(side=tk.RIGHT)

        # Boton Instalar mas tarde - arriba para ser mas accesible
        self.btn_skip_models = tk.Button(
            self.content_frame,
            text="Instalar mas tarde →",
            font=("Inter", 10, "bold"),
            bg="#f3f4f6",
            fg="#374151",
            activebackground="#e5e7eb",
            bd=0,
            padx=15,
            pady=5,
            cursor="hand2",
            command=self._skip_models,
        )
        self.btn_skip_models.pack(anchor=tk.W, pady=(0, 5))

        self.model_status_lbl = tk.Label(
            self.content_frame,
            text="Verificando modelos disponibles...",
            font=("Inter", 12),
            bg="#ffffff",
            fg="#6b7280",
        )
        self.model_status_lbl.pack(anchor=tk.W, pady=5)

        # Cloud models section
        tk.Label(
            self.content_frame,
            text="Modelos Cloud (requieren internet):",
            font=("Inter", 11, "bold"),
            bg="#ffffff",
            fg="#374151",
        ).pack(anchor=tk.W, pady=(10, 5))

        self.cloud_models_frame = tk.Frame(self.content_frame, bg="#ffffff")
        self.cloud_models_frame.pack(fill=tk.X, pady=2)

        # Local models section
        tk.Label(
            self.content_frame,
            text="Modelos Locales (opcional, se descargan en disco):",
            font=("Inter", 11, "bold"),
            bg="#ffffff",
            fg="#374151",
        ).pack(anchor=tk.W, pady=(15, 0))

        tk.Label(
            self.content_frame,
            text="⚠️ Los modelos locales requieren un ordenador potente.",
            font=("Inter", 9),
            bg="#ffffff",
            fg="#d97706",
        ).pack(anchor=tk.W, pady=(0, 5))

        self.local_models_frame = tk.Frame(self.content_frame, bg="#ffffff")
        self.local_models_frame.pack(fill=tk.X, pady=2)

        self.selected_local_model = tk.StringVar(value="none")

        self.btn_install_local = tk.Button(
            self.content_frame,
            text="Instalar modelo local seleccionado",
            font=("Inter", 11, "bold"),
            bg="#16a34a",
            fg="#ffffff",
            activebackground="#15803d",
            bd=0,
            padx=20,
            pady=8,
            cursor="hand2",
            command=self._thread_install_local,
        )

        self.model_detail_lbl = tk.Label(
            self.content_frame,
            text="",
            font=("Inter", 10),
            bg="#ffffff",
            fg="#6b7280",
        )
        self.model_detail_lbl.pack(anchor=tk.W, pady=2)

        self.btn_login_cloud = tk.Button(
            self.content_frame,
            text="Login en Ollama Cloud",
            font=("Inter", 11, "bold"),
            bg="#7c3aed",
            fg="#ffffff",
            activebackground="#6d28d9",
            bd=0,
            padx=20,
            pady=8,
            cursor="hand2",
            command=self._thread_login_cloud,
        )

        self.btn_next.config(state=tk.DISABLED)
        self.btn_continue_top.config(state=tk.DISABLED)
        self._check_model()

    def _skip_models(self):
        self.model_status_lbl.config(
            text="ℹ️ Modelos omitidos. Podes descargarlos despues desde el launcher.", fg="#2563eb"
        )
        self.btn_skip_models.pack_forget()
        self.btn_login_cloud.pack_forget()
        for row in self.cloud_models_frame.winfo_children():
            for widget in row.winfo_children():
                if isinstance(widget, tk.Button):
                    widget.config(state=tk.DISABLED)
        self.btn_next.config(state=tk.NORMAL)
        self.btn_continue_top.config(state=tk.NORMAL)

    def _check_model(self):
        try:
            req = Request("http://localhost:11434/api/tags", method="GET")
            with urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode())
                self.installed_models = [m["name"] for m in data.get("models", [])]
        except Exception:
            self.installed_models = []

        installed = self.installed_models

        # Rebuild cloud models UI
        for widget in self.cloud_models_frame.winfo_children():
            widget.destroy()

        any_cloud_installed = False
        for model, _, _ in CLOUD_MODELS:
            is_installed = model in installed
            if is_installed:
                any_cloud_installed = True
            color = "#16a34a" if is_installed else "#dc2626"
            icon = "✅" if is_installed else "❌"
            row = tk.Frame(self.cloud_models_frame, bg="#ffffff")
            row.pack(fill=tk.X, pady=2)
            tk.Label(
                row,
                text=f"{icon} {model}",
                font=("Inter", 10),
                bg="#ffffff",
                fg=color,
                anchor=tk.W,
                width=35,
            ).pack(side=tk.LEFT)
            if not is_installed:
                btn = tk.Button(
                    row,
                    text="Instalar",
                    font=("Inter", 9, "bold"),
                    bg="#2563eb",
                    fg="#ffffff",
                    activebackground="#1d4ed8",
                    bd=0,
                    padx=12,
                    pady=2,
                    cursor="hand2",
                    command=lambda m=model: self._thread_pull_single(m),
                )
                btn.pack(side=tk.RIGHT)

        cloud_count = sum(1 for m, _, _ in CLOUD_MODELS if m in installed)
        total_cloud = len(CLOUD_MODELS)

        if any_cloud_installed:
            self.model_status_lbl.config(
                text=f"✅ {cloud_count}/{total_cloud} modelos cloud disponibles. Podes continuar.", fg="#16a34a"
            )
            self.btn_next.config(state=tk.NORMAL)
            self.btn_continue_top.config(state=tk.NORMAL)
        else:
            self.model_status_lbl.config(
                text=f"❌ Ningun modelo cloud instalado. Instala al menos uno para continuar.", fg="#dc2626"
            )
            self.btn_next.config(state=tk.DISABLED)
            self.btn_continue_top.config(state=tk.DISABLED)

        # Rebuild local models UI
        for widget in self.local_models_frame.winfo_children():
            widget.destroy()

        # Option: none
        rb_none = tk.Radiobutton(
            self.local_models_frame,
            text="Ninguno (usar solo modelos cloud)",
            variable=self.selected_local_model,
            value="none",
            bg="#ffffff",
            fg="#374151",
            font=("Inter", 10),
            selectcolor="#ffffff",
        )
        rb_none.pack(anchor=tk.W, pady=1)

        for model, size, time_est in LOCAL_MODELS:
            is_installed = model in installed
            color = "#16a34a" if is_installed else "#374151"
            icon = "✅" if is_installed else "○"
            text = f"{icon} {model}   {size}   {time_est}"
            rb = tk.Radiobutton(
                self.local_models_frame,
                text=text,
                variable=self.selected_local_model,
                value=model,
                bg="#ffffff",
                fg=color,
                font=("Inter", 10),
                selectcolor="#ffffff",
            )
            rb.pack(anchor=tk.W, pady=1)
            if is_installed:
                rb.config(state=tk.DISABLED)

        selected = self.selected_local_model.get()
        if selected == "none" or selected in installed:
            self.btn_install_local.pack_forget()
        else:
            self.btn_install_local.pack(anchor=tk.W, pady=10)

    def _thread_pull_single(self, model):
        self._disable_cloud_buttons()
        threading.Thread(target=self._pull_single, args=(model,), daemon=True).start()

    def _disable_cloud_buttons(self):
        def _do():
            for row in self.cloud_models_frame.winfo_children():
                for widget in row.winfo_children():
                    if isinstance(widget, tk.Button):
                        widget.config(state=tk.DISABLED)
        self.after(0, _do)

    def _pull_single(self, model):
        try:
            if not self.ollama_cmd:
                raise RuntimeError("Ollama no encontrado")

            self.after(0, lambda: self.model_status_lbl.config(
                text=f"⏳ Descargando {model}...", fg="#d97706"
            ))

            proc = subprocess.Popen(
                [self.ollama_cmd, "pull", model],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0,
            )

            for line in proc.stdout:
                line = line.strip()
                if line:
                    self.after(0, lambda l=line: self.model_detail_lbl.config(text=l))

            proc.wait(timeout=600)
            if proc.returncode != 0:
                raise RuntimeError(f"ollama pull fallo para {model} con codigo {proc.returncode}")

            self.after(0, self._check_model)

        except Exception as e:
            self.after(0, lambda: (
                self.model_status_lbl.config(
                    text=f"❌ Error descargando {model}: {e}", fg="#dc2626"
                ),
                self.btn_login_cloud.pack(anchor=tk.W, pady=(0, 10)),
                self._check_model(),
            ))

    def _thread_install_local(self):
        self.btn_install_local.config(state=tk.DISABLED, text="Descargando...")
        threading.Thread(target=self._install_local_model, daemon=True).start()

    def _install_local_model(self):
        try:
            model = self.selected_local_model.get()
            if model == "none":
                return
            if not self.ollama_cmd:
                raise RuntimeError("Ollama no encontrado")

            self.after(0, lambda: self.model_status_lbl.config(
                text=f"⏳ Descargando {model}...", fg="#d97706"
            ))

            proc = subprocess.Popen(
                [self.ollama_cmd, "pull", model],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0,
            )

            for line in proc.stdout:
                line = line.strip()
                if line:
                    self.after(0, lambda l=line: self.model_detail_lbl.config(text=l))

            proc.wait(timeout=600)
            if proc.returncode != 0:
                raise RuntimeError(f"ollama pull fallo con codigo {proc.returncode}")

            self.after(0, lambda: (
                self.model_status_lbl.config(
                    text=f"✅ {model} instalado", fg="#16a34a"
                ),
                self._check_model(),
            ))

        except Exception as e:
            self.after(0, lambda: (
                self.model_status_lbl.config(
                    text=f"❌ Error descargando modelo local: {e}", fg="#dc2626"
                ),
                self.btn_install_local.config(state=tk.NORMAL, text="Reintentar"),
            ))

    def _thread_login_cloud(self):
        self.btn_login_cloud.config(state=tk.DISABLED, text="Abriendo navegador...")
        threading.Thread(target=self._login_cloud, daemon=True).start()

    def _login_cloud(self):
        try:
            if not self.ollama_cmd:
                raise RuntimeError("Ollama no encontrado")

            self.after(0, lambda: self.model_status_lbl.config(
                text="⏳ Abriendo login de Ollama Cloud...", fg="#d97706"
            ))

            subprocess.Popen(
                [self.ollama_cmd, "login"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0,
            )

            self.after(0, lambda: (
                self.model_status_lbl.config(
                    text="ℹ️ Login iniciado. Segui las instrucciones en el navegador.", fg="#2563eb"
                ),
                self.model_detail_lbl.config(
                    text="Cuando termines, hace clic en 'Reintentar descargar modelos cloud'."
                ),
                self.btn_login_cloud.config(state=tk.NORMAL, text="Login en Ollama Cloud"),
                self.btn_pull_cloud.config(state=tk.NORMAL, text="Reintentar descargar modelos cloud"),
                self.btn_pull_cloud.pack(anchor=tk.W, pady=10),
            ))

        except Exception as e:
            self.after(0, lambda: (
                self.model_status_lbl.config(
                    text=f"❌ Error iniciando login: {e}", fg="#dc2626"
                ),
                self.btn_login_cloud.config(state=tk.NORMAL, text="Login en Ollama Cloud"),
            ))

    # ================================================================
    # PASO 4: DEPENDENCIAS
    # ================================================================
    def _build_step_deps(self):
        tk.Label(
            self.content_frame,
            text="Paso 4: Instalar dependencias",
            font=("Nunito", 18, "bold"),
            bg="#ffffff",
            fg="#111827",
        ).pack(anchor=tk.W, pady=(0, 10))

        self.deps_status_lbl = tk.Label(
            self.content_frame,
            text="Listo para instalar dependencias de Python.",
            font=("Inter", 12),
            bg="#ffffff",
            fg="#6b7280",
        )
        self.deps_status_lbl.pack(anchor=tk.W, pady=5)

        self.deps_progress = ttk.Progressbar(
            self.content_frame, orient=tk.HORIZONTAL, length=600, mode="determinate"
        )
        self.deps_progress.pack(fill=tk.X, pady=10)
        self.deps_progress["value"] = 0

        self.deps_detail_lbl = tk.Label(
            self.content_frame,
            text="",
            font=("Inter", 10),
            bg="#ffffff",
            fg="#6b7280",
        )
        self.deps_detail_lbl.pack(anchor=tk.W, pady=2)

        self.btn_install_deps = tk.Button(
            self.content_frame,
            text="Instalar dependencias",
            font=("Inter", 11, "bold"),
            bg="#2563eb",
            fg="#ffffff",
            activebackground="#1d4ed8",
            bd=0,
            padx=20,
            pady=8,
            cursor="hand2",
            command=self._thread_install_deps,
        )
        self.btn_install_deps.pack(anchor=tk.W, pady=15)

        self.btn_next.config(state=tk.DISABLED)

    def _thread_install_deps(self):
        self.btn_install_deps.config(state=tk.DISABLED, text="Instalando...")
        threading.Thread(target=self._install_deps, daemon=True).start()

    def _install_deps(self):
        try:
            if not self.python_cmd:
                raise RuntimeError("Python no encontrado")

            self.after(0, lambda: self.deps_status_lbl.config(
                text="⏳ Creando entorno virtual...", fg="#d97706"
            ))
            self.after(0, lambda: self.deps_progress.config(value=20))

            venv_path = ROOT_DIR / ".venv"
            if not venv_path.exists():
                subprocess.run(
                    [self.python_cmd, "-m", "venv", str(venv_path)],
                    check=True,
                    timeout=60,
                )

            self.after(0, lambda: self.deps_status_lbl.config(
                text="⏳ Instalando paquetes...", fg="#d97706"
            ))
            self.after(0, lambda: self.deps_progress.config(value=50))

            # Determinar pip path
            if sys.platform == "win32":
                pip_path = venv_path / "Scripts" / "pip.exe"
            else:
                pip_path = venv_path / "bin" / "pip"

            proc = subprocess.Popen(
                [str(pip_path), "install", "-r", str(APP_DIR / "requirements.txt")],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
            )

            for line in proc.stdout:
                line = line.strip()
                if line:
                    self.after(0, lambda l=line: self.deps_detail_lbl.config(text=l))

            proc.wait(timeout=180)
            if proc.returncode != 0:
                raise RuntimeError(f"pip install fallo con codigo {proc.returncode}")

            self.after(0, lambda: (
                self.deps_status_lbl.config(
                    text="✅ Dependencias instaladas correctamente", fg="#16a34a"
                ),
                self.deps_progress.config(value=100),
                self.btn_install_deps.pack_forget(),
                self.btn_next.config(state=tk.NORMAL),
            ))

        except Exception as e:
            self.after(0, lambda: (
                self.deps_status_lbl.config(
                    text=f"❌ Error instalando dependencias: {e}", fg="#dc2626"
                ),
                self.btn_install_deps.config(state=tk.NORMAL, text="Reintentar"),
            ))

    # ================================================================
    # PASO 5: FINALIZAR
    # ================================================================
    def _build_step_finish(self):
        tk.Label(
            self.content_frame,
            text="¡Listo!",
            font=("Nunito", 24, "bold"),
            bg="#ffffff",
            fg="#16a34a",
        ).pack(anchor=tk.CENTER, pady=(20, 10))

        tk.Label(
            self.content_frame,
            text="InformesCreator esta instalado y configurado.",
            font=("Inter", 12),
            bg="#ffffff",
            fg="#374151",
        ).pack(anchor=tk.CENTER, pady=5)

        self.create_shortcut_var = tk.BooleanVar(value=True)
        tk.Checkbutton(
            self.content_frame,
            text="Crear acceso directo en el escritorio",
            font=("Inter", 11),
            bg="#ffffff",
            fg="#374151",
            variable=self.create_shortcut_var,
            activebackground="#ffffff",
        ).pack(anchor=tk.CENTER, pady=15)

        btn_start = tk.Button(
            self.content_frame,
            text="Iniciar InformesCreator",
            font=("Inter", 12, "bold"),
            bg="#2563eb",
            fg="#ffffff",
            activebackground="#1d4ed8",
            bd=0,
            padx=30,
            pady=12,
            cursor="hand2",
            command=self._start_app,
        )
        btn_start.pack(anchor=tk.CENTER, pady=10)

        self.btn_prev.config(state=tk.DISABLED)
        self.btn_next.config(text="Cerrar", command=self.destroy)

    def _get_pythonw(self):
        if not self.python_cmd:
            return None
        path = Path(self.python_cmd)
        pythonw = path.with_name("pythonw.exe")
        if pythonw.exists():
            return str(pythonw)
        pythonw_no_ext = shutil.which("pythonw")
        if pythonw_no_ext:
            return pythonw_no_ext
        return self.python_cmd

    def _start_app(self):
        if self.create_shortcut_var.get():
            self._create_desktop_shortcut()

        pythonw = self._get_pythonw()
        launcher_path = APP_DIR / "launcher.py"
        if pythonw and launcher_path.exists():
            subprocess.Popen(
                [pythonw, str(launcher_path)],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == "win32" else 0,
            )
            messagebox.showinfo(
                "InformesCreator",
                "InformesCreator se esta iniciando.\n\nAccede a http://localhost:8080 en tu navegador.",
            )
            self.destroy()
        else:
            messagebox.showerror(
                "Error",
                "No se encontro launcher.py o pythonw.exe.",
            )

    def _create_desktop_shortcut(self):
        try:
            pythonw = self._get_pythonw()
            launcher_path = APP_DIR / "launcher.py"
            if not pythonw or not launcher_path.exists():
                return

            desktop = Path.home() / "Desktop"
            vbs_script = desktop / "CreateShortcut.vbs"
            vbs_content = f'''Set WshShell = CreateObject("WScript.Shell")
Set oLink = WshShell.CreateShortcut(WshShell.SpecialFolders("Desktop") & "\\InformesCreator.lnk")
oLink.TargetPath = "{pythonw}"
oLink.Arguments = "{launcher_path}"
oLink.WorkingDirectory = "{launcher_path.parent}"
oLink.IconLocation = "{pythonw},0"
oLink.Description = "InformesCreator - Generador de Informes de Avance"
oLink.Save
'''
            vbs_script.write_text(vbs_content, encoding="utf-8")
            subprocess.run(["cscript", "//nologo", str(vbs_script)], check=True, timeout=10)
            vbs_script.unlink(missing_ok=True)
        except Exception as e:
            print(f"Error creando acceso directo: {e}")


def main():
    app = InstallWizard()
    app.mainloop()


if __name__ == "__main__":
    main()
