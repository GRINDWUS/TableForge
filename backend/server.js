const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// SQLite Database Setup
const db = new sqlite3.Database('./data.db', (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('✓ Connected to SQLite database');
  }
});

// Create sample table
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

// Import routes
const tablesRouter = require('./routes/tables');
const rowsRouter = require('./routes/rows');

// Use routes
app.use('/api', tablesRouter(db));
app.use('/api', rowsRouter(db));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
});

module.exports = { app, db };
