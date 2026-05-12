import { Request, Response } from 'express';
import { getDb } from '../database/connection';
import bcrypt from 'bcryptjs';

export const createDoctor = async (req: Request, res: Response, next: any) => {
  const { name, email, password, department_id, specialization, phone, availability, experience_years } = req.body;
  console.log('[Doctor Controller] Creating doctor:', { name, email, department_id });
  
  const db = await getDb();

  try {
    await db.run('BEGIN TRANSACTION');

    const hashedPassword = await bcrypt.hash(password || 'password123', 10);
    const userResult = await db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'DOCTOR']
    );

    const doctorResult = await db.run(
      `INSERT INTO doctors (user_id, department_id, specialization, phone, availability, experience_years) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userResult.lastID, department_id, specialization, phone, availability, experience_years]
    );

    await db.run('COMMIT');
    console.log('[Doctor Controller] Doctor created successfully with ID:', doctorResult.lastID);

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: { id: doctorResult.lastID, name, email, specialization }
    });
  } catch (error) {
    console.error('[Doctor Controller] Error creating doctor:', error);
    await db.run('ROLLBACK');
    next(error);
  }
};

export const getDoctors = async (req: Request, res: Response, next: any) => {
  try {
    const db = await getDb();
    const doctors = await db.all(`
      SELECT d.*, u.name, u.email, dept.name as department_name 
      FROM doctors d 
      JOIN users u ON d.user_id = u.id 
      LEFT JOIN departments dept ON d.department_id = dept.id
      ORDER BY d.id DESC
    `);
    res.json({ success: true, data: doctors });
  } catch (error) {
    console.error('[Doctor Controller] Error fetching doctors:', error);
    next(error);
  }
};

export const deleteDoctor = async (req: Request, res: Response, next: any) => {
  const { id } = req.params;
  const db = await getDb();

  try {
    await db.run('BEGIN TRANSACTION');
    
    // Get user_id first to delete from users table too
    const doctor = await db.get('SELECT user_id FROM doctors WHERE id = ?', [id]);
    
    if (doctor) {
      await db.run('DELETE FROM doctors WHERE id = ?', [id]);
      await db.run('DELETE FROM users WHERE id = ?', [doctor.user_id]);
    }

    await db.run('COMMIT');
    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('[Doctor Controller] Error deleting doctor:', error);
    await db.run('ROLLBACK');
    next(error);
  }
};

export const updateDoctor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, department_id, specialization, phone, availability, experience_years } = req.body;
  const db = await getDb();

  try {
    await db.run('BEGIN TRANSACTION');

    const doctor = await db.get('SELECT user_id FROM doctors WHERE id = ?', [id]);
    if (!doctor) {
      await db.run('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Update user info
    await db.run(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, doctor.user_id]
    );

    // Update doctor info
    await db.run(
      `UPDATE doctors 
       SET department_id = ?, specialization = ?, phone = ?, availability = ?, experience_years = ? 
       WHERE id = ?`,
      [department_id, specialization, phone, availability, experience_years, id]
    );

    await db.run('COMMIT');
    res.json({ success: true, message: 'Doctor updated successfully' });
  } catch (error) {
    console.error('[Doctor Controller] Error updating doctor:', error);
    await db.run('ROLLBACK');
    next(error);
  }
};
