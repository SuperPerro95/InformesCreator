import json
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional

from paths import user_data_path


@dataclass
class ReportVariant:
    id: str
    name: str
    description: str
    word_count_target: str
    tone_instructions: str


PREDEFINED_VARIANTS = [
    ReportVariant(
        id="A",
        name="Formal y conciso",
        description="~100-150 palabras, objetivo, estándar",
        word_count_target="100-150",
        tone_instructions=(
            "Variante: Formal y conciso (~100-150 palabras). "
            "Sé directo y profesional. Cubrí los aspectos pedagógicos y socioemocionales de manera breve pero completa."
        ),
    ),
    ReportVariant(
        id="B",
        name="Detallado",
        description="~200-250 palabras, más desarrollado",
        word_count_target="200-250",
        tone_instructions=(
            "Variante: Detallado (~200-250 palabras). "
            "Desarrollá con más profundidad cada aspecto mencionado. Aunque extenso, mantené la claridad y evitá redundancias."
        ),
    ),
    ReportVariant(
        id="C",
        name="Breve y directo",
        description="~50-80 palabras, esencial",
        word_count_target="50-80",
        tone_instructions=(
            "Variante: Breve y directo (~50-80 palabras). "
            "Solo lo esencial. Una o dos oraciones por aspecto. Máxima concisión."
        ),
    ),
]


def _resolve_variants_path() -> Optional[Path]:
    """Encuentra variants.json, soportando ejecución desde .exe de PyInstaller."""
    if getattr(sys, "frozen", False):
        # PyInstaller extrae archivos a sys._MEIPASS
        meipass = Path(sys._MEIPASS)
        bundled = meipass / "variants.json"
        if bundled.exists():
            return bundled
    local = user_data_path("variants.json")
    if local.exists():
        return local
    return None


def load_variants() -> List[ReportVariant]:
    """Carga variantes predefinidas + variantes personalizadas desde variants.json."""
    variants = PREDEFINED_VARIANTS.copy()
    custom_file = _resolve_variants_path()
    if custom_file and custom_file.exists():
        with open(custom_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            for item in data:
                variants.append(ReportVariant(**item))
    return variants


def get_variant_by_id(variant_id: str) -> Optional[ReportVariant]:
    """Obtiene una variante por su ID."""
    for v in load_variants():
        if v.id == variant_id:
            return v
    return None
