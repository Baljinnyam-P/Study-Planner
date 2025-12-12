# -------------------------------------------------------------
#  manage.py: Flask CLI entry point for admin/developer tasks and migrations.
#  Why this design?
#   - Separates management tasks from app runtime logic for clarity.
#   - Provides a dedicated interface for database migrations and setup.


"""
manage.py: Flask CLI entry point for admin/developer tasks and migrations.
Usage:
  flask --app manage.py db init
  flask --app manage.py db migrate -m "message"
  flask --app manage.py db upgrade
  flask --app manage.py create-db
 Use run.py for running the server.
"""

from dotenv import load_dotenv
import os
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

from flask import Flask
from app.models import db, User, Task, StudyPlan, StudyGroup, GroupMembership
from app.config import Config
from flask_migrate import Migrate

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
Migrate(app, db)
@app.cli.command("create-db")
def create_db():
    """Create all database tables."""
    db.create_all()
    print("Database tables created!")
