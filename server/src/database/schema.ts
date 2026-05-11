import { Database } from 'sqlite';
import bcrypt from 'bcryptjs';

export const initDb = async (db: Database) => {
  console.log('Initializing Database Schema...');

  // Users Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('ADMIN', 'DOCTOR', 'RECEPTIONIST')) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Departments Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT
    )
  `);

  // Doctors Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      department_id INTEGER NOT NULL,
      specialization TEXT NOT NULL,
      phone TEXT,
      availability TEXT,
      experience_years INTEGER,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE CASCADE
    )
  `);

  // Patients Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      age INTEGER,
      gender TEXT CHECK(gender IN ('Male', 'Female', 'Other')),
      blood_group TEXT,
      phone TEXT,
      address TEXT,
      medical_history TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Appointments Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      doctor_id INTEGER NOT NULL,
      appointment_date DATE NOT NULL,
      appointment_time TIME NOT NULL,
      status TEXT CHECK(status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')) DEFAULT 'PENDING',
      notes TEXT,
      FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE,
      FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE CASCADE
    )
  `);

  // Bills Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      appointment_id INTEGER NOT NULL,
      total_amount REAL NOT NULL,
      payment_status TEXT CHECK(payment_status IN ('PAID', 'UNPAID')) DEFAULT 'UNPAID',
      generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE,
      FOREIGN KEY (appointment_id) REFERENCES appointments (id) ON DELETE CASCADE
    )
  `);

  console.log('Tables created successfully.');
  await seedData(db);
};

const seedData = async (db: Database) => {
  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  if (userCount.count > 0) return;

  console.log('Seeding demo data...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Seed Admin
  await db.run(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    ['Admin User', 'admin@medflow.com', hashedPassword, 'ADMIN']
  );

  // Seed Department
  const dept = await db.run(
    'INSERT INTO departments (name, description) VALUES (?, ?)',
    ['Cardiology', 'Heart and vascular care']
  );

  // Seed Doctor User
  const docUser = await db.run(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    ['Dr. Sarah Connor', 'sarah@medflow.com', hashedPassword, 'DOCTOR']
  );

  // Seed Doctor Info
  await db.run(
    'INSERT INTO doctors (user_id, department_id, specialization, phone, availability, experience_years) VALUES (?, ?, ?, ?, ?, ?)',
    [docUser.lastID, dept.lastID, 'Cardiologist', '555-0101', '9:00 AM - 5:00 PM', 12]
  );

  // Seed Patient
  await db.run(
    'INSERT INTO patients (full_name, age, gender, blood_group, phone, address, medical_history) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['John Doe', 45, 'Male', 'O+', '123-456-7890', '123 Main St, NY', 'Hypertension']
  );

  console.log('Seeding completed.');
};
