const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const db = require('./db');
require('dotenv').config();

const app = express();

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'tableforge-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));

// Middleware
app.use(cors({ 
  origin: function (origin, callback) {
    callback(null, true); // Allow all origins for local dev with credentials
  }, 
  credentials: true 
}));
app.use(bodyParser.json());

// Routes
const connectionRouter = require('./routes/connection');
const tablesRouter = require('./routes/tables');
const rowsRouter = require('./routes/rows');
const queryRouter = require('./routes/query');
const aiRouter = require('./routes/ai');

app.use('/api', connectionRouter());

app.use('/api', (req, res, next) => {
  const sessionId = req.sessionID;
  const conn = db.activeConnections.get(sessionId);
  if (!conn && req.path !== '/test-connection' && req.path !== '/connection-status') {
    return res.status(403).json({ error: 'Not connected to database. Please connect first.' });
  }
  next();
});

// Attach DB to requests
app.use((req, res, next) => {
  const sessionId = req.sessionID;
  const conn = db.activeConnections.get(sessionId);
  if (conn) {
    req.db = {
      connection: conn.connection,
      type: conn.type,
      executeQuery: (sql, params = []) => db.executeQuery(conn.connection, conn.type, sql, params)
    };
  }
  next();
});

// Important: pass the db module to routers if they need it
app.use('/api', tablesRouter(db));
app.use('/api', rowsRouter(db));
app.use('/api', queryRouter(db));
app.use('/api', aiRouter(db));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'TableForge API is running! Access /api/health for status.' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to TableForge API! Available endpoints: /api/tables, /api/health' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ TableForge server running on port ${PORT}`);
});

module.exports = { app, db };
