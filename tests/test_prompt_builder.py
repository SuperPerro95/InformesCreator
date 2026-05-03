import types

from prompt_builder import build_system_prompt, build_user_prompt
from student_parser import Student, Observation
from variants import get_variant_by_id


def test_build_system_prompt():
    variant = get_variant_by_id("A")
    prompt = build_system_prompt(variant)
    assert "Sos docente de este alumno" in prompt
    assert "primera persona" in prompt
    assert "NO lo redactes como carta" in prompt
    assert "conciso" in prompt


def test_build_user_prompt():
    student = Student(
        nombre_completo="Aguilar Carus, SANTINO",
        lista_numero=1,
        curso="1ro B ESN5",
        observaciones=[
            Observation("2026-04-22", "P", "Presente", "Bien"),
        ],
        total_presentes=1,
        total_ausencias=0,
    )
    answers = {
        "valoracion": "TEP",
        "pedagogical": [3, 2, 3, 3, 2, 3],
        "socioemotional": [4, 3, 3, 4, 3, 3],
        "content": [2, 2, 3, 2, 2],
        "particular_observations": "Muy participativo",
    }
    variant = get_variant_by_id("A")
    prompt = build_user_prompt(student, "Present simple", answers, variant)

    assert "Aguilar Carus, SANTINO" in prompt
    assert "TEP" in prompt
    assert "Present simple" in prompt
    assert "Muy participativo" in prompt
    assert "EN OCASIONES" in prompt  # From pedagogical mapping
    assert "En Proceso" in prompt  # From content mapping


def test_build_user_prompt_with_questionnaire():
    """Verifica que build_user_prompt use el cuestionario dinámico cuando se le pasa."""
    student = Student(
        nombre_completo="Martinez, ALMA",
        lista_numero=12,
        curso="3ro B ESN5",
        observaciones=[],
        total_presentes=5,
        total_ausencias=0,
    )
    answers = {
        "valoracion": "TEA",
        "pedagogical": [3, 2],
        "socioemotional": [4, 3, 3],
        "content": [2, 3],
        "particular_observations": "",
    }
    variant = get_variant_by_id("A")

    questionnaire = types.SimpleNamespace(
        questions=[
            types.SimpleNamespace(
                section="valoracion",
                text="Valoración preliminar del alumno",
                title="Valoración",
                answer_type="tea_tep_ted",
            ),
            types.SimpleNamespace(
                section="pedagogical",
                text="Participación: ¿Interviene de manera pertinente?",
                title="Participación",
                answer_type="frequency_4",
            ),
            types.SimpleNamespace(
                section="pedagogical",
                text="Autonomía: ¿Inicia tareas sin supervisión?",
                title="Autonomía",
                answer_type="frequency_4",
            ),
            types.SimpleNamespace(
                section="socioemotional",
                text="Integración social: ¿Trabaja colaborativamente?",
                title="Integración social",
                answer_type="frequency_4",
            ),
            types.SimpleNamespace(
                section="socioemotional",
                text="Comunicación: ¿Expresa necesidades?",
                title="Comunicación",
                answer_type="frequency_4",
            ),
            types.SimpleNamespace(
                section="socioemotional",
                text="Respeto a las normas: ¿Se ajusta a los acuerdos?",
                title="Respeto",
                answer_type="frequency_4",
            ),
            types.SimpleNamespace(
                section="content",
                text="Explica con sus palabras",
                title="Explica",
                answer_type="achievement_3",
            ),
            types.SimpleNamespace(
                section="content",
                text="Relaciona con temas previos",
                title="Relaciona",
                answer_type="achievement_3",
            ),
        ]
    )

    prompt = build_user_prompt(
        student, "Present simple", answers, variant, questionnaire=questionnaire,
    )

    assert "Martinez, ALMA" in prompt
    assert "TEA" in prompt
    assert "I. COMPORTAMIENTO PEDAGÓGICO" in prompt
    assert "Participación: ¿Interviene de manera pertinente? → EN OCASIONES" in prompt
    assert "Autonomía: ¿Inicia tareas sin supervisión? → RARA VEZ" in prompt
    assert "II. COMPORTAMIENTO SOCIOEMOCIONAL" in prompt
    assert "Integración social: ¿Trabaja colaborativamente? → SIEMPRE" in prompt
    assert "Comunicación: ¿Expresa necesidades? → EN OCASIONES" in prompt
    assert "III. DOMINIO DE CONTENIDOS" in prompt
    assert "Explica con sus palabras → En Proceso" in prompt
    assert "Relaciona con temas previos → Logrado" in prompt
