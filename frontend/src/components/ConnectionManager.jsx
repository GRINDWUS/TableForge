import React, { useState } from 'react';
import axios from 'axios';

export function ConnectionManager({ onConnect }) {
  const [dbType, setDbType] = useState('sqlite');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // SQLite config
  const [sqlitePath, setSqlitePath] = useState('./data.db');
  
  // MySQL/Postgres config
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState(dbType === 'mysql' ? 3306 : 5432);
  const [user, setUser] = useState('root');
  const [password, setPassword] = useState('');
  const [database, setDatabase] = useState('tableforge');

  const handleConnect = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let connectionConfig = { type: dbType };

      if (dbType === 'sqlite') {
        connectionConfig.path = sqlitePath;
      } else {
        connectionConfig = {
          ...connectionConfig,
          host,
          port: parseInt(port),
          user,
          password,
          database
        };
      }

      // Test connection
      const response = await axios.post(
        'http://localhost:5000/api/test-connection',
        connectionConfig,
        { withCredentials: true }
      );

      if (response.data.success) {
        // Store connection in session storage
        sessionStorage.setItem('connectionConfig', JSON.stringify(connectionConfig));
        onConnect(connectionConfig);
      } else {
        setError('Connection failed: ' + response.data.error);
      }
    } catch (err) {
      setError('Error connecting: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            ⚡ TableForge
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect to your database
          </p>
        </div>

        <form onSubmit={handleConnect} className="space-y-6">
          {/* Database Type Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
              Database Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['sqlite', 'mysql', 'postgres'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setDbType(type);
                    if (type === 'mysql') setPort(3306);
                    else if (type === 'postgres') setPort(5432);
                  }}
                  className={`py-2 px-3 rounded-lg font-semibold transition ${
                    dbType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {type === 'sqlite' ? '📁 SQLite' : type === 'mysql' ? '🐬 MySQL' : '🐘 Postgres'}
                </button>
              ))}
            </div>
          </div>

          {/* SQLite Path */}
          {dbType === 'sqlite' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Database File Path
              </label>
              <input
                type="text"
                value={sqlitePath}
                onChange={(e) => setSqlitePath(e.target.value)}
                placeholder="./data.db"
                className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leave blank for default ./data.db
              </p>
            </div>
          )}

          {/* MySQL/Postgres Connection Details */}
          {(dbType === 'mysql' || dbType === 'postgres') && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Host
                  </label>
                  <input
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    placeholder="localhost"
                    className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Port
                  </label>
                  <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  placeholder={dbType === 'mysql' ? 'root' : 'postgres'}
                  className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Database Name
                </label>
                <input
                  type="text"
                  value={database}
                  onChange={(e) => setDatabase(e.target.value)}
                  placeholder="tableforge"
                  className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Connect Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Connecting...' : '🚀 Connect'}
          </button>
        </form>
      </div>
    </div>
  );
}
