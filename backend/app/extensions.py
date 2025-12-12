# -------------------------------------------------------------
# Why: This file initializes Flask extensions (SQLAlchemy, Marshmallow, JWT, etc.).
#
# Why this design?
#   - Centralizes extension setup for clarity and maintainability.
#   - Keeps app factory and main logic clean and focused.
#   - Makes it easy to add, remove, or update extensions as needed.
#   - Follows Flask best practices for scalable projects.
# -------------------------------------------------------------
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_jwt_extended import JWTManager

db = SQLAlchemy()
ma = Marshmallow()
jwt = JWTManager()
