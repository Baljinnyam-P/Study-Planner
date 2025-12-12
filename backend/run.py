# -------------------------------------------------------------
# Why: This file is the WSGI entry point for deploying the Flask app.
#
# Why this design?
#   - Separates deployment logic from app logic for clarity.
#   - Keeps deployment concerns isolated from business logic and configuration.
#   - Follows Flask deployment best practices for scalability and maintainability.
# -------------------------------------------------------------
# -------------------------------------------------------------
# Study Planner Project - Submission Documentation
#
# Why this project?
#   - Designed to be a real, daily-use tool for students and study groups.
#   - Additional features: plan generation, drag-and-drop, group collaboration, and plan preview/editing.
#
# Why Flask?
#   - Simple, flexible, and perfect for RESTful APIs.
#   - Blueprints modularize routes for maintainability.
#
# Why SQLAlchemy and Marshmallow?
#   - SQLAlchemy enables easy model relationships and migrations.
#   - Marshmallow ensures all data is validated/serialized, so the API is robust and secure.
#
# Why JWT Auth?
#   - Ensures only registered users can access app features, providing security and session management.
#
# Why this structure?
#   - Blueprints, helpers, and schemas reduce repetition and make the codebase extensible.
#   - All protected routes require authentication and role checks for security.

#   - Features and UI/UX go beyond class demos, with modern React/Tailwind frontend and collaborative/group features.
# -------------------------------------------------------------
from dotenv import load_dotenv
import os
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

from app.main import create_app
app = create_app()
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)