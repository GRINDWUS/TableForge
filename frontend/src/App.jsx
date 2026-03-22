import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GridComponent } from './components/GridComponent';
import { TableSelector } from './components/TableSelector';
import './App.css';

function App() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const API = axios.create({
    baseURL: 'http://localhost:5000/api'
  });

  // Fetch all tables on mount
  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await API.get('/tables');
      setTables(response.data.tables);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const handleSelectTable = async (tableName) => {
    setSelectedTable(tableName);
    setLoading(true);
    try {
      const response = await API.get(`/tables/${tableName}/data`);
      setData(response.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b p-6 shadow">
        <h1 className="text-4xl font-bold text-blue-600">⚡ TableForge</h1>
        <p className="text-gray-600 mt-1">
          Spreadsheet Interface for Real Databases
        </p>
      </header>

      <TableSelector
        tables={tables}
        onSelectTable={handleSelectTable}
        selectedTable={selectedTable}
      />

      <main className="p-6">
        {selectedTable && (
          <div>
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              {selectedTable}
            </h2>
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                Loading...
              </div>
            ) : (
              <GridComponent data={data} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
