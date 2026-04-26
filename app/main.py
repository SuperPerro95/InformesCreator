#!/usr/bin/env python3
"""
InformesCreator - Generador de Informes de Avance
Punto de entrada principal de la aplicación CLI.
"""

from pathlib import Path

from config import Config
from course_manager import (
    discover_courses,
    get_course_contents,
    get_students,
    save_course_contents,
    create_student_template,
)
from ollama_client import generate_report
from prompt_builder import build_system_prompt, build_user_prompt
from questionnaire import run_questionnaire
from report_saver import save_report
from setup_ollama import setup_ollama, select_model, ensure_model_downloaded
from variants import get_variant_by_id, load_variants


def main():
    print("=" * 60)
    print("  InformesCreator - Generador de Informes de Avance")
    print("=" * 60)

    # ==========================================
    # ETAPA 1: Configuración de Ollama
    # ==========================================
    config = Config()
    ollama_url = config.ollama_url

    if not setup_ollama(ollama_url):
        print("\n❌ No se pudo configurar Ollama. El proceso no puede continuar.")
        return

    # Seleccionar modelo
    selected_model = select_model(ollama_url, config.model)
    if not selected_model:
        print("❌ No se seleccionó ningún modelo. El proceso no puede continuar.")
        return

    # Verificar que el modelo esté descargado
    if not ensure_model_downloaded(selected_model, ollama_url):
        print("❌ El modelo no está disponible. El proceso no puede continuar.")
        return

    if selected_model != config.model:
        config.set("model", selected_model)
        print(f"✅ Modelo configurado: {selected_model}")
    else:
        print(f"✅ Modelo actual: {selected_model}")

    # ==========================================
    # ETAPA 2: Configuración de archivos/carpeta
    # ==========================================
    print("\n📁 ETAPA 2: Configuración de archivos")
    print("-" * 40)

    base_path = config.base_path
    has_folder = input("¿Ya tenés una carpeta con los archivos de los alumnos? (S/N): ").strip().upper()

    if has_folder == "S":
        custom_path = input(f"Ruta actual: {base_path}\n¿Querés cambiarla? (S/N): ").strip().upper()
        if custom_path == "S":
            new_path = input("Ingresá la nueva ruta: ").strip()
            if new_path:
                config.set("base_path", new_path)
                base_path = Path(new_path)
    else:
        print("\nVamos a crear la estructura de carpetas.")
        new_path = input("¿Dónde querés guardar los archivos? (ruta completa): ").strip()
        if not new_path:
            new_path = str(base_path)
        base_path = Path(new_path)

        course_name = input("Nombre del curso (ej: 1ro B ESN5): ").strip()
        if not course_name:
            print("❌ Debes ingresar un nombre de curso.")
            return

        print("\nIngresá la lista de alumnos (uno por línea, Enter vacío para terminar):")
        students_list = []
        while True:
            name = input("  Alumno: ").strip()
            if not name:
                break
            students_list.append(name)

        if not students_list:
            print("❌ Debes ingresar al menos un alumno.")
            return

        # Crear estructura
        course_dir = base_path / course_name / "Alumnos"
        course_dir.mkdir(parents=True, exist_ok=True)

        for i, name in enumerate(students_list, 1):
            filepath = course_dir / f"Alumno_{i:02d}.md"
            template = create_student_template(course_name, name, i)
            filepath.write_text(template, encoding="utf-8")

        print(f"✅ Estructura creada en: {course_dir}")
        print(f"   {len(students_list)} archivos de alumno generados.")
        config.set("base_path", str(base_path))

    # ==========================================
    # ETAPA 3: Configuración de curso/alumnos
    # ==========================================
    print("\n👥 ETAPA 3: Selección de curso y alumno")
    print("-" * 40)

    courses = discover_courses(base_path)
    if not courses:
        print("❌ No se encontraron cursos en la ruta especificada.")
        return

    print("Cursos disponibles:")
    for i, c in enumerate(courses, 1):
        print(f"  {i}. {c}")

    try:
        course_idx = int(input("Seleccioná un curso: ")) - 1
        if not (0 <= course_idx < len(courses)):
            print("Opción inválida.")
            return
    except ValueError:
        print("Entrada inválida.")
        return

    selected_course = courses[course_idx]
    course_path = base_path / selected_course

    students = get_students(course_path)
    if not students:
        print("❌ No se encontraron alumnos en este curso.")
        return

    print(f"\nAlumnos de {selected_course}:")
    for i, s in enumerate(students, 1):
        print(f"  {i}. {s.nombre_completo} (Lista {s.lista_numero})")

    try:
        student_idx = int(input("Seleccioná un alumno: ")) - 1
        if not (0 <= student_idx < len(students)):
            print("Opción inválida.")
            return
    except ValueError:
        print("Entrada inválida.")
        return

    selected_student = students[student_idx]

    # Mostrar resumen automático
    print(f"\n📊 Resumen de {selected_student.nombre_completo}:")
    print(f"   Presentes: {selected_student.total_presentes}")
    print(f"   Ausencias: {selected_student.total_ausencias}")
    print(f"   Inasistencias seguidas: {selected_student.inasistencias_seguidas}")
    if selected_student.observaciones:
        print("   Últimas observaciones:")
        for obs in selected_student.observaciones[-3:]:
            if obs.comentario:
                print(f"     - {obs.fecha}: {obs.comentario}")

    # ==========================================
    # ETAPA 4: Configuración de contenidos
    # ==========================================
    print("\n📚 ETAPA 4: Contenidos del curso")
    print("-" * 40)

    contents = get_course_contents(selected_course)
    if contents:
        print(f"Contenidos actuales:\n{contents}")
        change = input("¿Querés modificarlos? (S/N): ").strip().upper()
        if change == "S":
            print("Ingresá los nuevos contenidos (Enter vacío para terminar):")
            lines = []
            while True:
                line = input()
                if not line:
                    break
                lines.append(line)
            contents = "\n".join(lines)
            save_course_contents(selected_course, contents)
    else:
        print("No hay contenidos registrados para este curso.")
        print("Ingresá los contenidos desarrollados hasta el momento (Enter vacío para terminar):")
        lines = []
        while True:
            line = input()
            if not line:
                break
            lines.append(line)
        contents = "\n".join(lines)
        save_course_contents(selected_course, contents)
        print("✅ Contenidos guardados.")

    # ==========================================
    # ETAPA 5: Cuestionario
    # ==========================================
    print("\n📝 ETAPA 5: Cuestionario")
    print("-" * 40)

    answers = run_questionnaire()

    # ==========================================
    # ETAPA 6: Nivel de detalle
    # ==========================================
    print("\n🎨 ETAPA 6: Variante de informe")
    print("-" * 40)

    variants = load_variants()
    print("Variantes disponibles:")
    for v in variants:
        print(f"  {v.id}. {v.name} ({v.description})")

    default_variant = config.default_variant
    variant_input = input(f"Seleccioná una variante (default: {default_variant}): ").strip().upper()
    if not variant_input:
        variant_input = default_variant

    variant = get_variant_by_id(variant_input)
    if not variant:
        print(f"Variante inválida, usando {default_variant}.")
        variant = get_variant_by_id(default_variant)

    # ==========================================
    # ETAPA 7: Generación del informe
    # ==========================================
    print("\n🤖 ETAPA 7: Generando informe...")
    print("-" * 40)

    system_prompt = build_system_prompt(variant)
    user_prompt = build_user_prompt(selected_student, contents, answers, variant)

    print("Enviando solicitud a Ollama...")
    report_content = generate_report(system_prompt, user_prompt, config)

    if not report_content:
        print("❌ No se pudo generar el informe.")
        return

    print("✅ Informe generado correctamente.")

    # Guardar informe
    output_path = save_report(
        selected_course,
        selected_student,
        report_content,
        str(config.output_dir),
    )
    print(f"📄 Informe guardado en: {output_path}")

    print("\n" + "=" * 60)
    print("  ¡Informe completado!")
    print("=" * 60)


if __name__ == "__main__":
    main()
