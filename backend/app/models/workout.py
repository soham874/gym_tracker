from sqlalchemy import Column, Integer, String, Date, Numeric, Text, DateTime
from sqlalchemy.sql import func
from backend.app.core.database import Base


class WorkoutSet(Base):
    __tablename__ = "workout_sets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(Date, nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)
    exercise_name = Column(String(100), nullable=False, index=True)
    sets = Column(Integer, nullable=False)
    reps = Column(Integer, nullable=False)
    weight_kg = Column(Numeric(6, 2), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
