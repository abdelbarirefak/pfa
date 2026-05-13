from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./dev.db"
    jwt_secret: str = "super-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expires_in: int = 604800
    cors_origin: str = "http://localhost:3000"
    upload_dir: str = "./uploads"
    max_file_size: int = 20971520
    port: int = 8000

    model_config = {"env_file": ".env"}


settings = Settings()
