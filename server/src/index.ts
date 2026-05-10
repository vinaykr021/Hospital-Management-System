import express from 'express';
import cors from 'cors';
import { initDb, getDb } from './db/index';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'supersecret_for_college_project';

// Basic Auth Middleware
const authenticate = (req: any, res: any, next: any) => {
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
    const db = getDb();
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
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
app.get('/api/stats', authenticate, async (req, res) => {
  const db = getDb();
  try {
    const patientsCount = await db.get('SELECT COUNT(*) as count FROM patients');
    const doctorsCount = await db.get('SELECT COUNT(*) as count FROM doctors');
    const appointmentsCount = await db.get('SELECT COUNT(*) as count FROM appointments');
    
    res.json({
      patients: patientsCount.count,
      doctors: doctorsCount.count,
      appointments: appointmentsCount.count,
      availableBeds: 85, // Hardcoded for now until ward management is built
      totalBeds: 250
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/api/chart-data', authenticate, async (req, res) => {
  const db = getDb();
  try {
    const rawData = await db.all(`
      SELECT date(created_at) as date, COUNT(*) as count 
      FROM patients 
      WHERE created_at >= date('now', '-7 days') 
      GROUP BY date(created_at)
      ORDER BY date(created_at) ASC
    `);
    res.json(rawData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

app.get('/api/recent-activity', authenticate, async (req, res) => {
  const db = getDb();
  try {
    // Fetch the 5 most recently created patients
    const patients = await db.all(`SELECT name, created_at FROM patients ORDER BY created_at DESC LIMIT 5`);
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

// Patients API
app.get('/api/patients', authenticate, async (req, res) => {
  const db = getDb();
  const patients = await db.all('SELECT * FROM patients ORDER BY created_at DESC');
  res.json(patients);
});

app.post('/api/patients', authenticate, async (req, res) => {
  const { name, age, gender, phone, address, blood_group } = req.body;
  const db = getDb();
  try {
    const result = await db.run(
      'INSERT INTO patients (name, age, gender, phone, address, blood_group) VALUES (?, ?, ?, ?, ?, ?)',
      [name, age, gender, phone, address, blood_group]
    );
    res.json({ id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create patient' });
  }
});

app.get('/api/patients/:id', authenticate, async (req, res) => {
  const db = getDb();
  const patient = await db.get('SELECT * FROM patients WHERE id = ?', [req.params.id]);
  if (!patient) return res.status(404).json({ error: 'Not found' });
  res.json(patient);
});

app.delete('/api/patients/:id', authenticate, async (req, res) => {
  const db = getDb();
  try {
    await db.run('DELETE FROM patients WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

// Doctors API
app.get('/api/doctors', authenticate, async (req, res) => {
  const db = getDb();
  const doctors = await db.all('SELECT * FROM doctors');
  res.json(doctors);
});

app.post('/api/doctors', authenticate, async (req, res) => {
  const { name, specialization, phone, email, available_days } = req.body;
  const db = getDb();
  try {
    const result = await db.run(
      'INSERT INTO doctors (name, specialization, phone, email, available_days) VALUES (?, ?, ?, ?, ?)',
      [name, specialization, phone, email, available_days]
    );
    res.json({ id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create doctor' });
  }
});

app.delete('/api/doctors/:id', authenticate, async (req, res) => {
  const db = getDb();
  try {
    await db.run('DELETE FROM doctors WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete doctor' });
  }
});

// Appointments API
app.get('/api/appointments', authenticate, async (req, res) => {
  const db = getDb();
  try {
    const appointments = await db.all(`
      SELECT a.*, p.name as patient_name, d.name as doctor_name 
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN doctors d ON a.doctor_id = d.id
      ORDER BY a.date DESC, a.time DESC
    `);
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

app.post('/api/appointments', authenticate, async (req, res) => {
  const { patient_id, doctor_id, date, time, status, reason } = req.body;
  const db = getDb();
  try {
    const result = await db.run(
      'INSERT INTO appointments (patient_id, doctor_id, date, time, status, reason) VALUES (?, ?, ?, ?, ?, ?)',
      [patient_id, doctor_id, date, time, status || 'Scheduled', reason]
    );
    res.json({ id: result.lastID });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

app.delete('/api/appointments/:id', authenticate, async (req, res) => {
  const db = getDb();
  try {
    await db.run('DELETE FROM appointments WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

// Start Server
const PORT = 3000;
initDb().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}).catch(console.error);
