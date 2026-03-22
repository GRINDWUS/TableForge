import React, { useState, useEffect } from 'react';
import axios from 'axios';

export function SchemaEditor({ tableName }) {
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCol, setNewCol] = useState({ name: '', type: 'TEXT', notNull: false, defaultValue: '' });
  const [sqlPreview, setSqlPreview] = useState('');

  const API = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true
  });

  useEffect(() => {
    fetchSchema();
  }, [tableName]);

  useEffect(() => {
    generateSqlPreview();
  }, [newCol, tableName]);

  const fetchSchema = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/tables/${tableName}/schema`);
      setColumns(response.data.columns);
    } catch (error) {
      console.error('Error fetching schema:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSqlPreview = () => {
    if (!newCol.name) {
      setSqlPreview('');
      return;
    }
    const notNullSql = newCol.notNull ? ' NOT NULL' : '';
    const defaultSql = newCol.defaultValue ? ` DEFAULT '${newCol.defaultValue}'` : '';
    const sql = `ALTER TABLE ${tableName} ADD COLUMN ${newCol.name} ${newCol.type}${notNullSql}${defaultSql};`;
    setSqlPreview(sql);
  };

  const handleAddColumn = async () => {
    if (!newCol.name) return;
    setLoading(true);
    try {
      // We'll use a generic query endpoint for schema changes to show off the dynamic DB power
      await API.post('/query', { sql: sqlPreview });
      setShowAddForm(false);
      setNewCol({ name: '', type: 'TEXT', notNull: false, defaultValue: '' });
      fetchSchema();
      alert('Column added successfully!');
    } catch (error) {
      console.error('Error adding column:', error);
      alert('Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-xl mb-6 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Schema Editor</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage structure for {tableName}</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className={`px-4 py-2 rounded-lg font-bold transition transform active:scale-95 ${
            showAddForm ? 'bg-red-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {showAddForm ? '✕ Close' : '+ Add Column'}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-8 p-6 bg-blue-50 dark:bg-gray-900 rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-900 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1 uppercase">Name</label>
              <input
                type="text"
                value={newCol.name}
                onChange={e => setNewCol({...newCol, name: e.target.value.replace(/\s/g, '_')})}
                placeholder="column_name"
                className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1 uppercase">Type</label>
              <select
                value={newCol.type}
                onChange={e => setNewCol({...newCol, type: e.target.value})}
                className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {['TEXT', 'INTEGER', 'NUMERIC', 'BOOLEAN', 'DATE', 'TIMESTAMP', 'VARCHAR(255)'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1 uppercase">Default</label>
              <input
                type="text"
                value={newCol.defaultValue}
                onChange={e => setNewCol({...newCol, defaultValue: e.target.value})}
                placeholder="NULL"
                className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center mt-5">
              <input
                type="checkbox"
                checked={newCol.notNull}
                onChange={e => setNewCol({...newCol, notNull: e.target.checked})}
                className="w-5 h-5 accent-blue-600 mr-2"
                id="notnull"
              />
              <label htmlFor="notnull" className="text-sm font-bold text-gray-700 dark:text-gray-300 pointer-cursor">Not Null</label>
            </div>
          </div>

          {sqlPreview && (
            <div className="mb-4">
              <label className="text-xs font-bold text-emerald-600 mb-1 uppercase block">🚀 SQL Preview (Hackathon Requirement)</label>
              <div className="p-3 bg-emerald-900 text-emerald-100 font-mono text-xs rounded border border-emerald-700 break-all overflow-x-auto">
                {sqlPreview}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleAddColumn}
              disabled={!newCol.name || loading}
              className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition shadow-lg"
            >
              {loading ? 'Executing...' : 'Apply Blueprint'}
            </button>
          </div>
        </div>
      )}

      {loading && !showAddForm ? (
        <div className="text-center py-10 text-gray-500">
          <div className="animate-pulse">Loading architectural blueprints...</div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <th className="p-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Column</th>
                <th className="p-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data Type</th>
                <th className="p-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Constraints</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {columns.map((col, idx) => {
                const name = col.name || col.Field || col.column_name;
                const type = col.type || col.Type || col.data_type;
                const isPk = col.pk || col.Key === 'PRI';
                const isNN = col.notnull || col.Null === 'NO';

                return (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <td className="p-4 font-bold text-gray-800 dark:text-gray-200">
                      {name}
                      {isPk && <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase">PK</span>}
                    </td>
                    <td className="p-4 text-sm font-mono text-purple-600 dark:text-purple-400 uppercase">{type}</td>
                    <td className="p-4 flex gap-2">
                      {isNN && <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded uppercase font-bold">NN</span>}
                      {col.dflt_value && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded uppercase font-bold">DEF: {col.dflt_value}</span>}
                      {!isNN && !isPk && <span className="text-[10px] text-gray-400 italic">Nullable</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
