# Study Planner

## Live Demo
**Frontend:** [https://project1-topaz-mu.vercel.app](https://project1-topaz-mu.vercel.app)  
**Backend API:** [https://study-planner-9brs.onrender.com](https://study-planner-9brs.onrender.com)

---

## Overview
A modern, full-stack collaborative study planning application that helps students and professionals efficiently manage tasks, create study plans, and collaborate in real-time. Built with Flask (Python) backend, React frontend, PostgreSQL database, and deployed on Render + Vercel.

**What I Built:**
- Complete RESTful API with JWT authentication and real-time WebSocket support
- Responsive React SPA with drag-and-drop task management and live notifications
- Automated study plan generation using round-robin scheduling algorithm
- Group collaboration features with role-based permissions and in-app invitations
- Production deployment with automated database migrations and CORS configuration

**Technical Highlights:**
- Flask-SocketIO for real-time bidirectional communication
- SQLAlchemy ORM with normalized database schema and proper foreign key relationships
- React Context API for global state management
- Gevent workers for concurrent WebSocket connections
- Automated CI/CD pipeline via GitHub → Render/Vercel

---

## Key Features

### Core Functionality
- **Secure Authentication:** JWT-based user registration, login, and protected routes
- **Task Management:** Full CRUD operations with priorities, due dates, drag-and-drop reordering, and completion tracking
- **Study Plan Generation:** Round-robin scheduling algorithm automatically generates optimized study plans from user tasks
- **Real-Time Notifications:** WebSocket-powered instant notifications for all user activities

### Collaboration Features
- **Study Groups:** Create/manage groups with role-based access control (owner, admin, member)
- **In-App Invitations:** Real-time invite system with accept/decline workflow
- **Shared Group Plans:** Collaborative planning with participant tracking and shared task assignments

### Advanced Capabilities
- **Analytics Dashboard:** Visual charts for task completion rates, priority distribution, and productivity metrics (Recharts)
- **Public Plan Sharing:** Generate unique URLs to share study plans publicly with JSON/TXT export
- **Task Dependencies:** Define prerequisite relationships for structured learning paths
- **Recurring Tasks:** Daily/weekly/monthly task automation
- **Reminder System:** Configurable deadline notifications

---

## Technology Stack

**Backend:** Flask 3.x • PostgreSQL • SQLAlchemy • Marshmallow • Flask-JWT-Extended • Flask-SocketIO • Gunicorn + Gevent

**Frontend:** React 18 • Vite • Tailwind CSS • React Router • Axios • Socket.IO Client • react-beautiful-dnd • Recharts

**DevOps:** Git/GitHub • Render (backend + PostgreSQL) • Vercel (frontend) • Flask-Migrate (auto-migrations) • Environment-based configuration

---

## Architecture Highlights

- **Modular Blueprint Architecture:** Organized routes by feature (auth, tasks, plans, groups, notifications) for scalability
- **Normalized Database Schema:** 9 tables with proper foreign key constraints and cascade deletes
- **JWT + Protected Routes:** Secure token-based authentication with decorator-based route protection
- **Real-Time WebSocket Layer:** Flask-SocketIO with room-based notification broadcasting
- **Automated Migrations:** Database schema updates run automatically on deployment via `AUTO_MIGRATE_ON_START` flag
- **CORS Configuration:** Environment-specific origin whitelisting for cross-origin security
- **Round-Robin Scheduler:** Custom algorithm distributes tasks optimally across study sessions

---

## Quick Start

**Backend:**
```bash
cd backend
pip install -r requirements.txt
# Set DATABASE_URL, JWT_SECRET_KEY, FRONTEND_ORIGIN in .env
python run.py
```

**Frontend:**
```bash
cd frontend
npm install
# Set VITE_API_BASE in .env
npm run dev
```

**Deployment:** Backend on Render (PostgreSQL + Gunicorn + gevent workers), Frontend on Vercel (with SPA routing config)

---

## Project Structure

```
study-planner/
├── backend/
│   ├── app/
│   │   ├── routes/         # Auth, tasks, plans, groups, invites, notifications, public endpoints
│   │   ├── services/       # Round-robin scheduling algorithm
│   │   ├── models.py       # SQLAlchemy models (9 tables)
│   │   ├── schemas.py      # Marshmallow validation schemas
│   │   ├── sockets.py      # Socket.IO event handlers
│   │   └── main.py         # Flask app factory, CORS, blueprints
│   ├── migrations/         # Alembic database migrations
│   └── run.py             # WSGI entry with auto-migration
│
└── frontend/
    ├── src/
    │   ├── pages/          # Dashboard, Plans, Groups, Analytics, Auth, PublicViewer
    │   ├── components/     # Navbar, ProtectedRoute, InvitesPanel
    │   ├── contexts/       # AuthContext for global state
    │   ├── lib/socket.js   # Socket.IO client
    │   └── api/axios.js    # HTTP client with interceptors
    └── vercel.json        # SPA routing configuration
```

---

## Implementation Highlights

**Security:** Bcrypt password hashing, JWT tokens, CORS whitelisting, SQL injection prevention via ORM, Marshmallow input validation

**Performance:** Database indexing on emails/FKs, gevent workers for async I/O, persistent WebSocket connections, efficient JSON serialization

**Code Quality:** Modular architecture, comprehensive error handling, "why" comments throughout codebase, consistent Tailwind styling


## Contact

**Developer:** Baljinnyam Puntsagnorov  
**Year:** 2025
**Linkedin:** https://www.linkedin.com/in/baljinnyam-puntsagnorov/
---
