"""
Prueba end-to-end completa del flujo de InformesCreator.

Esta prueba simula la ejecución completa de la aplicación:
1. Crea estructura de carpetas con un alumno de prueba
2. Simula el cuestionario
3. Construye el prompt
4. Simula la llamada a Ollama con mock
5. Verifica que el informe se genere y guarde correctamente
"""

import json
import os
import tempfile
from pathlib import Path
from unittest.mock import patch, MagicMock

from config import Config
from course_manager import get_students, get_course_contents, save_course_contents
from prompt_builder import build_system_prompt, build_user_prompt
from report_saver import save_report
from student_parser import parse_student_file
from variants import get_variant_by_id


SAMPLE_STUDENT_MD = """# Aguilar Carus, SANTINO

**Curso:** 1ro B ESN5 | **Lista Nº:** 1

---

## 📝 Observaciones

| Fecha | Código | Tipo | Comentario |
|-------|--------|------|------------|
| | | | |
| 2026-04-22 | P | Presente | Conversó y molestó toda la clase (no prestó atención) |
| 2026-04-23 | P-EXC | Presente excelente | Excelente trabajo en grupo |
| 2026-04-24 | A | Ausente | |

### Leyenda:
- **P** = Presente
- **A** = Ausente
- **P-EXC** = Presente excelente trabajo
- **P-x** = Presente sin material/tarea

---

## 📊 Resumen

- **Total Presentes:** 1
- **P-EXC:** 1
- **Tarde:** 0
- **Total Ausencias:** 1
- **Inasistencias seguidas:** 1
- **Última actualización:** 2026-04-24
"""


def test_end_to_end_full_flow():
    # Guardar el directorio original de forma segura
    try:
        original_dir = os.getcwd()
    except FileNotFoundError:
        original_dir = os.path.expanduser("~")

    with tempfile.TemporaryDirectory() as tmpdir:
        os.chdir(tmpdir)

        try:
            # ==========================================
            # ETAPA 2: Crear estructura de carpetas
            # ==========================================
            base_path = Path(tmpdir) / "CURSOS" / "1ro B ESN5" / "Alumnos"
            base_path.mkdir(parents=True)

            student_file = base_path / "Aguilar_Carus_SANTINO.md"
            student_file.write_text(SAMPLE_STUDENT_MD, encoding="utf-8")

            # ==========================================
            # ETAPA 3: Parsear alumno
            # ==========================================
            students = get_students(base_path.parent)
            assert len(students) == 1

            student = students[0]
            assert student.nombre_completo == "Aguilar Carus, SANTINO"
            assert student.lista_numero == 1
            assert student.curso == "1ro B ESN5"
            assert len(student.observaciones) == 3

            # ==========================================
            # ETAPA 4: Contenidos del curso
            # ==========================================
            contents = "Present simple, Past simple, Vocabulary"
            save_course_contents("1ro B ESN5", contents)

            loaded_contents = get_course_contents("1ro B ESN5")
            assert loaded_contents == contents

            # ==========================================
            # ETAPA 5: Simular respuestas del cuestionario
            # ==========================================
            answers = {
                "valoracion": "TEP",
                "pedagogical": [3, 2, 3, 3, 2, 3],
                "socioemotional": [4, 3, 3, 4, 3, 3],
                "content": [2, 2, 3, 2, 2],
                "particular_observations": "Muy participativo en clase",
            }

            # ==========================================
            # ETAPA 6: Seleccionar variante
            # ==========================================
            variant = get_variant_by_id("A")
            assert variant is not None
            assert variant.id == "A"

            # ==========================================
            # ETAPA 7: Construir prompt
            # ==========================================
            system_prompt = build_system_prompt(variant)
            assert "Sos docente de este alumno" in system_prompt
            assert "primera persona" in system_prompt
            assert "conciso" in system_prompt

            user_prompt = build_user_prompt(student, contents, answers, variant)
            assert "Aguilar Carus, SANTINO" in user_prompt
            assert "TEP" in user_prompt
            assert "Present simple, Past simple, Vocabulary" in user_prompt
            assert "Muy participativo en clase" in user_prompt
            assert "EN OCASIONES" in user_prompt  # From pedagogical mapping
            assert "En Proceso" in user_prompt  # From content mapping
            assert "100-150" in user_prompt  # Word count target

            # ==========================================
            # Simular llamada a Ollama
            # ==========================================
            with patch("requests.post") as mock_post:
                mock_post.return_value = MagicMock(
                    status_code=200,
                    raise_for_status=lambda: None,
                    json=lambda: {
                        "message": {
                            "content": "SANTINO AGUILAR CARUS presenta una trayectoria educativa en proceso. Interviene en ocasiones de manera pertinente durante las explicaciones. Comprende las instrucciones pero requiere apoyo constante. Trabaja colaborativamente con sus compañeros. Demuestra curiosidad por las actividades propuestas."
                        }
                    },
                )

                from ollama_client import generate_report
                from config import Config

                config = Config()
                config.set("model", "gemma3")

                report_content = generate_report(system_prompt, user_prompt, config)
                assert report_content is not None
                assert "SANTINO" in report_content

            # ==========================================
            # Guardar informe
            # ==========================================
            output_dir = Path(tmpdir) / "Informes"
            saved_path = save_report("1ro B ESN5", student, report_content, str(output_dir))

            assert saved_path.exists()
            saved_text = saved_path.read_text(encoding="utf-8")
            assert "Aguilar Carus, SANTINO" in saved_text
            assert "1ro B ESN5" in saved_text
            assert "SANTINO" in saved_text
            assert "Informe de Avance" in saved_text

            print("\n" + "=" * 60)
            print("✅ PRUEBA END-TO-END EXITOSA")
            print("=" * 60)
            print(f"Alumno parseado: {student.nombre_completo}")
            print(f"Observaciones: {len(student.observaciones)}")
            print(f"Contenidos cargados: {loaded_contents}")
            print(f"Variante: {variant.name}")
            print(f"Prompt system: {len(system_prompt)} chars")
            print(f"Prompt user: {len(user_prompt)} chars")
            print(f"Informe generado: {len(report_content)} chars")
            print(f"Archivo guardado: {saved_path}")
            print("=" * 60)

        finally:
            os.chdir(original_dir)


if __name__ == "__main__":
    test_end_to_end_full_flow()
