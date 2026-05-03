from typing import Dict, List


# Preguntas del cuestionario
PEDAGOGICAL_QUESTIONS = [
    "Participación: ¿Interviene de manera pertinente durante las explicaciones o debates?",
    "Seguimiento de consignas: ¿Comprende y ejecuta las instrucciones de trabajo a la primera mención?",
    "Autonomía: ¿Inicia y avanza en sus tareas sin necesidad de supervisión constante?",
    "Organización: ¿Trae y mantiene ordenados los materiales necesarios para la clase?",
    "Persistencia: ¿Mantiene el esfuerzo ante una tarea que le resulta difícil o compleja?",
    "Cumplimiento: ¿Entrega las actividades o producciones en los plazos establecidos?",
]

SOCIOEMOTIONAL_QUESTIONS = [
    "Integración social: ¿Trabaja de forma colaborativa y armónica con sus compañeros?",
    "Gestión del error: ¿Acepta las correcciones o los errores sin mostrar frustración excesiva o bloqueo?",
    "Comunicación: ¿Expresa sus necesidades, dudas o desacuerdos de manera respetuosa?",
    "Respeto a las normas: ¿Se ajusta a los acuerdos de convivencia establecidos en el aula?",
    "Empatía: ¿Muestra actitudes de ayuda o respeto hacia las dificultades de los demás?",
    "Nivel de motivación: ¿Muestra curiosidad o disposición positiva hacia las actividades propuestas?",
]

CONTENT_INDICATORS = [
    "Explica con sus palabras",
    "Relaciona con temas previos",
    "Aplica en ejercicios prácticos",
    "Usa terminología adecuada",
    "Justifica sus respuestas",
]


def run_questionnaire() -> Dict:
    """Ejecuta el cuestionario interactivo y devuelve las respuestas."""
    print("\n" + "=" * 60)
    print("CUESTIONARIO DE PERFIL DEL ALUMNO")
    print("=" * 60)

    # 1. Valoración preliminar
    valoracion = _ask_option(
        "Valoración preliminar",
        ["TEA - Trayectoria Educativa Alcanzada", "TEP - Trayectoria Educativa en Proceso", "TED - Trayectoria Educativa Discontinua"],
    )

    # 2. Comportamiento Pedagógico
    print("\n--- I. COMPORTAMIENTO PEDAGÓGICO (Hábitos y Desempeño) ---")
    print("Escala: 1=NUNCA, 2=RARA VEZ, 3=EN OCASIONES, 4=SIEMPRE, 0=NO SE")
    pedagogical_answers = _ask_dimension(PEDAGOGICAL_QUESTIONS, max_value=4)

    # 3. Comportamiento Socioemocional
    print("\n--- II. COMPORTAMIENTO SOCIOEMOCIONAL (Vínculos y Clima) ---")
    print("Escala: 1=NUNCA, 2=RARA VEZ, 3=EN OCASIONES, 4=SIEMPRE, 0=NO SE")
    socioemotional_answers = _ask_dimension(SOCIOEMOTIONAL_QUESTIONS, max_value=4)

    # 4. Dominio de Contenidos
    print("\n--- III. DOMINIO DE CONTENIDOS ---")
    print("Escala: 1=No Logrado, 2=En Proceso, 3=Logrado, 0=NO SE")
    content_answers = _ask_dimension(CONTENT_INDICATORS, max_value=3)

    # 5. Observaciones particulares
    print("\n--- OBSERVACIONES PARTICULARES ---")
    particular = input("¿Hay algo particular que quieras mencionar? (opcional, Enter para omitir): ").strip()

    return {
        "valoracion": valoracion[:3],  # TEA, TEP o TED
        "pedagogical": pedagogical_answers,
        "socioemotional": socioemotional_answers,
        "content": content_answers,
        "particular_observations": particular,
    }


def _ask_dimension(questions: List[str], max_value: int) -> List:
    """Pregunta una dimensión completa y devuelve lista de respuestas numéricas."""
    answers = []
    for q in questions:
        while True:
            try:
                resp = input(f"  {q} (0-{max_value}): ").strip()
                if resp == "":
                    resp = "0"
                val = int(resp)
                if 0 <= val <= max_value:
                    answers.append(val if val != 0 else None)
                    break
                else:
                    print(f"    ⚠️  Ingresá un número entre 0 y {max_value}")
            except ValueError:
                print("    ⚠️  Ingresá un número válido")
    return answers


def _ask_option(title: str, options: List[str]) -> str:
    """Muestra opciones numeradas y devuelve la seleccionada."""
    print(f"\n{title}:")
    for i, opt in enumerate(options, 1):
        print(f"  {i}. {opt}")
    while True:
        try:
            resp = input("Seleccioná una opción: ").strip()
            idx = int(resp) - 1
            if 0 <= idx < len(options):
                return options[idx]
            else:
                print("  ⚠️  Opción inválida")
        except ValueError:
            print("  ⚠️  Ingresá un número válido")
