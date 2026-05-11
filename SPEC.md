# Hospital Management System - Backend Specification

## Project Overview
- **Project Name**: Hospital Management System Backend
- **Type**: RESTful API Server
- **Core Functionality**: Complete backend for hospital management with authentication, patient/doctor/appointment/billing management, and dashboard statistics
- **Target Users**: Hospital staff (Admin, Doctors, Receptionists)

## Tech Stack
- Node.js + Express.js
- TypeScript (strict mode)
- SQLite database
- JWT authentication
- bcrypt password hashing

## Database Schema

### 1. users
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| name | TEXT | NOT NULL |
| email | TEXT | UNIQUE NOT NULL |
| password | TEXT | NOT NULL |
| role | TEXT | NOT NULL (admin/doctor/receptionist) |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### 2. departments
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| name | TEXT | UNIQUE NOT NULL |
| description | TEXT | |

### 3. doctors
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| user_id | INTEGER | FOREIGN KEY -> users(id) |
| department_id | INTEGER | FOREIGN KEY -> departments(id) |
| specialization | TEXT | NOT NULL |
| phone | TEXT | |
| availability | TEXT | DEFAULT 'available' |
| experience_years | INTEGER | |

### 4. patients
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| full_name | TEXT | NOT NULL |
| age | INTEGER | NOT NULL |
| gender | TEXT | NOT NULL |
| blood_group | TEXT | |
| phone | TEXT | |
| address | TEXT | |
| medical_history | TEXT | |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

### 5. appointments
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| patient_id | INTEGER | FOREIGN KEY -> patients(id) |
| doctor_id | INTEGER | FOREIGN KEY -> doctors(id) |
| appointment_date | DATE | NOT NULL |
| appointment_time | TIME | NOT NULL |
| status | TEXT | DEFAULT 'scheduled' (scheduled/completed/cancelled) |
| notes | TEXT | |

### 6. bills
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT |
| patient_id | INTEGER | FOREIGN KEY -> patients(id) |
| appointment_id | INTEGER | FOREIGN KEY -> appointments(id) |
| total_amount | REAL | NOT NULL |
| payment_status | TEXT | DEFAULT 'pending' (pending/paid) |
| generated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP |

## API Endpoints

### Authentication
- POST /api/auth/login - Login with email/password
- GET /api/auth/me - Get current user info

### Patients
- GET /api/patients - Get all patients
- GET /api/patients/:id - Get patient by ID
- POST /api/patients - Create new patient
- PUT /api/patients/:id - Update patient
- DELETE /api/patients/:id - Delete patient
- GET /api/patients/search?q= - Search patients

### Doctors
- GET /api/doctors - Get all doctors
- GET /api/doctors/:id - Get doctor by ID
- POST /api/doctors - Create new doctor
- PUT /api/doctors/:id - Update doctor
- DELETE /api/doctors/:id - Delete doctor

### Departments
- GET /api/departments - Get all departments
- POST /api/departments - Create department

### Appointments
- GET /api/appointments - Get all appointments (with filters)
- POST /api/appointments - Book appointment
- PUT /api/appointments/:id - Update appointment
- DELETE /api/appointments/:id - Cancel appointment

### Billing
- GET /api/bills - Get all bills
- GET /api/bills/:id - Get bill by ID
- POST /api/bills - Generate new bill
- PUT /api/bills/:id - Update payment status

### Dashboard
- GET /api/dashboard/stats - Get statistics (total patients, doctors, appointments, revenue)

## Security
- JWT tokens for authentication
- bcrypt password hashing
- Helmet for HTTP headers
- CORS enabled
- Environment variables for secrets

## Demo Data Seeding
- 1 admin user (admin@hospital.com / admin123)
- 1 receptionist (receptionist@hospital.com / receptionist123)
- 3 departments (Cardiology, Neurology, General Medicine)
- 3 doctors
- 5 patients
- 5 appointments
- 3 bills

## Project Structure
```
server/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── database/
│   ├── models/
│   ├── types/
│   ├── utils/
│   └── index.ts
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```