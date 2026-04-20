# employee-shift-management
Employee Shift Management System is a MERN-based web application for managing employees, scheduling shifts without conflicts, tracking attendance (check-in/check-out), and handling leave requests with role-based access control (Admin, Manager, Employee).
# Employee Shift Management System

## Features
- JWT Authentication
- Role-based system (Admin, Manager, Employee)
- Employee CRUD
- Shift scheduling (no duplicate shifts)
- Attendance system (check-in/check-out)
- Leave management

## Tech Stack
- Node.js
- Express.js
- MongoDB
- React.js

## Setup Instructions

### Backend
cd backend
npm install
npm run dev

### Frontend
cd frontend
npm install
npm run dev

## API Endpoints
- /api/auth
- /api/employees
- /api/shifts
- /api/attendance
- /api/leaves
