# -------------------------------------------------------------
# Why: This file contains the Flask app factory and main application setup.
#
# Why this design?
#   - App factory pattern enables flexible configuration and testing.
#   - Blueprints are registered here for modularity and scalability.
#   - Centralizes app setup, making it easier to manage extensions and config.
# -------------------------------------------------------------
from flask import Flask, jsonify
from .config import Config
from .extensions import db, ma, jwt, socketio
from .routes.auth_routes import auth_bp
from .routes.task_routes import tasks_bp
from .routes.plan_routes import plans_bp
from .routes.group_routes import study_groups_bp
from .routes.invite_and_groupplan_routes import invites_bp, group_plans_bp
from .routes.notification_routes import notifications_bp
from .routes.public_routes import public_bp
from flask_cors import CORS
import os
from flask_migrate import Migrate

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    # Enable CORS globally; configure allowed origins via FRONTEND_ORIGIN env (comma-separated), default to localhost
    _origins = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    origins_list = [o.strip() for o in _origins.split(',') if o.strip()]
    CORS(
        app,
        supports_credentials=True,
        origins=origins_list,
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["Authorization", "Content-Type", "Accept"],
        expose_headers=["Authorization"],
    )

    db.init_app(app)
    ma.init_app(app)
    jwt.init_app(app)
    Migrate(app, db)

    # Initialize Socket.IO (real-time updates, presence, notifications)
    socketio.init_app(app)
    # Import socket handlers to register events
    from . import sockets  # noqa: F401

    app.register_blueprint(auth_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(plans_bp)
    app.register_blueprint(study_groups_bp)
    app.register_blueprint(invites_bp)
    app.register_blueprint(group_plans_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(public_bp)


    @app.route('/api/health')
    def health():
        return jsonify({'status':'ok'})

    return app
