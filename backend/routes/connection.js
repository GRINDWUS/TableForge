const express = require('express');
const router = express.Router();
const db = require('../db');

module.exports = () => {
  // Test connection
  router.post('/test-connection', async (req, res) => {
    const connectionConfig = req.body;
    const sessionId = req.sessionID;

    try {
      const { type, connection } = await db.getConnection(
        sessionId,
        connectionConfig
      );

      // Test with a simple query
      if (type === 'sqlite') {
        await db.executeQuery(
          connection,
          type,
          "SELECT 1 as test"
        );
      } else {
        await db.executeQuery(
          connection,
          type,
          "SELECT 1 as test"
        );
      }

      res.json({
        success: true,
        message: `Connected to ${type}`,
        type
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get connection status
  router.get('/connection-status', (req, res) => {
    const sessionId = req.sessionID;
    const conn = db.activeConnections.get(sessionId);

    if (conn) {
      res.json({
        connected: true,
        type: conn.type,
        host: conn.config?.host || 'local',
        database: conn.config?.database || conn.config?.path
      });
    } else {
      res.json({ connected: false });
    }
  });

  // Disconnect
  router.post('/disconnect', (req, res) => {
    const sessionId = req.sessionID;
    db.disconnect(sessionId);
    res.json({ message: 'Disconnected' });
  });

  return router;
};
