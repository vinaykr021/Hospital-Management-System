import { Request, Response } from 'express';
import { getDb } from '../database/connection';

export const bookAppointment = async (req: Request, res: Response) => {
  const { patient_id, doctor_id, appointment_date, appointment_time, notes } = req.body;
  const db = await getDb();

  const result = await db.run(
    `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, notes) 
     VALUES (?, ?, ?, ?, ?)`,
    [patient_id, doctor_id, appointment_date, appointment_time, notes]
  );

  res.status(201).json({
    success: true,
    message: 'Appointment booked successfully',
    data: { id: result.lastID }
  });
};

export const getAppointments = async (req: Request, res: Response) => {
  const db = await getDb();
  const appointments = await db.all(`
    SELECT a.*, p.full_name as patient_name, u.name as doctor_name 
    FROM appointments a 
    JOIN patients p ON a.patient_id = p.id 
    JOIN doctors d ON a.doctor_id = d.id 
    JOIN users u ON d.user_id = u.id
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `);
  res.json({ success: true, data: appointments });
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
  const { status } = req.body;
  const db = await getDb();
  
  await db.run('UPDATE appointments SET status = ? WHERE id = ?', [status, req.params.id]);
  res.json({ success: true, message: 'Appointment status updated' });
};

export const deleteAppointment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const db = await getDb();
  
  await db.run('DELETE FROM appointments WHERE id = ?', [id]);
  res.json({ success: true, message: 'Appointment deleted successfully' });
};
