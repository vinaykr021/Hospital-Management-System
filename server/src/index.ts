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
    const availableBeds: any = db.prepare("SELECT COUNT(*) as count FROM beds WHERE status = 'available'").get();
    
    res.json({
      patients: patientsCount.count,
      doctors: doctorsCount.count,
      appointments: appointmentsCount.count,
      availableBeds: availableBeds.count,
      totalBeds: wardStats.total || 0,
      occupiedBeds: (wardStats.total || 0) - availableBeds.count
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

app.post('/api/beds', authenticate, (req, res) => {
  const { ward_id, bed_number } = req.body;
  try {
    const wId = parseInt(ward_id);
    if (isNaN(wId)) return res.status(400).json({ error: 'Invalid ward ID' });

    db.transaction(() => {
      db.prepare('INSERT INTO beds (ward_id, bed_number) VALUES (?, ?)')
        .run(wId, bed_number);
      db.prepare('UPDATE wards SET total_beds = total_beds + 1 WHERE id = ?')
        .run(wId);
    })();
    res.json({ success: true });
  } catch (err) {
    console.error('Error adding bed:', err);
    res.status(500).json({ error: 'Failed to add bed' });
  }
});
app.get('/api/beds', authenticate, (req, res) => {
  try {
    const beds = db.prepare(`
      SELECT b.*, w.name as ward_name, w.floor 
      FROM beds b
      JOIN wards w ON b.ward_id = w.id
      ORDER BY w.name, b.bed_number
    `).all();
    res.json(beds);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch beds' });
  }
});

app.post('/api/beds/assign', authenticate, (req, res) => {
  const { bed_id, patient_id } = req.body;
  try {
    const patient: any = db.prepare('SELECT name FROM patients WHERE id = ?').get(patient_id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    db.transaction(() => {
      const bed: any = db.prepare('SELECT ward_id FROM beds WHERE id = ?').get(bed_id);
      db.prepare("UPDATE beds SET status = 'occupied', patient_id = ?, patient_name = ? WHERE id = ?")
        .run(patient_id, patient.name, bed_id);
      db.prepare('UPDATE wards SET occupied_beds = occupied_beds + 1 WHERE id = ?')
        .run(bed.ward_id);
      
      db.prepare('INSERT INTO admissions (patient_id, ward_id, bed_id) VALUES (?, ?, ?)')
        .run(patient_id, bed.ward_id, bed_id);
    })();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign bed' });
  }
});

app.put('/api/beds/discharge/:id', authenticate, (req, res) => {
  try {
    db.transaction(() => {
      const bed: any = db.prepare('SELECT ward_id, patient_id FROM beds WHERE id = ?').get(req.params.id);
      if (!bed) throw new Error('Bed not found');

      db.prepare("UPDATE beds SET status = 'available', patient_id = NULL, patient_name = NULL WHERE id = ?")
        .run(req.params.id);
      db.prepare('UPDATE wards SET occupied_beds = MAX(0, occupied_beds - 1) WHERE id = ?')
        .run(bed.ward_id);
      db.prepare("UPDATE admissions SET discharged_at = CURRENT_TIMESTAMP WHERE bed_id = ? AND patient_id = ? AND discharged_at IS NULL")
        .run(req.params.id, bed.patient_id);
    })();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to discharge patient' });
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
  const patientId = req.params.id;
  try {
    db.transaction(() => {
      // 1. Reset any beds occupied by this patient
      db.prepare("UPDATE beds SET status = 'available', patient_id = NULL, patient_name = NULL WHERE patient_id = ?")
        .run(patientId);

      // 2. Delete appointments
      db.prepare('DELETE FROM appointments WHERE patient_id = ?').run(patientId);

      // 3. Delete admissions
      db.prepare('DELETE FROM admissions WHERE patient_id = ?').run(patientId);

      // 4. Delete bills
      db.prepare('DELETE FROM bills WHERE patient_id = ?').run(patientId);

      // 5. Finally delete the patient
      db.prepare('DELETE FROM patients WHERE id = ?').run(patientId);
    })();
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
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
  const doctorId = req.params.id;
  try {
    db.transaction(() => {
      // Delete linked appointments first
      db.prepare('DELETE FROM appointments WHERE doctor_id = ?').run(doctorId);
      
      // Delete the doctor
      db.prepare('DELETE FROM doctors WHERE id = ?').run(doctorId);
    })();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
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
  const { patient_id, doctor_id, date, time, status, reason, admission_required } = req.body;
  try {
    const appointmentId = db.transaction(() => {
      let bed_assigned = null;

      if (admission_required === 'yes') {
        const availableBed: any = db.prepare("SELECT id, ward_id FROM beds WHERE status = 'available' LIMIT 1").get();
        if (!availableBed) {
          throw new Error('No beds available for admission');
        }

        const patient: any = db.prepare('SELECT name FROM patients WHERE id = ?').get(patient_id);
        
        db.prepare("UPDATE beds SET status = 'occupied', patient_id = ?, patient_name = ? WHERE id = ?")
          .run(patient_id, patient.name, availableBed.id);
        
        db.prepare('UPDATE wards SET occupied_beds = occupied_beds + 1 WHERE id = ?')
          .run(availableBed.ward_id);

        db.prepare('INSERT INTO admissions (patient_id, ward_id, bed_id) VALUES (?, ?, ?)')
          .run(patient_id, availableBed.ward_id, availableBed.id);

        bed_assigned = availableBed.id;
      }

      const result = db.prepare(
        'INSERT INTO appointments (patient_id, doctor_id, date, time, status, reason, admission_required, bed_assigned) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(patient_id, doctor_id, date, time, status || 'Scheduled', reason, admission_required || 'no', bed_assigned);
      
      return result.lastInsertRowid;
    })();

    res.json({ id: appointmentId });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create appointment' });
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

