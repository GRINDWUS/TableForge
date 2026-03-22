import React, { useState } from 'react';
import axios from 'axios';

export function GridComponent({ tableName, data = [], onDataChange }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  const API = axios.create({
    baseURL: 'http://localhost:5000/api'
  });

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
      <div className="p-6 text-center text-gray-500 bg-white rounded">
        No data available
      </div>
    );
  }

  const columns = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto p-6 bg-white rounded shadow">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-blue-100">
            {columns.map((col) => (
              <th 
                key={col} 
                className="border border-gray-300 p-3 text-left font-bold text-gray-800"
              >
                {col}
              </th>
            ))}
            <th className="border border-gray-300 p-3 text-center font-bold text-gray-800">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={`${row.id}-${col}`} className="border border-gray-300 p-3">
                  {editingId === row.id ? (
                    <input
                      type="text"
                      value={editData[col] || ''}
                      onChange={(e) =>
                        setEditData({ ...editData, [col]: e.target.value })
                      }
                      className="p-1 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    row[col]
                  )}
                </td>
              ))}
              <td className="border border-gray-300 p-3 text-center">
                {editingId === row.id ? (
                  <>
                    <button
                      onClick={() => handleSave(row.id)}
                      disabled={loadingId === row.id}
                      className="px-2 py-1 bg-green-500 text-white rounded mr-2 hover:bg-green-600 disabled:bg-gray-400 text-sm"
                    >
                      {loadingId === row.id ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(row)}
                      className="px-2 py-1 bg-blue-500 text-white rounded mr-2 hover:bg-blue-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(row.id)}
                      disabled={loadingId === row.id}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 text-sm"
                    >
                      {loadingId === row.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
