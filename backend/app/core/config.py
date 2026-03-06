from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    cors_origins: List[str] = ["http://localhost:3000"]
    monte_carlo_default_iterations: int = 20_000
    monte_carlo_max_iterations: int = 100_000
    environment: str = "development"


settings = Settings()
