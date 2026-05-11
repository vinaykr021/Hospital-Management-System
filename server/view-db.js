const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const readline = require('readline');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('--- Hospital Management System Database Viewer ---');
console.log('Available Commands:');
console.log('1. patients    - List all patients');
console.log('2. doctors     - List all doctors');
console.log('3. appointments - List all appointments');
console.log('4. wards       - List all wards');
console.log('5. exit        - Close viewer');

const ask = () => {
  rl.question('\nEnter command: ', (cmd) => {
    const command = cmd.toLowerCase().trim();

    if (command === 'exit') {
      db.close();
      rl.close();
      return;
    }

    let query = '';
    switch (command) {
      case 'patients':
      case '1':
        query = 'SELECT id, name, age, gender, phone, blood_group FROM patients';
        break;
      case 'doctors':
      case '2':
        query = 'SELECT id, name, specialization, phone FROM doctors';
        break;
      case 'appointments':
      case '3':
        query = `
          SELECT a.id, p.name as patient, d.name as doctor, a.date, a.time, a.status 
          FROM appointments a
          LEFT JOIN patients p ON a.patient_id = p.id
          LEFT JOIN doctors d ON a.doctor_id = d.id
        `;
        break;
      case 'wards':
      case '4':
        query = 'SELECT name, total_beds, occupied_beds, floor FROM wards';
        break;
      default:
        console.log('Unknown command. Try: patients, doctors, appointments, wards, or exit');
        ask();
        return;
    }

    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error:', err.message);
      } else {
        console.table(rows);
      }
      ask();
    });
  });
};

ask();
