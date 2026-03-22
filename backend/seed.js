const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./data.db');

// Insert sample data
db.run(`
  INSERT INTO users (name, email) VALUES 
  ('John Doe', 'john@example.com'),
  ('Jane Smith', 'jane@example.com'),
  ('Bob Johnson', 'bob@example.com'),
  ('Alice Williams', 'alice@example.com'),
  ('Charlie Brown', 'charlie@example.com')
`, function(err) {
  if (err) {
    console.log('Data already exists or error:', err.message);
  } else {
    console.log('✓ Sample data inserted');
  }
  db.close();
});
