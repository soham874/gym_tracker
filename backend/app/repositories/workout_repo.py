from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import date
from typing import Optional
from backend.app.models.workout import WorkoutSet


class WorkoutRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, workout: WorkoutSet) -> WorkoutSet:
        self.db.add(workout)
        self.db.commit()
        self.db.refresh(workout)
        return workout

    def create_bulk(self, workouts: list[WorkoutSet]) -> list[WorkoutSet]:
        self.db.add_all(workouts)
        self.db.commit()
        for w in workouts:
            self.db.refresh(w)
        return workouts

    def get_all(
        self,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        category: Optional[str] = None,
        exercise: Optional[str] = None,
    ) -> list[WorkoutSet]:
        query = self.db.query(WorkoutSet)
        if date_from:
            query = query.filter(WorkoutSet.date >= date_from)
        if date_to:
            query = query.filter(WorkoutSet.date <= date_to)
        if category:
            query = query.filter(WorkoutSet.category == category)
        if exercise:
            query = query.filter(WorkoutSet.exercise_name == exercise)
        return query.order_by(desc(WorkoutSet.date), desc(WorkoutSet.id)).all()

    def get_summary(
        self,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        category: Optional[str] = None,
        exercise: Optional[str] = None,
    ) -> list[dict]:
        query = self.db.query(
            WorkoutSet.date,
            WorkoutSet.category,
            WorkoutSet.exercise_name,
            func.sum(WorkoutSet.sets).label("total_sets"),
            func.sum(WorkoutSet.reps).label("total_reps"),
            func.max(WorkoutSet.weight_kg).label("max_weight_kg"),
            func.sum(WorkoutSet.sets * WorkoutSet.reps * WorkoutSet.weight_kg).label(
                "total_volume_kg"
            ),
        )
        if date_from:
            query = query.filter(WorkoutSet.date >= date_from)
        if date_to:
            query = query.filter(WorkoutSet.date <= date_to)
        if category:
            query = query.filter(WorkoutSet.category == category)
        if exercise:
            query = query.filter(WorkoutSet.exercise_name == exercise)
        rows = (
            query.group_by(
                WorkoutSet.date, WorkoutSet.category, WorkoutSet.exercise_name
            )
            .order_by(WorkoutSet.date)
            .all()
        )
        return [
            {
                "date": r.date,
                "category": r.category,
                "exercise_name": r.exercise_name,
                "total_sets": int(r.total_sets),
                "total_reps": int(r.total_reps),
                "max_weight_kg": float(r.max_weight_kg),
                "total_volume_kg": float(r.total_volume_kg),
            }
            for r in rows
        ]

    def get_distinct_exercises(self) -> list[dict]:
        rows = (
            self.db.query(WorkoutSet.category, WorkoutSet.exercise_name)
            .distinct()
            .order_by(WorkoutSet.category, WorkoutSet.exercise_name)
            .all()
        )
        return [{"category": r.category, "exercise_name": r.exercise_name} for r in rows]

    def delete(self, workout_id: int) -> bool:
        workout = self.db.query(WorkoutSet).filter(WorkoutSet.id == workout_id).first()
        if not workout:
            return False
        self.db.delete(workout)
        self.db.commit()
        return True
