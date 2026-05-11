import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import db from './db/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Patient, Doctor, Appointment, Bill, Admission, User } from '../../shared/types';

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'supersecret_for_college_project';

// Basic Auth Middleware
const authenticate = (req: any, res: any, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dashboard Stats API
app.get('/api/stats', authenticate, (req, res) => {
  try {
    const patientsCount: any = db.prepare('SELECT COUNT(*) as count FROM patients').get();
    const doctorsCount: any = db.prepare('SELECT COUNT(*) as count FROM doctors').get();
    const appointmentsCount: any = db.prepare('SELECT COUNT(*) as count FROM appointments').get();
    const wardStats: any = db.prepare('SELECT SUM(total_beds) as total, SUM(occupied_beds) as occupied FROM wards').get();
    
    res.json({
      patients: patientsCount.count,
      doctors: doctorsCount.count,
      appointments: appointmentsCount.count,
      availableBeds: (wardStats.total || 0) - (wardStats.occupied || 0),
      totalBeds: wardStats.total || 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Wards API
app.get('/api/wards', authenticate, (req, res) => {
  try {
    const wards = db.prepare('SELECT * FROM wards').all();
    res.json(wards);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wards' });
  }
});

app.post('/api/admissions', authenticate, (req, res) => {
  const { patient_id, ward_id, bed_no } = req.body;
  try {
    const transaction = db.transaction(() => {
      const result = db.prepare(
        'INSERT INTO admissions (patient_id, ward_id, bed_no) VALUES (?, ?, ?)'
      ).run(patient_id, ward_id, bed_no);
      
      db.prepare('UPDATE wards SET occupied_beds = occupied_beds + 1 WHERE id = ?').run(ward_id);
      return result.lastInsertRowid;
    });

    const admissionId = transaction();
    res.json({ id: admissionId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create admission' });
  }
});

app.get('/api/admissions', authenticate, (req, res) => {
  try {
    const admissions = db.prepare(`
      SELECT a.*, p.name as patient_name, w.name as ward_name 
      FROM admissions a
      JOIN patients p ON a.patient_id = p.id
      JOIN wards w ON a.ward_id = w.id
      WHERE a.discharged_at IS NULL
    `).all();
    res.json(admissions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admissions' });
  }
});

app.get('/api/chart-data', authenticate, (req, res) => {
  try {
    const rawData = db.prepare(`
      SELECT date(created_at) as date, COUNT(*) as count 
      FROM patients 
      WHERE created_at >= date('now', '-7 days') 
      GROUP BY date(created_at)
      ORDER BY date(created_at) ASC
    `).all();
    res.json(rawData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

app.get('/api/recent-activity', authenticate, (req, res) => {
  try {
    const patients = db.prepare(`SELECT name, created_at FROM patients ORDER BY created_at DESC LIMIT 5`).all();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

// Patients API
app.get('/api/patients', authenticate, (req, res) => {
  try {
    const patients = db.prepare('SELECT * FROM patients ORDER BY created_at DESC').all();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

app.post('/api/patients', authenticate, (req, res) => {
  const { name, age, gender, phone, address, blood_group } = req.body;
  try {
    const result = db.prepare(
      'INSERT INTO patients (name, age, gender, phone, address, blood_group) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(name, age, gender, phone, address, blood_group);
    res.json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create patient' });
  }
});

app.get('/api/patients/:id', authenticate, (req, res) => {
  try {
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/patients/:id', authenticate, (req, res) => {
  try {
    db.prepare('DELETE FROM patients WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

// Doctors API
app.get('/api/doctors', authenticate, (req, res) => {
  try {
    const doctors = db.prepare('SELECT * FROM doctors').all();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

app.post('/api/doctors', authenticate, (req, res) => {
  const { name, specialization, phone, email, available_days } = req.body;
  try {
    const result = db.prepare(
      'INSERT INTO doctors (name, specialization, phone, email, available_days) VALUES (?, ?, ?, ?, ?)'
    ).run(name, specialization, phone, email, available_days);
    res.json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create doctor' });
  }
});

app.delete('/api/doctors/:id', authenticate, (req, res) => {
  try {
    db.prepare('DELETE FROM doctors WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete doctor' });
  }
});

// Appointments API
app.get('/api/appointments', authenticate, (req, res) => {
  try {
    const appointments = db.prepare(`
      SELECT a.*, p.name as patient_name, d.name as doctor_name 
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN doctors d ON a.doctor_id = d.id
      ORDER BY a.date DESC, a.time DESC
    `).all();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

app.post('/api/appointments', authenticate, (req, res) => {
  const { patient_id, doctor_id, date, time, status, reason } = req.body;
  try {
    const result = db.prepare(
      'INSERT INTO appointments (patient_id, doctor_id, date, time, status, reason) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(patient_id, doctor_id, date, time, status || 'Scheduled', reason);
    res.json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

app.delete('/api/appointments/:id', authenticate, (req, res) => {
  try {
    db.prepare('DELETE FROM appointments WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

// Billing API
app.get('/api/bills', authenticate, (req, res) => {
  try {
    const bills = db.prepare(`
      SELECT b.*, p.name as patient_name 
      FROM bills b
      JOIN patients p ON b.patient_id = p.id
      ORDER BY b.created_at DESC
    `).all();
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

app.post('/api/bills', authenticate, (req, res) => {
  const { patient_id, amount, items_json } = req.body;
  try {
    const result = db.prepare(
      'INSERT INTO bills (patient_id, amount, items_json) VALUES (?, ?, ?)'
    ).run(patient_id, amount, items_json);
    res.json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create bill' });
  }
});

app.patch('/api/bills/:id/pay', authenticate, (req, res) => {
  try {
    db.prepare('UPDATE bills SET paid = 1 WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update bill' });
  }
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

