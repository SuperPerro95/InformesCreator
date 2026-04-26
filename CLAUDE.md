# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

InformesCreator is a Python CLI application that generates student progress reports ("informes de avance") for a teacher. It combines:
1. Existing class notes stored as per-student markdown files
2. An interactive questionnaire filled per student
3. AI text generation via the Ollama API (`/api/chat`)

The target user is an English teacher at ESN5 school in Argentina. The application runs natively on Windows.

## Input Data Structure

Student notes are markdown files located at:
```
E:\Google_Drive\Base\Mi escuela\CURSOS\<Course>\Alumnos\<LastName_FirstName>.md
```

Each file contains:
- Student name and course in the header (`# Aguilar Carus, SANTINO`)
- Course and list number (`**Curso:** 1ro B ESN5 | **Lista Nº:** 1`)
- An observations table with columns: Fecha, Código, Tipo, Comentario
- A summary section with total absences, consecutive absences, and last update date

## Architecture

The codebase follows a modular architecture with clear separation of concerns:

- `main.py` — CLI entry point and workflow orchestration
- `config.py` — Configuration management via `config.json`
- `course_manager.py` — Course discovery, content persistence, and student listing
- `student_parser.py` — Markdown parsing into structured data (`Student`, `Observation` classes)
- `questionnaire.py` — Interactive questionnaire for pedagogical/socioemotional data
- `prompt_builder.py` — Prompt construction for Ollama with style variants
- `ollama_client.py` — HTTP client for Ollama's `/api/chat` endpoint
- `report_saver.py` — Report output to markdown files
- `variants.py` — Report style variant management (formal, detailed, brief, custom)

## Configuration

Configuration is stored in `config.json` (auto-created with defaults):
```json
{
    "base_path": "E:\\Google_Drive\\Base\\Mi escuela\\CURSOS",
    "ollama_url": "http://localhost:11434",
    "model": "gemma3",
    "output_dir": "Informes",
    "default_variant": "A"
}
```

Course contents are persisted to `curso_<slug>.json` files so the teacher only enters them once per course.

## Report Style Variants

Three predefined variants exist:
- **A (Formal y conciso)**: ~100-150 words, objective, standard
- **B (Detallado)**: ~200-250 words, more developed
- **C (Breve y directo)**: ~50-80 words, essential only

Custom variants can be defined in `variants.json`.

## Prompt Requirements

All reports must be:
- Written in **first person**, descriptive and objective tone
- **NOT** directed to the student's family (no "su hijo/a", "les informamos")
- As concise as possible
- Sounding like a human teacher wrote them, not AI-generated

## API Integration

Ollama is called via POST to `/api/chat` with the message format:
```json
{
    "model": "gemma3",
    "messages": [
        {"role": "system", "content": "..."},
        {"role": "user", "content": "..."}
    ]
}
```

## Dependencies

Managed via `requirements.txt`:
- `requests` for HTTP calls
- `rich` for enhanced CLI output (optional but planned)

## Testing

Tests live in the `tests/` directory. The plan specifies these test modules:
- `test_student_parser.py`
- `test_course_manager.py`
- `test_prompt_builder.py`
- `test_ollama_client.py` (using mocks)

## Common Commands

Install dependencies:
```
pip install -r requirements.txt
```

Run the application:
```
python main.py
```

Run a specific test:
```
python -m pytest tests/test_student_parser.py -v
```

Run all tests:
```
python -m pytest tests/ -v
```
