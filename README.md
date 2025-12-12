# Study Planner Codebase Reference
# Study Planner

##Overview

Study Planner is a modern, collaborative web application for managing personal and group study plans. It features a Flask backend and a React frontend, supporting authentication, Plan generation, drag-and-drop editing, and group collaboration. The project is designed for extensibility, maintainability, and a seamless user experience.

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

