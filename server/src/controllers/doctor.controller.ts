import { Request, Response } from 'express';
import { getDb } from '../database/connection';
import bcrypt from 'bcryptjs';

export const createDoctor = async (req: Request, res: Response) => {
  const { name, email, password, department_id, specialization, phone, availability, experience_years } = req.body;
  const db = await getDb();

  try {
    await db.run('BEGIN TRANSACTION');

    const hashedPassword = await bcrypt.hash(password, 10);
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

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: { id: doctorResult.lastID, name, email, specialization }
    });
  } catch (error) {
    await db.run('ROLLBACK');
    throw error;
  }
};

export const getDoctors = async (req: Request, res: Response) => {
  const db = await getDb();
  const doctors = await db.all(`
    SELECT d.*, u.name, u.email, dept.name as department_name 
    FROM doctors d 
    JOIN users u ON d.user_id = u.id 
    JOIN departments dept ON d.department_id = dept.id
  `);
  res.json({ success: true, data: doctors });
};
