import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ConnectionManager } from './components/ConnectionManager';
import { GridComponent } from './components/GridComponent';
import { TableSelector } from './components/TableSelector';
import { RowForm } from './components/RowForm';
import { SchemaEditor } from './components/SchemaEditor';
import { RelationshipVisualizer } from './components/RelationshipVisualizer';
import { FilterSort } from './components/FilterSort';
import { AIQueryHelper } from './components/AIQueryHelper';
import { DarkModeToggle } from './components/DarkModeToggle';
import { exportToCSV } from './utils/csvExport';
import { setupKeyboardShortcuts } from './utils/keyboardShortcuts';
import './App.css';

function App() {
  const [connected, setConnected] = useState(false);
  const [connectionConfig, setConnectionConfig] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [tableSchema, setTableSchema] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showSchema, setShowSchema] = useState(false);
  const [showRelationships, setShowRelationships] = useState(false);
  const [showFilterSort, setShowFilterSort] = useState(false);
  const [showAIHelper, setShowAIHelper] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [rowCount, setRowCount] = useState(0);

  const API = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true
  });

  // Check connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await API.get('/connection-status');
      if (response.data.connected) {
        setConnected(true);
        setConnectionConfig(response.data);
        fetchTables();
      }
    } catch (error) {
      console.error('Not connected:', error);
      setConnected(false);
    }
  };

  const handleConnect = async (config) => {
    setConnectionConfig(config);
    setConnected(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    fetchTables();
  };

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
    setShowRelationships(false);
    setShowFilterSort(false);
    setShowAIHelper(false);
    setFilteredData([]);
    fetchTableData(tableName);
    fetchSchema(tableName);
  };

  const fetchTableData = async (tableName) => {
    setLoading(true);
    try {
      const response = await API.get(`/tables/${tableName}/data`);
      setData(response.data.data);
      setRowCount(response.data.data.length);
      setFilteredData([]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchema = async (tableName) => {
    try {
      const response = await API.get(`/tables/${tableName}/schema`);
      setTableSchema(response.data.columns);
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
      alert('Error: ' + error.response?.data?.error);
    }
  };

  const handleApplyFilterSort = async (options) => {
    try {
      const query = new URLSearchParams();
      if (options.filter) {
        query.append('filter', JSON.stringify(options.filter));
      }
      if (options.sort) {
        query.append('sort', JSON.stringify(options.sort));
      }

      const response = await API.get(
        `/tables/${selectedTable}/query?${query.toString()}`
      );
      setFilteredData(response.data.data);
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.response?.data?.error);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!selectedTable) return;

    const cleanup = setupKeyboardShortcuts({
      export: () => {
        if (data.length > 0) {
          exportToCSV(data, selectedTable);
        }
      },
      toggleAddForm: () => {
        setShowForm(!showForm);
      },
      toggleFilter: () => {
        setShowFilterSort(!showFilterSort);
      },
      refresh: () => {
        fetchTableData(selectedTable);
      }
    });

    return cleanup;
  }, [data, selectedTable, showForm, showFilterSort]);

  if (!connected) {
    return <ConnectionManager onConnect={handleConnect} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-gray-800 dark:to-gray-900 text-white p-6 shadow-lg transition-colors duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">⚡ TableForge</h1>
            <p className="text-blue-100 dark:text-gray-400 mt-1">
              {connectionConfig?.type?.toUpperCase()} • {connectionConfig?.host || 'Local'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <DarkModeToggle />
            <button
              onClick={async () => {
                await API.post('/disconnect');
                setConnected(false);
                setSelectedTable(null);
              }}
              className="hidden sm:inline-flex px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition"
            >
              🔌 Disconnect
            </button>
          </div>
        </div>
      </header>

      <TableSelector
        tables={tables}
        onSelectTable={handleSelectTable}
        selectedTable={selectedTable}
      />

      <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {selectedTable ? (
          <>
            <div className="mb-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                    {selectedTable}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {rowCount} {rowCount === 1 ? 'row' : 'rows'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                  <button onClick={() => setShowForm(!showForm)} className="flex-1 lg:flex-none px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition shadow text-sm">
                    {showForm ? '✕' : '+'} Add
                  </button>
                  <button onClick={() => setShowSchema(!showSchema)} className="flex-1 lg:flex-none px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium transition shadow text-sm">
                    📋 Schema
                  </button>
                  <button onClick={() => setShowRelationships(!showRelationships)} className="flex-1 lg:flex-none px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition shadow text-sm">
                    🔗 Rels
                  </button>
                  <button onClick={() => setShowFilterSort(!showFilterSort)} className="flex-1 lg:flex-none px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 font-medium transition shadow text-sm">
                    🔍 Filter
                  </button>
                  <button onClick={() => setShowAIHelper(!showAIHelper)} className="flex-1 lg:flex-none px-3 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-medium transition shadow text-sm">
                    🤖 AI
                  </button>
                  <button onClick={() => exportToCSV(data, selectedTable)} className="flex-1 lg:flex-none px-3 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 font-medium transition shadow text-sm">
                    📥 Export
                  </button>
                  <button onClick={() => fetchTableData(selectedTable)} className="flex-1 lg:flex-none px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition shadow text-sm">
                    🔄 Refresh
                  </button>
                </div>
              </div>
            </div>

            {showForm && tableSchema.length > 0 && (
              <RowForm
                columns={tableSchema.filter(col => col.name !== 'id' && col.name !== 'created_at' && col.Field !== 'id' && col.column_name !== 'id')}
                onSubmit={handleAddRow}
                buttonText="Add New Row"
              />
            )}

            {showRelationships && (
              <div className="mb-4 bg-white dark:bg-gray-800 rounded border shadow p-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
                  Table Relationships
                </h3>
                <RelationshipVisualizer tables={tables} />
              </div>
            )}

            {showSchema && (
              <SchemaEditor tableName={selectedTable} />
            )}

            {showFilterSort && (
              <FilterSort
                columns={columns}
                onApply={handleApplyFilterSort}
                onClear={() => {
                  setShowFilterSort(false);
                  setFilteredData([]);
                  fetchTableData(selectedTable);
                }}
              />
            )}

            {showAIHelper && tableSchema.length > 0 && (
              <AIQueryHelper
                tableName={selectedTable}
                tableSchema={tableSchema}
              />
            )}

            {loading ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="animate-spin text-3xl">⏳</div>
                <p className="mt-2">Loading...</p>
              </div>
            ) : (
              <GridComponent
                tableName={selectedTable}
                data={filteredData.length > 0 ? filteredData : data}
                tableSchema={tableSchema}
                onDataChange={() => {
                  fetchTableData(selectedTable);
                  setFilteredData([]);
                }}
              />
            )}
          </>
        ) : (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <p className="text-xl">Select a table to get started</p>
          </div>
        )}
      </main>

      <footer className="bg-gray-800 dark:bg-gray-950 text-gray-300 p-4 text-center text-sm transition-colors duration-300">
        TableForge © 2026 | Multi-Database Spreadsheet Interface
      </footer>
    </div>
  );
}

export default App;
