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
from .extensions import db, ma, jwt
from .routes.auth_routes import auth_bp
from .routes.task_routes import tasks_bp
from .routes.plan_routes import plans_bp
from .routes.group_routes import study_groups_bp
from .routes.invite_and_groupplan_routes import invites_bp, group_plans_bp
from .routes.notification_routes import notifications_bp
from flask_cors import CORS
from flask_migrate import Migrate

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    # Enable CORS globally for all routes and methods, allow all HTTP methods
    CORS(app, supports_credentials=True, origins=["http://localhost:5173"], methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"])

    db.init_app(app)
    ma.init_app(app)
    jwt.init_app(app)
    Migrate(app, db)

    app.register_blueprint(auth_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(plans_bp)
    app.register_blueprint(study_groups_bp)
    app.register_blueprint(invites_bp)
    app.register_blueprint(group_plans_bp)
    app.register_blueprint(notifications_bp)


    @app.route('/api/health')
    def health():
        return jsonify({'status':'ok'})

    return app
