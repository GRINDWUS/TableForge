const express = require('express');
const router = express.Router();

module.exports = (db) => {
  // Advanced query with filter and sort
  router.get('/tables/:name/query', (req, res) => {
    const tableName = req.params.name;
    let sql = `SELECT * FROM ${tableName}`;
    const params = [];

    try {
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

      db.all(sql, params, (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ data: rows, count: rows.length });
      });
    } catch (error) {
      res.status(400).json({ error: 'Invalid query parameters', details: error.message });
    }
  });

  return router;
};
