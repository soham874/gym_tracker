from sqlalchemy.orm import Session
from datetime import date
from typing import Optional
from backend.app.repositories.workout_repo import WorkoutRepository
from backend.app.models.workout import WorkoutSet
from backend.app.schemas.workout import WorkoutSetCreate, WorkoutBatchCreate
from backend.app.utils.unit_converter import convert_to_kg


class WorkoutService:
    def __init__(self, db: Session):
        self.repo = WorkoutRepository(db)

    def add_workout(self, data: WorkoutSetCreate, user_id: int) -> WorkoutSet:
        weight_kg = convert_to_kg(data.weight, data.unit.value)
        workout = WorkoutSet(
            user_id=user_id,
            date=data.date,
            category=data.category,
            exercise_name=data.exercise_name,
            sets=data.sets,
            reps=data.reps,
            weight_kg=weight_kg,
            notes=data.notes,
        )
        return self.repo.create(workout)

    def add_workout_batch(self, data: WorkoutBatchCreate, user_id: int) -> list[WorkoutSet]:
        workouts = []
        for entry in data.entries:
            weight_kg = convert_to_kg(entry.weight, entry.unit.value)
            workouts.append(WorkoutSet(
                user_id=user_id,
                date=data.date,
                category=data.category,
                exercise_name=data.exercise_name,
                sets=entry.sets,
                reps=entry.reps,
                weight_kg=weight_kg,
                notes=data.notes,
            ))
        return self.repo.create_bulk(workouts)

    def list_workouts(
        self,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        category: Optional[str] = None,
        exercise: Optional[str] = None,
        user_id: Optional[int] = None,
    ) -> list[WorkoutSet]:
        return self.repo.get_all(date_from, date_to, category, exercise, user_id)

    def get_summary(
        self,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        category: Optional[str] = None,
        exercise: Optional[str] = None,
        user_id: Optional[int] = None,
    ) -> list[dict]:
        return self.repo.get_summary(date_from, date_to, category, exercise, user_id)

    def get_exercises(self, user_id: Optional[int] = None) -> list[dict]:
        return self.repo.get_distinct_exercises(user_id)

    def delete_workout(self, workout_id: int, user_id: Optional[int] = None) -> bool:
        return self.repo.delete(workout_id, user_id)
