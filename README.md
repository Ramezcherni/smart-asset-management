# 🖥️ Smart Asset & Maintenance Management System

A full-stack **MERN** application for managing company IT assets, employees, ticket-based maintenance requests, and role-based access control — built as a real-world software engineering learning project.

![Node](https://img.shields.io/badge/Node.js-20-green)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running with Docker](#running-with-docker)
- [User Roles](#user-roles)
- [API Overview](#api-overview)
- [Project Structure](#project-structure)
- [Future Improvements](#future-improvements)

---

## Overview

This application allows organizations to manage their IT equipment lifecycle end-to-end: tracking assets, assigning them to employees, handling maintenance tickets, and monitoring everything through role-based dashboards, real-time notifications, and exportable reports.

Built from scratch to practice production-level full-stack architecture, authentication, database design, and DevOps practices.

---

## Features

### 🔐 Authentication & Role Management
- JWT-based authentication with secure password hashing (bcrypt)
- Three roles: **Admin**, **Technician**, **Employee** — each with distinct permissions
- Public sign-up always defaults to the `Employee` role; only Admins can promote users or create privileged accounts

### 💻 Asset Management
- Full CRUD for company equipment (laptops, desktops, monitors, printers, phones)
- Assign / return assets to employees with a complete history log
- QR code generation and camera-based scanning for instant asset lookup
- Advanced search and filtering (by name, serial number, category, status)

### 👥 Employee Management
- Employee profiles linked to user accounts
- Editable department, position, and phone number
- Self-service profile page (`My Profile`)

### 🎫 Maintenance Ticketing
- Employees can report issues tied to their equipment
- Technicians/Admins can self-assign, update status, and resolve tickets
- Priority levels (Low/Medium/High/Urgent) and status tracking (Open → In Progress → Resolved → Closed)

### 📊 Dashboards & Analytics
- Role-specific dashboards:
  - **Admin/Technician**: organization-wide stats and charts (assets by category/status, ticket breakdown)
  - **Employee**: personal view of assigned assets and submitted tickets
- Built with Recharts (pie & bar charts)

### 📄 Reporting
- One-click **PDF** export (jsPDF) for Assets and Tickets
- One-click **Excel** export (SheetJS) for Assets and Tickets

### 📋 Audit Logs
- Every critical action (create/update/delete asset, role changes, ticket status updates) is logged with user, timestamp, and details
- Searchable and filterable log viewer (Admin only)

### 🔔 Real-Time Notifications
- Powered by Socket.io
- Instant notifications for new tickets, assignments, and status changes
- Unread counter, mark-as-read, and mark-all-as-read

### 🎨 UI/UX
- Fully responsive interface built with Tailwind CSS
- Dark mode toggle
- Clean, consistent design system across all pages

### 🐳 DevOps
- Dockerized backend and frontend with a single `docker-compose.yml`
- Environment-based configuration for local vs containerized runs

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, React Router, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB (Atlas) with Mongoose |
| Auth | JWT, bcrypt |
| Real-time | Socket.io |
| Reporting | jsPDF, jspdf-autotable, SheetJS (xlsx) |
| QR Codes | qrcode.react, html5-qrcode |
| Charts | Recharts |
| DevOps | Docker, Docker Compose |
| Version Control | Git, GitHub |

---

## Architecture

```
┌─────────────┐      REST API + WebSocket      ┌──────────────┐
│   React      │ ───────────────────────────▶  │   Express     │
│  (Frontend)  │ ◀───────────────────────────  │   (Backend)   │
└─────────────┘                                 └──────┬───────┘
                                                         │
                                                         ▼
                                                  ┌──────────────┐
                                                  │  MongoDB      │
                                                  │  (Atlas)      │
                                                  └──────────────┘
```

**Backend modules:** Auth, Assets, Employees, Assignments, Tickets, Audit Logs, Notifications
**Frontend pages:** Login, Sign Up, Dashboard, Assets, Tickets, Employees, Users, Audit Logs, Scan QR, My Profile

---

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB Atlas account (or local MongoDB instance)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/Ramezcherni/smart-asset-management.git
cd smart-asset-management
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run the backend:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`, connected to the API at `http://localhost:5000`.

---

## Environment Variables

| Variable | Location | Description |
|---|---|---|
| `PORT` | backend/.env | Port the Express server runs on (default 5000) |
| `MONGO_URI` | backend/.env | MongoDB Atlas connection string |
| `JWT_SECRET` | backend/.env | Secret key used to sign JWT tokens |

---

## Running with Docker

The entire application (backend + frontend) can be run in containers with a single command.

### 1. Create a `.env` file at the project root
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### 2. Build and run
```bash
docker-compose up --build
```

### 3. Access the app
- Frontend: `http://localhost:8081`
- Backend API: `http://localhost:5000`

---

## User Roles

| Role | Permissions |
|---|---|
| **Employee** | View assets (read-only), create maintenance tickets, view/edit own profile |
| **Technician** | Everything Employee can do, plus: create/edit assets, assign/return assets, manage employees, resolve tickets |
| **Admin** | Everything Technician can do, plus: delete assets, manage user accounts and roles, view audit logs |

---

## API Overview

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Public sign-up (always creates an Employee) | Public |
| POST | `/api/auth/login` | Login, returns JWT | Public |
| POST | `/api/auth/create-user` | Create user with any role | Admin |
| GET | `/api/auth/users` | List all users | Admin |
| PUT | `/api/auth/users/:id/role` | Change a user's role | Admin |
| GET/POST | `/api/assets` | List / create assets | Auth required |
| PUT/DELETE | `/api/assets/:id` | Update / delete an asset | Technician/Admin, Admin |
| GET/POST | `/api/employees` | List / create employees | Auth required |
| GET/POST | `/api/assignments` | Asset assignment history | Technician/Admin |
| PUT | `/api/assignments/:id/return` | Return an assigned asset | Technician/Admin |
| GET/POST | `/api/tickets` | List / create maintenance tickets | Auth required |
| PUT | `/api/tickets/:id/assign` | Self-assign a ticket | Technician/Admin |
| PUT | `/api/tickets/:id/status` | Update ticket status | Technician/Admin |
| GET | `/api/audit-logs` | View system audit trail | Admin |
| GET | `/api/notifications` | Get user's notifications | Auth required |

---

## Project Structure

```
smart-asset-management/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── server.js
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   └── utils/
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Future Improvements

- [ ] CSV import for bulk asset/employee onboarding
- [ ] Extend dark mode to every page
- [ ] Unit and integration testing (Jest, React Testing Library)
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Pagination for large data sets

---

## Author

Built by **Mohamed Ramez Cherni** as an intern training project to practice full-stack MERN development, authentication, real-time systems, and DevOps.

---

## License

This project is for educational purposes.
