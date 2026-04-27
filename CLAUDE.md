# CLAUDE.md

Guidance for Claude Code (claude.ai/code) working with code in this repository.

## Project Overview

InformesCreator — Python desktop/web app for Argentine teachers to generate student progress reports using Ollama AI. Runs as CLI wizard (`app/main.py`) or local FastAPI web server (`app/web/main.py`) with vanilla JS SPA frontend. Primary distribution target is Windows, with `.bat`/`.vbs` launchers and Tkinter-based installer GUI (`app/install_gui.py`).

## Common Commands

Run web server (development):
```bash
python app/web/main.py
# or
uvicorn app.web.main:app --host 0.0.0.0 --port 8080 --reload
```

Run tests (all):
```bash
python -m pytest tests/ -v
```

Run single test file:
```bash
python -m pytest tests/test_web_api.py -v
```

Generate Windows distribution ZIP:
```bash
python build_dist.py
```

Build executable (requires PyInstaller):
```bash
python app/build_exe.py
```

## Architecture

### Dual Entry Points
- **CLI**: `app/main.py` — interactive terminal wizard. Imports modules directly from `app/`.
- **Web**: `app/web/main.py` — FastAPI app. Mounts `app/web/api/routes.py` at `/api` and serves `app/web/static/` as static SPA. Auto-opens browser on start.

### Path Resolution (`app/paths.py`)
All file I/O goes through `paths.py`. Key directories:
- `root_path()` → repo root
- `user_data_path()` → `user_data/` (config, course sessions, profile)
- `reports_path()` → `Informes/` (generated reports)

`sys.path` mutated at module load time so imports work regardless of cwd.

### Configuration (`app/config.py`)
`Config` — singleton-like JSON manager. **Critical behavior**:
- When running from PyInstaller `.exe`, config lives in `%APPDATA%\InformesCreator\config.json` (Windows) or `~/.config/informescreator/` (Linux/macOS).
- In development, config lives in `user_data/config.json`.
- `config.set("base_path", ...)` resolves relative paths against `root_path()`.

### Data Model

**Course folder structure** (teacher provides this):
```
Mi escuela/CURSOS/
  <Curso>/
    Alumnos/
      <Apellido_Nombre>.md
```

**Student markdown** (`app/student_parser.py`): Each `.md` has header, observations table (codes P, A, P-EXC, P-X, T), and summary section. `parse_student_file()` returns `Student` dataclass.

**Course session** (`app/course_manager.py`): Per-course state stored in `user_data/curso_<slug>.json`. Contains:
- `contenidos` — course syllabus text
- `respuestas` — questionnaire answers per student filename
- `progreso` — list of completed students

Core persistence layer for web wizard flow.

### Ollama Integration (`app/setup_ollama.py`, `app/ollama_client.py`)
- `setup_ollama.py` detects Ollama executable (PATH + common Windows paths), checks if server running, can auto-start.
- Web API exposes `/api/ollama/status` for frontend to check state.
- Default model: `gemma4:31b-cloud` (cloud model, requires `ollama login`). Local models like `gemma3` also supported.
- `generate_report()` in `ollama_client.py` calls Ollama chat API with system prompt + user prompt built from student data.

### Prompt Builder (`app/prompt_builder.py`)
Builds prompts from questionnaire answers. Uses frequency maps (1=NUNCA…4=SIEMPRE for pedagogical/socioemotional, 1=No Logrado…3=Logrado for content). Attendance warning if absences exceed 30%.

### Variants (`app/variants.py`)
Report variants (Formal, Detallado, Breve) hardcoded. Custom variants added via `user_data/variants.json` — see README.md for format. Each variant defines `tone_instructions` and `word_count_target`.

### Authentication
Web app has single-user local auth system:
- `POST /api/auth/register` — creates `user_data/profile.json` (hashed password). Only works once.
- `POST /api/auth/login` — validates credentials.
- No sessions/tokens; frontend checks `profile.json` existence to decide login/register flow.

### Windows Distribution
- `install_windows.bat` — legacy console installer (installs Python, Ollama, deps, model).
- `install_gui.bat` — preferred installer; runs `app/install_gui.py` via `pythonw` (no console window).
- `InformesCreator.bat` — daily launcher; activates venv, starts Ollama server if needed, pulls model if missing, then runs `uvicorn app.web.main:app`.
- `InformesCreator.vbs` — silent launcher that calls `.bat` without terminal window.
- `app/launcher.py` — Tkinter GUI launcher (alternative to `.bat`).
- `app/updater.py` — Tkinter updater fetches GitHub releases and hot-swaps `app/`.

Venv for installed apps lives at `%LOCALAPPDATA%\InformesCreator\.venv\`.

## Important Patterns

- **Course slugification**: `course_manager._slugify()` lowercases and replaces spaces with underscores. Used to name session JSON files.
- **Report output**: `report_saver.save_report()` writes to `<output_dir>/<Curso>/Informe_<Apellido>_<Nombre>.md`.
- **Frontend API calls**: SPA hits `/api/...`. FastAPI router mounted with `prefix="/api"`.
- **Folder picker**: Web backend has `/api/pick-folder` which tries Tkinter → PowerShell → Zenity to open native folder dialog.
- **Git ignore**: `user_data/`, `Informes/`, `.venv/`, `dist/`, `build/` ignored. Never commit user data or generated reports.