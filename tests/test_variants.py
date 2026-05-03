from variants import load_variants, get_variant_by_id, PREDEFINED_VARIANTS


def test_load_variants():
    variants = load_variants()
    assert len(variants) >= 3
    ids = [v.id for v in variants]
    assert "A" in ids
    assert "B" in ids
    assert "C" in ids


def test_get_variant_by_id():
    variant = get_variant_by_id("A")
    assert variant is not None
    assert variant.name == "Formal y conciso"
    assert variant.word_count_target == "100-150"


def test_get_variant_not_found():
    variant = get_variant_by_id("Z")
    assert variant is None
