from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional
from enum import Enum


class WeightUnit(str, Enum):
    kg = "kg"
    lbs = "lbs"


class WorkoutSetCreate(BaseModel):
    date: date
    category: str = Field(..., min_length=1, max_length=50)
    exercise_name: str = Field(..., min_length=1, max_length=100)
    sets: int = Field(..., gt=0)
    reps: int = Field(..., gt=0)
    weight: float = Field(..., gt=0)
    unit: WeightUnit = WeightUnit.kg
    notes: Optional[str] = None


class SetEntry(BaseModel):
    sets: int = Field(..., gt=0)
    reps: int = Field(..., gt=0)
    weight: float = Field(..., gt=0)
    unit: WeightUnit = WeightUnit.kg


class WorkoutBatchCreate(BaseModel):
    date: date
    category: str = Field(..., min_length=1, max_length=50)
    exercise_name: str = Field(..., min_length=1, max_length=100)
    entries: list[SetEntry] = Field(..., min_length=1)
    notes: Optional[str] = None


class WorkoutSetResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    date: date
    category: str
    exercise_name: str
    sets: int
    reps: int
    weight_kg: float
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class WorkoutSummary(BaseModel):
    date: date
    category: str
    exercise_name: str
    total_sets: int
    total_reps: int
    max_weight_kg: float
    total_volume_kg: float
