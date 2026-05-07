# Employee Shift & Attendance Management System

An end-to-end **employee shift scheduling, attendance tracking, and leave management** system built for real-world workflows—so HR/Managers can stay organized and employees can manage their workday confidently.

---

## Why this project?
Most employee management systems become messy when teams scale: schedules overlap, attendance updates get duplicated, approvals become inconsistent, and reporting takes too long.

This project focuses on solving those pain points with clean API design, role-based access, and production-friendly patterns.

---

## Key features

- **Authentication & Authorization**
  - JWT-based login/register
  - **Role-based access**: Admin, Manager, Employee

- **Employee Management**
  - Create, update, delete employees
  - Search + filters + pagination

- **Shift Scheduling**
  - Assign shifts to employees
  - Prevent overlapping schedules
  - Concurrency-safe shift assignment using a lock mechanism

- **Attendance Tracking**
  - Check-in / check-out
  - **Idempotent APIs** (prevents duplicate updates)
  - Automatic working-hours calculation

- **Leave Management**
  - Apply for leave
  - Manager approval / rejection workflow

- **Developer-friendly engineering**
  - Server-side pagination and smart filtering
  - Cache layer support
  - Swagger API documentation (`/api-docs`)

---

## Tech stack

- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Security:** JWT authentication
- **Frontend:** React (Vite)

---

## Architecture overview

- Backend follows a modular structure:
  - `controllers/` for request handling
  - `routes/` for API endpoints
  - `middleware/` for auth, role checks, validation, and errors
  - `models/` for MongoDB entities
  - `utils/` for shared helpers (tokens, caching, date utilities, etc.)

---

## Setup & run

> The project has **two parts**: backend and frontend.

### 1) Backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173
```

Run the backend:

```bash
npm run dev
```

Swagger docs will be available at:

- `http://localhost:5000/api-docs`

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## API endpoints (high-level)

- **Auth**
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`

- **Employees**
  - `GET /api/employees`
  - `POST /api/employees`
  - `PUT /api/employees/:id`
  - `DELETE /api/employees/:id`

- **Shifts**
  - `GET /api/shifts`
  - `POST /api/shifts`
  - `PUT /api/shifts/:id`
  - `DELETE /api/shifts/:id`

- **Attendance**
  - `POST /api/attendance/checkin`
  - `POST /api/attendance/checkout`
  - `GET /api/attendance/me`

- **Leaves**
  - `GET /api/leaves`
  - `POST /api/leaves`

---

## How to test

- Use **Postman** / **Thunder Client** for backend APIs.
- Use the frontend UI to verify workflows:
  - login as different roles
  - assign shifts
  - check in/out
  - apply and approve/reject leave

---

## Recruiter-friendly highlights

If you’re reviewing this project for backend/engineering skills, these parts stand out:

- **Real concurrency considerations** (shift locking)
- **Data safety** (idempotent attendance operations)
- **Clean API layering** (routes/controllers/middleware separation)
- **Security** (JWT + RBAC + validation middleware)
- **Documentation** (Swagger UI)

---

## Project structure (quick view)

```text
backend/
  controllers/
  models/
  routes/
  middleware/
  utils/
  config/

frontend/
  src/
    components/
    pages/
    services/
    context/
```

---

## Author

Harshit Kumar Sharma

