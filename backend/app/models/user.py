from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from backend.app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    google_id = Column(String(255), nullable=False, unique=True, index=True)
    email = Column(String(255), nullable=False, unique=True, index=True)
    name = Column(String(255), nullable=False)
    picture = Column(String(512), nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
