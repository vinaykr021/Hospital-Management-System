import { Request, Response } from 'express';
import { getDb } from '../database/connection';
import { z } from 'zod';

const patientSchema = z.object({
  full_name: z.string().min(2),
  age: z.number().min(0),
  gender: z.enum(['Male', 'Female', 'Other']),
  blood_group: z.string(),
  phone: z.string(),
  address: z.string(),
  medical_history: z.string().optional(),
});

export const createPatient = async (req: Request, res: Response) => {
  try {
    const data = patientSchema.parse(req.body);
    const db = await getDb();
    
    const result = await db.run(
      `INSERT INTO patients (full_name, age, gender, blood_group, phone, address, medical_history) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.full_name, data.age, data.gender, data.blood_group, data.phone, data.address, data.medical_history]
    );

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: { id: result.lastID, ...data }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Validation failed', error: error.errors });
    }
    throw error;
  }
};

export const getPatients = async (req: Request, res: Response) => {
  const db = await getDb();
  const patients = await db.all('SELECT * FROM patients ORDER BY created_at DESC');
  res.json({ success: true, data: patients });
};

export const getPatientById = async (req: Request, res: Response) => {
  const db = await getDb();
  const patient = await db.get('SELECT * FROM patients WHERE id = ?', [req.params.id]);
  
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }
  
  res.json({ success: true, data: patient });
};

export const updatePatient = async (req: Request, res: Response) => {
  try {
    const data = patientSchema.parse(req.body);
    const db = await getDb();
    
    await db.run(
      `UPDATE patients SET full_name = ?, age = ?, gender = ?, blood_group = ?, phone = ?, address = ?, medical_history = ?
       WHERE id = ?`,
      [data.full_name, data.age, data.gender, data.blood_group, data.phone, data.address, data.medical_history, req.params.id]
    );

    res.json({ success: true, message: 'Patient updated successfully' });
  } catch (error) {
    throw error;
  }
};

export const deletePatient = async (req: Request, res: Response) => {
  const db = await getDb();
  await db.run('DELETE FROM patients WHERE id = ?', [req.params.id]);
  res.json({ success: true, message: 'Patient deleted successfully' });
};
