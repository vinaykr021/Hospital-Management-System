import { Request, Response } from 'express';
import { getDb } from '../database/connection';

export const getSpecializations = async (req: Request, res: Response) => {
  const db = await getDb();
  const specializations = await db.all('SELECT * FROM specializations ORDER BY name ASC');
  res.json({ success: true, data: specializations });
};

export const createSpecialization = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  const db = await getDb();

  if (!name) {
    return res.status(400).json({ success: false, message: 'Specialization name is required' });
  }

  try {
    const existing = await db.get('SELECT id FROM specializations WHERE name = ?', [name]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Specialization already exists' });
    }

    const result = await db.run(
      'INSERT INTO specializations (name, description) VALUES (?, ?)',
      [name, description]
    );

    res.status(201).json({
      success: true,
      message: 'Specialization created successfully',
      data: { id: result.lastID, name, description }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateSpecialization = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  const db = await getDb();

  await db.run(
    'UPDATE specializations SET name = ?, description = ? WHERE id = ?',
    [name, description, req.params.id]
  );

  res.json({ success: true, message: 'Specialization updated successfully' });
};

export const deleteSpecialization = async (req: Request, res: Response) => {
  const db = await getDb();
  await db.run('DELETE FROM specializations WHERE id = ?', [req.params.id]);
  res.json({ success: true, message: 'Specialization deleted successfully' });
};
