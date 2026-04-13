from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/gym_tracker"
    GOOGLE_CLIENT_ID: str = ""
    JWT_SECRET: str = "change-me-to-a-random-secret"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_HOURS: int = 168

    class Config:
        env_file = os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env")


@lru_cache()
def get_settings() -> Settings:
    return Settings()
