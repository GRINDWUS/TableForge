import React, { useState, useEffect } from 'react';
import axios from 'axios';

export function SchemaEditor({ tableName }) {
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);

  const API = axios.create({
    baseURL: 'http://localhost:5000/api'
  });

  useEffect(() => {
    fetchSchema();
  }, [tableName]);

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

  return (
    <div className="p-6 bg-white rounded border shadow mb-4">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Schema Editor</h3>

      {loading ? (
        <div className="text-gray-500">Loading schema...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3 text-left font-bold">Column Name</th>
                <th className="border p-3 text-left font-bold">Type</th>
                <th className="border p-3 text-left font-bold">Not Null</th>
                <th className="border p-3 text-left font-bold">Primary Key</th>
              </tr>
            </thead>
            <tbody>
              {columns.map((col, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border p-3 font-medium text-gray-800">
                    {col.name}
                  </td>
                  <td className="border p-3 text-gray-700">{col.type}</td>
                  <td className="border p-3">
                    {col.notnull ? (
                      <span className="text-green-600 font-medium">Yes</span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </td>
                  <td className="border p-3">
                    {col.pk ? (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                        Primary Key
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-700">
        <strong>Note:</strong> SQLite schema modification via API is limited. 
        To add new columns, use your database client or modify the database directly.
      </div>
    </div>
  );
}
