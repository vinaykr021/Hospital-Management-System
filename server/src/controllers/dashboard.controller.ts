import { Request, Response } from 'express';
import { getDb } from '../database/connection';

export const getDashboardStats = async (req: Request, res: Response) => {
  const db = await getDb();

  const [patients, doctors, appointments, revenue] = await Promise.all([
    db.get('SELECT COUNT(*) as count FROM patients'),
    db.get('SELECT COUNT(*) as count FROM doctors'),
    db.get('SELECT COUNT(*) as count FROM appointments WHERE appointment_date = CURRENT_DATE'),
    db.get('SELECT SUM(total_amount) as total FROM bills WHERE payment_status = "Paid"')
  ]);

  res.json({
    success: true,
    data: {
      totalPatients: patients.count,
      totalDoctors: doctors.count,
      appointmentsToday: appointments.count,
      totalRevenue: revenue.total || 0
    }
  });
};
