const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Get all tables
  router.get('/tables', (req, res) => {
    db.all(
      "SELECT name FROM sqlite_master WHERE type='table'",
      (err, tables) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ tables: tables.map(t => t.name) });
      }
    );
  });

  // Get table schema
  router.get('/tables/:name/schema', (req, res) => {
    const tableName = req.params.name;
    db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ columns });
    });
  });

  // Get table data (paginated)
  router.get('/tables/:name/data', (req, res) => {
    const tableName = req.params.name;
    const limit = req.query.limit || 50;
    const offset = req.query.offset || 0;

    db.all(
      `SELECT * FROM ${tableName} LIMIT ? OFFSET ?`,
      [limit, offset],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ data: rows, count: rows.length });
      }
    );
  });

  return router;
};
