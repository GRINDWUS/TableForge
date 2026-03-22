const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data.db');

db.serialize(() => {
  // 1. Create a "Smart" Tasks table to show off new UI widgets
  db.run(`DROP TABLE IF EXISTS demo_tasks`);
  db.run(`
    CREATE TABLE demo_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_name TEXT NOT NULL,
      priority INTEGER DEFAULT 1,
      due_date DATETIME,
      is_urgent BOOLEAN DEFAULT 0,
      notes TEXT
    )
  `);

  // 2. Insert diverse data types
  const stmt = db.prepare(`
    INSERT INTO demo_tasks (task_name, priority, due_date, is_urgent, notes) 
    VALUES (?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString().slice(0, 16); // Format for datetime-local
  
  stmt.run('Finish Hackathon UI', 5, now, 1, 'Make it look premium');
  stmt.run('Submit TableForge', 4, now, 1, 'Check all requirements');
  stmt.run('Rest & Recover', 1, now, 0, 'Sleep for 10 hours');
  stmt.finalize();

  console.log('--- HACKATHON DEMO DATA LOADED ---');
  console.log('✓ Created "demo_tasks" table');
  console.log('✓ Added rows with Dates, Booleans, and Integers');
  console.log('---------------------------------');
});

db.close();
