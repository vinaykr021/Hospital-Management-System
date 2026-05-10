import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export const initDb = async () => {
  db = await open({
    filename: path.join(__dirname, '../../database.sqlite'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password_hash TEXT,
      role TEXT
    );

    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      age INTEGER,
      gender TEXT,
      phone TEXT,
      address TEXT,
      blood_group TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      specialization TEXT,
      phone TEXT,
      email TEXT,
      available_days TEXT
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER,
      doctor_id INTEGER,
      date TEXT,
      time TEXT,
      status TEXT,
      reason TEXT,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    );

    CREATE TABLE IF NOT EXISTS wards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      total_beds INTEGER,
      occupied_beds INTEGER,
      floor TEXT
    );

    CREATE TABLE IF NOT EXISTS admissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER,
      ward_id INTEGER,
      bed_no INTEGER,
      admitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      discharged_at DATETIME,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (ward_id) REFERENCES wards(id)
    );

    CREATE TABLE IF NOT EXISTS bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER,
      amount REAL,
      items_json TEXT,
      paid BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    );
  `);

  console.log('Database initialized successfully.');
  
  // Create admin user if not exists
  const adminExists = await db.get('SELECT * FROM users WHERE username = ?', ['admin']);
  if (!adminExists) {
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('admin123', 10);
    await db.run('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', ['admin', hash, 'admin']);
    console.log('Admin user created (admin / admin123)');
  }
};

export const getDb = () => {
  if (!db) throw new Error('Database not initialized');
  return db;
};
