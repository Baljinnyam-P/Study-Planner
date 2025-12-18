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
from flask_socketio import SocketIO
import os

db = SQLAlchemy()
ma = Marshmallow()
jwt = JWTManager()

# Socket.IO CORS must match frontend origin when using credentials
_origins = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
origins_list = [o.strip() for o in _origins.split(',') if o.strip()]
socketio = SocketIO(cors_allowed_origins=origins_list)
