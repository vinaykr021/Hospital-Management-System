import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(__dirname, '../../hospital.db');

// Ensure directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize tables
const initDb = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      phone TEXT,
      address TEXT,
      blood_group TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
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
      status TEXT DEFAULT 'Scheduled',
      reason TEXT,
      admission_required TEXT DEFAULT 'no',
      bed_assigned INTEGER,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (doctor_id) REFERENCES doctors(id),
      FOREIGN KEY (bed_assigned) REFERENCES beds(id)
    );

    CREATE TABLE IF NOT EXISTS beds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ward_id INTEGER,
      bed_number TEXT,
      status TEXT DEFAULT 'available',
      patient_id INTEGER,
      patient_name TEXT,
      FOREIGN KEY (ward_id) REFERENCES wards(id),
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password_hash TEXT,
      role TEXT
    );

    CREATE TABLE IF NOT EXISTS wards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      total_beds INTEGER,
      occupied_beds INTEGER DEFAULT 0,
      floor TEXT
    );

    CREATE TABLE IF NOT EXISTS admissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER,
      ward_id INTEGER,
      bed_id INTEGER,
      admitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      discharged_at DATETIME,
      FOREIGN KEY (patient_id) REFERENCES patients(id),
      FOREIGN KEY (ward_id) REFERENCES wards(id),
      FOREIGN KEY (bed_id) REFERENCES beds(id)
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

  // Create default admin if not exists
  const admin = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
  if (!admin) {
    const bcrypt = require('bcryptjs');
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run('admin', hash, 'admin');
    console.log('Admin user created: admin / admin123');
  }

  // Seed wards if empty
  const wardCount = (db.prepare('SELECT COUNT(*) as count FROM wards').get() as any).count;
  if (wardCount === 0) {
    const initialWards = [
      { name: 'ICU', total: 10, floor: '1st Floor' },
      { name: 'General Ward', total: 20, floor: '2nd Floor' },
      { name: 'Pediatrics', total: 15, floor: '3rd Floor' },
      { name: 'Emergency', total: 8, floor: 'Ground Floor' }
    ];
    const insertWard = db.prepare('INSERT INTO wards (name, total_beds, floor) VALUES (?, ?, ?)');
    
    for (const w of initialWards) {
      insertWard.run(w.name, w.total, w.floor);
    }
    console.log('Initial wards seeded');
  }

  // Ensure beds are seeded for all wards
  const bedCount = (db.prepare('SELECT COUNT(*) as count FROM beds').get() as any).count;
  if (bedCount === 0) {
    const wards: any = db.prepare('SELECT * FROM wards').all();
    const insertBed = db.prepare('INSERT INTO beds (ward_id, bed_number) VALUES (?, ?)');
    
    for (const ward of wards) {
      for (let i = 1; i <= ward.total_beds; i++) {
        const bedNum = `${ward.name.charAt(0)}-${String(i).padStart(2, '0')}`;
        insertBed.run(ward.id, bedNum);
      }
    }
    console.log('Initial beds generated for existing wards');
  }

  console.log('Database initialized successfully at hospital.db');
};

initDb();

export default db;
