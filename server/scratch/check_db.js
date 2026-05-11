const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.each("SELECT name FROM sqlite_master WHERE type='table'", (err, table) => {
    if (err) {
      console.error(err.message);
    }
    console.log(table.name);
  });
});

db.close();
