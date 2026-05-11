import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

let db: Database | null = null;

export const getDb = async (): Promise<Database> => {
  if (db) return db;

  const dbPath = path.resolve(__dirname, '../../', process.env.DATABASE_URL || 'hospital.db');
  
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign keys
  await db.run('PRAGMA foreign_keys = ON');

  return db;
};
