import { Request, Response } from 'express';
import { getDb } from '../database/connection';

export const getBills = async (req: Request, res: Response) => {
  const db = await getDb();
  const bills = await db.all(`
    SELECT 
      b.*, 
      p.full_name as patient_name,
      u.name as doctor_name
    FROM bills b 
    JOIN patients p ON b.patient_id = p.id
    LEFT JOIN doctors d ON b.doctor_id = d.id
    LEFT JOIN users u ON d.user_id = u.id
    ORDER BY b.billing_date DESC
  `);
  res.json({ success: true, data: bills });
};

export const generateBill = async (req: Request, res: Response) => {
  const { 
    patient_id, 
    doctor_id, 
    appointment_id, 
    service_type,
    consultation_fee,
    bed_charges,
    medicine_charges,
    other_charges,
    total_amount,
    payment_status,
    payment_method
  } = req.body;

  const db = await getDb();

  try {
    const result = await db.run(
      `INSERT INTO bills (
        patient_id, doctor_id, appointment_id, service_type,
        consultation_fee, bed_charges, medicine_charges, other_charges,
        total_amount, payment_status, payment_method
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patient_id, doctor_id || null, appointment_id || null, service_type,
        consultation_fee || 0, bed_charges || 0, medicine_charges || 0, other_charges || 0,
        total_amount, payment_status || 'Pending', payment_method || 'Cash'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Bill generated successfully',
      data: { id: result.lastID }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to generate bill' });
  }
};

export const updatePaymentStatus = async (req: Request, res: Response) => {
  const { payment_status } = req.body;
  const db = await getDb();

  await db.run(
    'UPDATE bills SET payment_status = ? WHERE id = ?',
    [payment_status, req.params.id]
  );

  res.json({ success: true, message: 'Payment status updated' });
};

export const deleteBill = async (req: Request, res: Response) => {
  const db = await getDb();
  await db.run('DELETE FROM bills WHERE id = ?', [req.params.id]);
  res.json({ success: true, message: 'Bill deleted successfully' });
};
