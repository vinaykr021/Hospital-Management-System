import { getDb } from './connection';

async function resetBills() {
  const db = await getDb();
  console.log('Resetting Bills Table for Schema Update...');
  
  try {
    await db.run('DROP TABLE IF EXISTS bills');
    console.log('Bills table dropped.');
    
    // Re-create the table using the new schema logic
    await db.exec(`
      CREATE TABLE IF NOT EXISTS bills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        doctor_id INTEGER,
        appointment_id INTEGER,
        service_type TEXT NOT NULL,
        consultation_fee REAL DEFAULT 0,
        bed_charges REAL DEFAULT 0,
        medicine_charges REAL DEFAULT 0,
        other_charges REAL DEFAULT 0,
        total_amount REAL NOT NULL,
        payment_status TEXT CHECK(payment_status IN ('Paid', 'Pending', 'Partial')) DEFAULT 'Pending',
        payment_method TEXT CHECK(payment_method IN ('Cash', 'Card', 'UPI', 'Insurance', 'Other')) DEFAULT 'Cash',
        billing_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE SET NULL,
        FOREIGN KEY (appointment_id) REFERENCES appointments (id) ON DELETE SET NULL
      )
    `);
    console.log('Bills table recreated with new schema.');
    
    process.exit(0);
  } catch (error) {
    console.error('Failed to reset bills table:', error);
    process.exit(1);
  }
}

resetBills();
