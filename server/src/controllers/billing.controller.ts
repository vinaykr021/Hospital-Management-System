import { Request, Response } from 'express';
import { getDb } from '../database/connection';

export const generateBill = async (req: Request, res: Response) => {
  const { patient_id, appointment_id, total_amount } = req.body;
  const db = await getDb();

  const result = await db.run(
    'INSERT INTO bills (patient_id, appointment_id, total_amount) VALUES (?, ?, ?)',
    [patient_id, appointment_id, total_amount]
  );

  res.status(201).json({
    success: true,
    message: 'Bill generated successfully',
    data: { id: result.lastID }
  });
};

export const getBills = async (req: Request, res: Response) => {
  const db = await getDb();
  const bills = await db.all(`
    SELECT b.*, p.full_name as patient_name 
    FROM bills b 
    JOIN patients p ON b.patient_id = p.id
    ORDER BY b.generated_at DESC
  `);
  res.json({ success: true, data: bills });
};

export const updatePaymentStatus = async (req: Request, res: Response) => {
  const { payment_status } = req.body;
  const db = await getDb();
  
  await db.run('UPDATE bills SET payment_status = ? WHERE id = ?', [payment_status, req.params.id]);
  res.json({ success: true, message: 'Payment status updated' });
};
