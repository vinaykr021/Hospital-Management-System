import { Request, Response } from 'express';
import { getDb } from '../database/connection';

export const getDepartments = async (req: Request, res: Response) => {
  const db = await getDb();
  const departments = await db.all('SELECT * FROM departments ORDER BY name ASC');
  res.json({ success: true, data: departments });
};

export const createDepartment = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  const db = await getDb();

  if (!name) {
    return res.status(400).json({ success: false, message: 'Department name is required' });
  }

  try {
    const existing = await db.get('SELECT id FROM departments WHERE name = ?', [name]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Department already exists' });
    }

    const result = await db.run(
      'INSERT INTO departments (name, description) VALUES (?, ?)',
      [name, description]
    );

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: { id: result.lastID, name, description }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  const db = await getDb();

  await db.run(
    'UPDATE departments SET name = ?, description = ? WHERE id = ?',
    [name, description, req.params.id]
  );

  res.json({ success: true, message: 'Department updated successfully' });
};

export const deleteDepartment = async (req: Request, res: Response) => {
  const db = await getDb();
  await db.run('DELETE FROM departments WHERE id = ?', [req.params.id]);
  res.json({ success: true, message: 'Department deleted successfully' });
};
