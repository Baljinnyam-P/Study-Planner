# -------------------------------------------------------------
# Why: This file centralizes configuration for the Flask app (DB URI, JWT secret).
#
# Why this design?
#   - Keeps sensitive and environment-specific settings out of code.
#   - Enables easy switching between dev, test, and prod environments.
#   - Supports best practices for security and maintainability.
#   - Makes it easier to update settings without changing business logic.
# -------------------------------------------------------------
import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret")

    # Prefer DATABASE_URL if set (for production/Render), else build from individual vars (for local dev)
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    if not SQLALCHEMY_DATABASE_URI:
        _db_user = os.environ.get('DB_USER')
        _db_password = os.environ.get('DB_PASSWORD')
        _db_host = os.environ.get('DB_HOST')
        _db_port = os.environ.get('DB_PORT')
        _db_name = os.environ.get('DB_NAME')
        missing = [var for var, val in {
            'DB_USER': _db_user,
            'DB_PASSWORD': _db_password,
            'DB_HOST': _db_host,
            'DB_PORT': _db_port,
            'DB_NAME': _db_name
        }.items() if not val]
        if missing:
            raise RuntimeError(f"Missing required DB environment variables: {', '.join(missing)}")
        SQLALCHEMY_DATABASE_URI = (
            f"mysql+pymysql://{_db_user}:{_db_password}@{_db_host}:{_db_port}/{_db_name}"
        )
    SQLALCHEMY_TRACK_MODIFICATIONS = False


    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=int(os.getenv("JWT_ACCESS_MINUTES", 15)))
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=int(os.getenv("JWT_REFRESH_DAYS", 30)))

    JWT_TOKEN_LOCATION = ("headers",)
    PROPAGATE_EXCEPTIONS = True
