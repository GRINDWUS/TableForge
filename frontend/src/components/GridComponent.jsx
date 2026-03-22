import React, { useState } from 'react';
import axios from 'axios';

export function GridComponent({ tableName, data = [], tableSchema = [], onDataChange }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  const API = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true
  });

  const getColumnType = (colName) => {
    const col = tableSchema.find(c => c.name === colName || c.Field === colName || c.column_name === colName);
    if (!col) return 'text';
    const type = (col.type || col.Type || col.data_type || '').toLowerCase();
    
    if (type.includes('int') || type.includes('decimal') || type.includes('numeric') || type.includes('real') || type.includes('float') || type.includes('double')) return 'number';
    if (type.includes('date') || type.includes('time') || type.includes('timestamp')) return 'date';
    if (type.includes('bool') || type.includes('tinyint(1)')) return 'checkbox';
    return 'text';
  };

  const handleEdit = (row) => {
    setEditingId(row.id);
    setEditData({ ...row });
  };

  const handleSave = async (id) => {
    setLoadingId(id);
    try {
      await API.put(`/tables/${tableName}/rows/${id}`, editData);
      setEditingId(null);
      onDataChange();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving row');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this row?')) return;
    
    setLoadingId(id);
    try {
      await API.delete(`/tables/${tableName}/rows/${id}`);
      onDataChange();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Error deleting row');
    } finally {
      setLoadingId(null);
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 bg-white rounded shadow dark:bg-gray-800 dark:text-gray-400">
        No data available
      </div>
    );
  }

  const columns = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto p-6 bg-white dark:bg-gray-800 rounded shadow transition-colors duration-300">
      <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
        <thead>
          <tr className="bg-blue-100 dark:bg-gray-700">
            {columns.map((col) => (
              <th 
                key={col} 
                className="border border-gray-300 dark:border-gray-700 p-3 text-left font-bold text-gray-800 dark:text-gray-200"
              >
                {col}
                <span className="ml-2 text-[10px] font-normal uppercase opacity-50 block">
                  {getColumnType(col)}
                </span>
              </th>
            ))}
            <th className="border border-gray-300 dark:border-gray-700 p-3 text-center font-bold text-gray-800 dark:text-gray-200">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              {columns.map((col) => {
                const type = getColumnType(col);
                return (
                  <td key={`${row.id}-${col}`} className="border border-gray-300 dark:border-gray-700 p-3 text-gray-700 dark:text-gray-300">
                    {editingId === row.id ? (
                      type === 'checkbox' ? (
                        <input
                          type="checkbox"
                          checked={!!editData[col]}
                          onChange={(e) =>
                            setEditData({ ...editData, [col]: e.target.checked ? 1 : 0 })
                          }
                          className="w-5 h-5 accent-blue-500"
                        />
                      ) : (
                        <input
                          type={type === 'date' ? 'datetime-local' : type}
                          value={editData[col] || ''}
                          onChange={(e) =>
                            setEditData({ ...editData, [col]: e.target.value })
                          }
                          className="p-1 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
                        />
                      )
                    ) : (
                      type === 'checkbox' ? (
                        <input type="checkbox" checked={!!row[col]} disabled className="w-4 h-4" />
                      ) : (
                        row[col]?.toString() || ''
                      )
                    )}
                  </td>
                );
              })}
              <td className="border border-gray-300 dark:border-gray-700 p-3 text-center">
                {!('id' in row) ? (
                  <span className="text-gray-400 text-xs italic">Read-only table (no primary key)</span>
                ) : editingId === row.id ? (
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleSave(row.id)}
                      disabled={loadingId === row.id}
                      className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 text-sm font-medium transition"
                    >
                      {loadingId === row.id ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm font-medium transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleEdit(row)}
                      className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(row.id)}
                      disabled={loadingId === row.id}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 text-sm font-medium transition"
                    >
                      {loadingId === row.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
