const express = require('express');
const router = express.Router();

module.exports = () => {
  // Insert row
  router.post('/tables/:name/rows', async (req, res) => {
    try {
      const tableName = req.params.name;
      const row = req.body;

      const columns = Object.keys(row).join(', ');
      const placeholders = Object.keys(row).map(() => '?').join(', ');
      const values = Object.values(row);

      const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;

      const result = await req.db.executeQuery(sql, values);
      
      res.status(201).json({ 
        message: 'Row inserted', 
        id: result?.lastID 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update row
  router.put('/tables/:name/rows/:id', async (req, res) => {
    try {
      const tableName = req.params.name;
      const id = req.params.id;
      const row = req.body;

      // In Postgres, returning the row could be useful but we'll stick to basic UPDATE.
      const setClause = Object.keys(row)
        .map(key => `${key} = ?`)
        .join(', ');
      
      const values = [...Object.values(row), id];
      const sql = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;

      await req.db.executeQuery(sql, values);
      res.json({ message: 'Row updated' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete row
  router.delete('/tables/:name/rows/:id', async (req, res) => {
    try {
      const tableName = req.params.name;
      const id = req.params.id;
      
      const sql = `DELETE FROM ${tableName} WHERE id = ?`;

      await req.db.executeQuery(sql, [id]);
      res.json({ message: 'Row deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
