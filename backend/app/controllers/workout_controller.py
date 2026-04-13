from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import date
from typing import Optional
from backend.app.core.database import get_db
from backend.app.core.constants import CATEGORIES
from backend.app.core.auth import get_current_user
from backend.app.models.user import User
from backend.app.schemas.workout import WorkoutSetCreate, WorkoutBatchCreate, WorkoutSetResponse, WorkoutSummary
from backend.app.services.workout_service import WorkoutService

router = APIRouter(prefix="/api/workouts", tags=["workouts"])


def get_service(db: Session = Depends(get_db)) -> WorkoutService:
    return WorkoutService(db)


@router.post("", response_model=WorkoutSetResponse, status_code=201)
def create_workout(
    data: WorkoutSetCreate,
    service: WorkoutService = Depends(get_service),
    user: User = Depends(get_current_user),
):
    if data.category not in CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category. Must be one of: {CATEGORIES}",
        )
    workout = service.add_workout(data, user.id)
    return workout


@router.post("/batch", response_model=list[WorkoutSetResponse], status_code=201)
def create_workout_batch(
    data: WorkoutBatchCreate,
    service: WorkoutService = Depends(get_service),
    user: User = Depends(get_current_user),
):
    if data.category not in CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category. Must be one of: {CATEGORIES}",
        )
    return service.add_workout_batch(data, user.id)


@router.get("", response_model=list[WorkoutSetResponse])
def list_workouts(
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    category: Optional[str] = Query(None),
    exercise: Optional[str] = Query(None),
    service: WorkoutService = Depends(get_service),
    user: User = Depends(get_current_user),
):
    return service.list_workouts(date_from, date_to, category, exercise, user.id)


@router.get("/summary", response_model=list[WorkoutSummary])
def get_summary(
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    category: Optional[str] = Query(None),
    exercise: Optional[str] = Query(None),
    service: WorkoutService = Depends(get_service),
    user: User = Depends(get_current_user),
):
    return service.get_summary(date_from, date_to, category, exercise, user.id)


@router.get("/exercises")
def get_exercises(
    service: WorkoutService = Depends(get_service),
    user: User = Depends(get_current_user),
):
    return service.get_exercises(user.id)


@router.get("/categories")
def get_categories():
    return CATEGORIES


@router.delete("/{workout_id}", status_code=204)
def delete_workout(
    workout_id: int,
    service: WorkoutService = Depends(get_service),
    user: User = Depends(get_current_user),
):
    deleted = service.delete_workout(workout_id, user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Workout not found")
