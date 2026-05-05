from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "PlanIQ"
    debug: bool = False

    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    mongodb_url: str
    mongodb_db_name: str = "planiq"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )


settings = Settings()