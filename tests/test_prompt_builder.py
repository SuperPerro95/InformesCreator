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
