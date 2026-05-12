import { Request, Response } from 'express';
import { getDb } from '../database/connection';

export const getBeds = async (req: Request, res: Response) => {
  const db = await getDb();
  const beds = await db.all(`
    SELECT b.*, p.full_name as assigned_patient_name 
    FROM beds b 
    LEFT JOIN patients p ON b.assigned_patient_id = p.id
    ORDER BY b.room_number, b.bed_number
  `);
  res.json({ success: true, data: beds });
};

export const createBed = async (req: Request, res: Response) => {
  const { bed_number, room_number, ward_type, bed_type, status } = req.body;
  const db = await getDb();

  try {
    const result = await db.run(
      'INSERT INTO beds (bed_number, room_number, ward_type, bed_type, status) VALUES (?, ?, ?, ?, ?)',
      [bed_number, room_number, ward_type, bed_type, status || 'Available']
    );

    res.status(201).json({
      success: true,
      message: 'Bed added successfully',
      data: { id: result.lastID }
    });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ success: false, message: 'Bed number already exists' });
    }
    throw error;
  }
};

export const updateBed = async (req: Request, res: Response) => {
  let { bed_number, room_number, ward_type, bed_type, status, assigned_patient_id } = req.body;
  const db = await getDb();

  // Logic: If status is Maintenance or Cleaning, clear patient
  if (status === 'Maintenance' || status === 'Cleaning') {
    assigned_patient_id = null;
  } 
  // Logic: If patient assigned, status must be Occupied
  else if (assigned_patient_id) {
    status = 'Occupied';
  }
  // Logic: If patient removed and status was Occupied, set to Available
  else if (!assigned_patient_id && status === 'Occupied') {
    status = 'Available';
  }

  await db.run(
    `UPDATE beds 
     SET bed_number = ?, room_number = ?, ward_type = ?, bed_type = ?, status = ?, assigned_patient_id = ? 
     WHERE id = ?`,
    [bed_number, room_number, ward_type, bed_type, status, assigned_patient_id ?? null, req.params.id]
  );

  res.json({ success: true, message: 'Bed updated successfully', data: { status, assigned_patient_id } });
};

export const deleteBed = async (req: Request, res: Response) => {
  const db = await getDb();
  await db.run('DELETE FROM beds WHERE id = ?', [req.params.id]);
  res.json({ success: true, message: 'Bed deleted successfully' });
};

export const assignPatient = async (req: Request, res: Response) => {
  const { patient_id } = req.body;
  const db = await getDb();

  await db.run(
    "UPDATE beds SET assigned_patient_id = ?, status = 'Occupied' WHERE id = ?",
    [patient_id, req.params.id]
  );

  res.json({ success: true, message: 'Patient assigned to bed' });
};

export const releaseBed = async (req: Request, res: Response) => {
  const db = await getDb();

  await db.run(
    "UPDATE beds SET assigned_patient_id = NULL, status = 'Available' WHERE id = ?",
    [req.params.id]
  );

  res.json({ success: true, message: 'Bed released and marked as available' });
};
