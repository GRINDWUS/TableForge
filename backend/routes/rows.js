const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Insert row
  router.post('/tables/:name/rows', (req, res) => {
    const tableName = req.params.name;
    const row = req.body;

    const columns = Object.keys(row).join(', ');
    const values = Object.values(row);
    const placeholders = Object.keys(row).map(() => '?').join(', ');

    const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;

    db.run(sql, values, function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ 
        message: 'Row inserted', 
        id: this.lastID 
      });
    });
  });

  // Update row
  router.put('/tables/:name/rows/:id', (req, res) => {
    const tableName = req.params.name;
    const id = req.params.id;
    const row = req.body;

    const setClause = Object.keys(row)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = [...Object.values(row), id];

    const sql = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;

    db.run(sql, values, (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Row updated' });
    });
  });

  // Delete row
  router.delete('/tables/:name/rows/:id', (req, res) => {
    const tableName = req.params.name;
    const id = req.params.id;

    const sql = `DELETE FROM ${tableName} WHERE id = ?`;

    db.run(sql, [id], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Row deleted' });
    });
  });

  return router;
};
