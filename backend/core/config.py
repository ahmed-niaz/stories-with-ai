from pydantic import field_validator
from pydantic_settings import BaseSettings


class CoreSettings(BaseSettings):
    API_PREFIX: str = "/api"
    DEBUG: bool = True
    DATABASE_URL: str
    ALLOWED_ORIGINS: str
    GEMINI_API_KEY: str
    GEMINI_MODEL: str = "gemini-3.5-flash-lite"

    @field_validator("ALLOWED_ORIGINS")
    def split_allowed_origins(cls, v: str) -> list[str]:
        return v.split(",") if v else []

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


core_setting_config = CoreSettings()
