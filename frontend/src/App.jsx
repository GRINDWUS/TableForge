import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GridComponent } from './components/GridComponent';
import { TableSelector } from './components/TableSelector';
import { RowForm } from './components/RowForm';
import { SchemaEditor } from './components/SchemaEditor';
import './App.css';

function App() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showSchema, setShowSchema] = useState(false);
  const [rowCount, setRowCount] = useState(0);

  const API = axios.create({
    baseURL: 'http://localhost:5000/api'
  });

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
    setShowForm(false);
    setShowSchema(false);
    fetchTableData(tableName);
    fetchSchema(tableName);
  };

  const fetchTableData = async (tableName) => {
    setLoading(true);
    try {
      const response = await API.get(`/tables/${tableName}/data`);
      setData(response.data.data);
      setRowCount(response.data.data.length);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchema = async (tableName) => {
    try {
      const response = await API.get(`/tables/${tableName}/schema`);
      const cols = response.data.columns
        .map(col => col.name)
        .filter(col => col !== 'id' && col !== 'created_at');
      setColumns(cols);
    } catch (error) {
      console.error('Error fetching schema:', error);
    }
  };

  const handleAddRow = async (rowData) => {
    try {
      await API.post(`/tables/${selectedTable}/rows`, rowData);
      fetchTableData(selectedTable);
      setShowForm(false);
    } catch (error) {
      console.error('Error adding row:', error);
      alert('Error adding row: ' + error.response?.data?.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 shadow-lg">
        <h1 className="text-4xl font-bold">⚡ TableForge</h1>
        <p className="text-blue-100 mt-1">
          Spreadsheet Interface for Real Databases
        </p>
      </header>

      <TableSelector
        tables={tables}
        onSelectTable={handleSelectTable}
        selectedTable={selectedTable}
      />

      <main className="flex-1 p-6">
        {selectedTable ? (
          <>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    {selectedTable}
                  </h2>
                  <p className="text-gray-500 mt-1">
                    {rowCount} {rowCount === 1 ? 'row' : 'rows'} in table
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition shadow"
                  >
                    {showForm ? '✕ Hide Form' : '+ Add Row'}
                  </button>
                  <button
                    onClick={() => setShowSchema(!showSchema)}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium transition shadow"
                  >
                    {showSchema ? '✕ Hide Schema' : '📋 View Schema'}
                  </button>
                  <button
                    onClick={() => fetchTableData(selectedTable)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition shadow"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>
            </div>

            {showForm && columns.length > 0 && (
              <RowForm
                columns={columns}
                onSubmit={handleAddRow}
                buttonText="Add New Row"
              />
            )}

            {showSchema && (
              <SchemaEditor tableName={selectedTable} />
            )}

            {loading ? (
              <div className="text-center py-12 text-gray-500">
                <div className="inline-block">
                  <div className="animate-spin">⏳</div>
                  <p className="mt-2">Loading...</p>
                </div>
              </div>
            ) : (
              <GridComponent
                tableName={selectedTable}
                data={data}
                onDataChange={() => fetchTableData(selectedTable)}
              />
            )}
          </>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <p className="text-xl">Select a table to get started</p>
          </div>
        )}
      </main>

      <footer className="bg-gray-800 text-gray-300 p-4 text-center text-sm">
        TableForge © 2024 | Spreadsheet Interface for Real Databases
      </footer>
    </div>
  );
}

export default App;
