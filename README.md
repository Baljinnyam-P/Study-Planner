# Study Planner Codebase Reference
# Study Planner

### Overview
StudyPlanner is a modern, collaborative web application designed to help students and professionals efficiently plan, track, and achieve their study goals.
Why: Traditional study tools lack real collaboration, flexible scheduling, and a user-friendly experience. StudyPlanner solves this by enabling group planning, intuitive drag-and-drop task management, and a beautiful, responsive interface.

### How:

Built with a Flask REST API (Python, SQLAlchemy, Marshmallow, JWT) for secure, scalable backend logic and robust data validation.
React (with Tailwind CSS and react-beautiful-dnd) powers a responsive, interactive frontend with drag-and-drop scheduling and real-time feedback.
PostgreSQL database (deployed on Render) ensures reliable, cloud-based data storage.
Features include authentication, group invites, plan preview/editing, analytics, and extensible architecture for future enhancements.

## Role:
I designed and implemented the full-stack application, from database schema and API endpoints to frontend UI/UX, authentication, and deployment. I focused on clean code, robust validation, and a professional, portfolio-ready user experience.

## Documentation

All architectural and design decisions are documented directly in the codebase as high-level "why" comments and docstrings. Please refer to the code files for detailed explanations of technology choices, design patterns, and implementation rationale.

## Quick Start

1. Install backend dependencies:
  ```bash
  cd backend
  pip install -r requirements.txt
  ```
2. Install frontend dependencies:
  ```bash
  cd ../frontend
  npm install
  ```
3. Run the backend:
  ```bash
  cd ../backend
  python run.py
  ```
4. Run the frontend:
  ```bash
  cd ../frontend
  npm run dev
  ```

## License


## How Things Work Together

- Authentication flows set and refresh tokens automatically; protected routes rely on `AuthContext` to gate access.
- Backend blueprints expose REST endpoints consumed by `axios.js` helpers; components and pages call these helpers to perform actions.
- Notifications are created by backend events (invites, plan joins) and surfaced via `NotificationBell`.
- Group collaboration features span routes, models, and UI components to support invites, shared plans, and participation records.

## Notes

- Environment variables for the backend database must be set (`DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`).
- The frontend expects the API at `VITE_API_BASE` or defaults to `http://127.0.0.1:5000/api`.

