// backend/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// 📁 Ensure database folder exists
const dbFolder = path.join(__dirname, 'data');
if (!fs.existsSync(dbFolder)) {
  fs.mkdirSync(dbFolder);
}

// 📘 Create or connect to database file
const dbPath = path.join(dbFolder, 'smartdocs.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✅ Connected to SQLite database at:', dbPath);

    // Create table if not exists
    db.run(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT,
        content TEXT
      )
    `, (err) => {
      if (err) console.error('❌ Error creating table:', err.message);
      else console.log('📄 Table "documents" is ready.');
    });
  }
});

module.exports = db;
