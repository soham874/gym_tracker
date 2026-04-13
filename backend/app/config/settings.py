from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/gym_tracker"

    class Config:
        env_file = os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env")


@lru_cache()
def get_settings() -> Settings:
    return Settings()
