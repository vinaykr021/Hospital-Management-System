import { getDb } from './connection';

async function updateData() {
  const db = await getDb();
  console.log('Updating Departments and Specializations...');

  const depts = [
    ['Neurology', 'Diagnosis and treatment of nervous system disorders'],
    ['Psychology', 'Mental health and behavioral studies'],
    ['Cardiothoracic Surgery', 'Surgical procedures on organs inside the thorax'],
    ['Immunology', 'Immune system studies and treatments'],
    ['General Surgery', 'Broad range of surgical procedures']
  ];

  const specs = [
    'Neurologist', 
    'Psychologist',
    'Cardiothoracic Surgeon',
    'Immunologist',
    'General Surgeon'
  ];

  for (const [name, desc] of depts) {
    const exists = await db.get('SELECT id FROM departments WHERE name = ?', [name]);
    if (!exists) {
      await db.run('INSERT INTO departments (name, description) VALUES (?, ?)', [name, desc]);
      console.log(`Added Department: ${name}`);
    }
  }

  for (const name of specs) {
    const exists = await db.get('SELECT id FROM specializations WHERE name = ?', [name]);
    if (!exists) {
      await db.run('INSERT INTO specializations (name) VALUES (?)', [name]);
      console.log(`Added Specialization: ${name}`);
    }
  }

  console.log('Update finished.');
  process.exit(0);
}

updateData().catch(err => {
  console.error(err);
  process.exit(1);
});
