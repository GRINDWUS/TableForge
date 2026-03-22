const express = require('express');
const router = express.Router();

module.exports = () => {
  // Advanced query with filter and sort
  router.get('/tables/:name/query', async (req, res) => {
    try {
      const tableName = req.params.name;
      let sql = `SELECT * FROM ${tableName}`;
      const params = [];

      // Parse filter query parameter
      if (req.query.filter) {
        const filter = JSON.parse(req.query.filter);
        sql += ` WHERE ${filter.column} LIKE ?`;
        params.push(`%${filter.value}%`);
      }

      // Parse sort query parameter
      if (req.query.sort) {
        const sort = JSON.parse(req.query.sort);
        const order = sort.order === 'desc' ? 'DESC' : 'ASC';
        sql += ` ORDER BY ${sort.column} ${order}`;
      }

      // Limit and offset for pagination
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      sql += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const rows = await req.db.executeQuery(sql, params);
      res.json({ data: rows, count: rows.length });
    } catch (error) {
      res.status(400).json({ error: 'Invalid query parameters', details: error.message });
    }
  });

  // Execute ANY SQL (Internal / Admin use for Blueprint / Schema changes)
  router.post('/query', async (req, res) => {
    const { sql, params = [] } = req.body;
    
    if (!sql) {
      return res.status(400).json({ error: 'SQL string is required' });
    }

    try {
      const result = await req.db.executeQuery(sql, params);
      res.json({ success: true, result });
    } catch (error) {
      console.error('SQL Execution Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
