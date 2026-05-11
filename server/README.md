# Hospital Management System Backend

A robust, demo-ready backend for a Hospital Management System built with Node.js, Express, TypeScript, and SQLite.

## 🚀 Features

- **Authentication**: JWT-based login with role-based access control (Admin, Doctor, Receptionist).
- **SQLite Database**: Self-initializing relational database with auto-seeding.
- **RESTful APIs**: Complete CRUD for Patients, Doctors, Appointments, and Billing.
- **Security**: Helmet, CORS, and password hashing with Bcrypt.
- **Validation**: Strict request validation using Zod.

## 📋 Prerequisites

- Node.js (v16+)
- npm

## ⚙️ Setup Instructions

1. **Navigate to the server directory**:
   ```bash
   cd server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Setup environment variables**:
   Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

4. **Start the server**:
   ```bash
   npm run dev
   ```

The server will automatically:
- Create `hospital.db` if it doesn't exist.
- Initialize all required tables.
- Seed demo data for testing.

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@medflow.com` | `password123` |
| Doctor | `sarah@medflow.com` | `password123` |

## 📡 API Endpoints

### Auth
- `POST /api/login`

### Patients
- `GET /api/patients` - List all
- `POST /api/patients` - Register new (Admin/Receptionist)
- `GET /api/patients/:id` - View details

### Doctors
- `GET /api/doctors` - List all staff
- `POST /api/doctors` - Add staff (Admin only)

### Appointments
- `GET /api/appointments` - List all
- `POST /api/appointments` - Book visit

### Billing
- `GET /api/bills` - View invoice history
- `POST /api/bills` - Generate new bill

### Dashboard
- `GET /api/dashboard/stats` - Summary statistics
