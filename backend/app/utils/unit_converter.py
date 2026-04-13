from backend.app.core.constants import LBS_TO_KG, KG_TO_LBS


def lbs_to_kg(lbs: float) -> float:
    return round(lbs * LBS_TO_KG, 2)


def kg_to_lbs(kg: float) -> float:
    return round(kg * KG_TO_LBS, 2)


def convert_to_kg(weight: float, unit: str) -> float:
    if unit.lower() == "lbs":
        return lbs_to_kg(weight)
    return round(weight, 2)
