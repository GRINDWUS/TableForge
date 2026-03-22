const express = require('express');
const router = express.Router();

module.exports = (dbModule) => {
  // Get all tables
  router.get('/tables', async (req, res) => {
    try {
      const sessionId = req.sessionID;
      const conn = dbModule.activeConnections.get(sessionId);

      if (!conn) {
        return res.status(403).json({ error: 'Not connected' });
      }

      let sql;
      if (conn.type === 'sqlite') {
        sql = "SELECT name FROM sqlite_master WHERE type='table'";
      } else if (conn.type === 'mysql') {
        sql = `SELECT TABLE_NAME as name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='${conn.config.database}'`;
      } else if (conn.type === 'postgres') {
        sql = `SELECT table_name as name FROM information_schema.tables WHERE table_schema='public'`;
      }

      const rows = await dbModule.executeQuery(conn.connection, conn.type, sql);
      const tables = rows.map(row => row.name || row.TABLE_NAME || row.table_name || row.Name);

      res.json({ tables });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get table schema
  router.get('/tables/:name/schema', async (req, res) => {
    try {
      const tableName = req.params.name;
      const sessionId = req.sessionID;
      const conn = dbModule.activeConnections.get(sessionId);

      if (!conn) {
        return res.status(403).json({ error: 'Not connected' });
      }

      let sql;
      if (conn.type === 'sqlite') {
        sql = `PRAGMA table_info(${tableName})`;
      } else if (conn.type === 'mysql') {
        sql = `DESCRIBE ${tableName}`;
      } else if (conn.type === 'postgres') {
        sql = `SELECT column_name as name, data_type as type, is_nullable FROM information_schema.columns WHERE table_name='${tableName}'`;
      }

      let columns = await dbModule.executeQuery(conn.connection, conn.type, sql);
      
      // Normalize schema output to match generic format
      if (conn.type === 'mysql') {
        columns = columns.map(c => ({ name: c.Field, type: c.Type, notnull: c.Null === 'NO', pk: c.Key === 'PRI' }));
      }
      
      res.json({ columns });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get table data
  router.get('/tables/:name/data', async (req, res) => {
    try {
      const tableName = req.params.name;
      const sessionId = req.sessionID;
      const conn = dbModule.activeConnections.get(sessionId);

      if (!conn) {
        return res.status(403).json({ error: 'Not connected' });
      }

      const limit = req.query.limit || 50;
      const offset = req.query.offset || 0;

      const sql = `SELECT * FROM ${tableName} LIMIT ${limit} OFFSET ${offset}`;
      const data = await dbModule.executeQuery(conn.connection, conn.type, sql);

      res.json({ data, count: data.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
