const sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql2/promise');
const { Pool } = require('pg');

// Store active connections per session
const activeConnections = new Map();

// SQLite connection
function createSQLiteConnection(dbPath) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath || './data.db', (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('✓ Connected to SQLite:', dbPath);
        resolve(db);
      }
    });
  });
}

// MySQL connection
async function createMySQLConnection(config) {
  try {
    const pool = await mysql.createPool({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
      port: config.port || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    console.log('✓ Connected to MySQL:', config.host);
    return pool;
  } catch (error) {
    throw new Error(`MySQL connection failed: ${error.message}`);
  }
}

// PostgreSQL connection
function createPostgresConnection(config) {
  const pool = new Pool({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    port: config.port || 5432
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  console.log('✓ Connected to PostgreSQL:', config.host);
  return pool;
}

// Main connection factory
async function getConnection(sessionId, connectionConfig) {
  try {
    // Return existing connection for session
    if (activeConnections.has(sessionId)) {
      return activeConnections.get(sessionId);
    }

    let connection;
    const { type, ...config } = connectionConfig;

    if (type === 'sqlite') {
      connection = await createSQLiteConnection(config.path);
    } else if (type === 'mysql') {
      connection = await createMySQLConnection(config);
    } else if (type === 'postgres') {
      connection = await createPostgresConnection(config);
    } else {
      throw new Error(`Unknown database type: ${type}`);
    }

    // Store connection
    activeConnections.set(sessionId, {
      type,
      connection,
      config
    });

    return { type, connection, config };
  } catch (error) {
    throw error;
  }
}

// Disconnect
function disconnect(sessionId) {
  const conn = activeConnections.get(sessionId);
  if (conn) {
    if (conn.type === 'sqlite') {
      conn.connection.close();
    } else if (conn.type === 'mysql') {
      conn.connection.end();
    } else if (conn.type === 'postgres') {
      conn.connection.end();
    }
    activeConnections.delete(sessionId);
  }
}

// Execute query (abstracted for all DB types)
async function executeQuery(connection, type, sql, params = []) {
  try {
    if (type === 'sqlite') {
      return new Promise((resolve, reject) => {
        if (sql.trim().toUpperCase().startsWith('SELECT') || sql.trim().toUpperCase().startsWith('PRAGMA')) {
          connection.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        } else {
          connection.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
          });
        }
      });
    } else if (type === 'mysql') {
      const [rows] = await connection.execute(sql, params);
      return rows;
    } else if (type === 'postgres') {
      // Convert ? placeholders to $1, $2 for postgres
      let pgSql = sql;
      if (sql.includes('?')) {
        let i = 1;
        pgSql = sql.replace(/\?/g, () => `$${i++}`);
      }
      const result = await connection.query(pgSql, params);
      return result.rows;
    }
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getConnection,
  disconnect,
  executeQuery,
  activeConnections
};
