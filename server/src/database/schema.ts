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

  // Specializations Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS specializations (
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
      doctor_id INTEGER,
      appointment_id INTEGER,
      service_type TEXT NOT NULL,
      consultation_fee REAL DEFAULT 0,
      bed_charges REAL DEFAULT 0,
      medicine_charges REAL DEFAULT 0,
      other_charges REAL DEFAULT 0,
      total_amount REAL NOT NULL,
      payment_status TEXT CHECK(payment_status IN ('Paid', 'Pending', 'Partial')) DEFAULT 'Pending',
      payment_method TEXT CHECK(payment_method IN ('Cash', 'Card', 'UPI', 'Insurance', 'Other')) DEFAULT 'Cash',
      billing_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE,
      FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE SET NULL,
      FOREIGN KEY (appointment_id) REFERENCES appointments (id) ON DELETE SET NULL
    )
  `);
  
  // Beds Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS beds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bed_number TEXT UNIQUE NOT NULL,
      room_number TEXT NOT NULL,
      ward_type TEXT NOT NULL,
      bed_type TEXT NOT NULL,
      status TEXT CHECK(status IN ('Available', 'Occupied', 'Cleaning', 'Maintenance')) DEFAULT 'Available',
      assigned_patient_id INTEGER,
      FOREIGN KEY (assigned_patient_id) REFERENCES patients (id) ON DELETE SET NULL
    )
  `);

  console.log('Tables created successfully.');
  await seedData(db);
};

const seedData = async (db: Database) => {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // Seed Admin
  await db.run(
    'INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    ['Admin User', 'admin@medflow.com', hashedPassword, 'ADMIN']
  );

  // Seed Default Departments
  const depts = [
    ['General Medicine', 'Primary healthcare and general checkups'],
    ['Neurology', 'Diagnosis and treatment of nervous system disorders'],
    ['Psychology', 'Mental health and behavioral studies'],
    ['Cardiothoracic Surgery', 'Surgical procedures on organs inside the thorax'],
    ['Immunology', 'Immune system studies and treatments'],
    ['General Surgery', 'Broad range of surgical procedures']
  ];

  for (const [name, desc] of depts) {
    const exists = await db.get('SELECT id FROM departments WHERE name = ?', [name]);
    if (!exists) {
      await db.run('INSERT INTO departments (name, description) VALUES (?, ?)', [name, desc]);
    }
  }

  // Seed Default Specializations
  const specs = [
    'Cardiologist', 
    'Neurologist', 
    'Psychologist',
    'Cardiothoracic Surgeon',
    'Immunologist',
    'General Surgeon',
    'Pediatrician', 
    'Dermatologist', 
    'General Physician'
  ];
  for (const spec of specs) {
    const exists = await db.get('SELECT id FROM specializations WHERE name = ?', [spec]);
    if (!exists) {
      await db.run('INSERT INTO specializations (name) VALUES (?)', [spec]);
    }
  }

  console.log('Seeding completed.');
};
