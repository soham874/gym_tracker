from sqlalchemy import Column, Integer, String, Date, Numeric, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.sql.elements import quoted_name
from backend.app.core.database import Base


class WorkoutSet(Base):
    __tablename__ = "workout_sets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    date = Column(quoted_name("date", True), Date, nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)
    exercise_name = Column(String(100), nullable=False, index=True)
    sets = Column(quoted_name("sets", True), Integer, nullable=False)
    reps = Column(quoted_name("reps", True), Integer, nullable=False)
    weight_kg = Column(Numeric(6, 2), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
