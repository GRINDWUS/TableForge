import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

function App() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Feature flags/toggles
  const [showForm, setShowForm] = useState(false);
  const [showSchema, setShowSchema] = useState(false);
  const [showRelationships, setShowRelationships] = useState(false);
  const [showFilterSort, setShowFilterSort] = useState(false);
  const [showAIHelper, setShowAIHelper] = useState(false);
  
  // Extra data pieces
  const [rowCount, setRowCount] = useState(0);
  const [filteredData, setFilteredData] = useState([]);
  const [tableSchema, setTableSchema] = useState([]);

  // Fetch lists of tables
  useEffect(() => {
    fetchTables();
  }, []);

  // Keyboard Shortcuts Hook
  useEffect(() => {
    const cleanup = setupKeyboardShortcuts({
      export: () => {
        if (data.length > 0) {
          exportToCSV(data, selectedTable);
        } else {
          alert('No data to export');
        }
      },
      toggleAddForm: () => {
        if (selectedTable) {
          setShowForm(!showForm);
        }
      },
      toggleFilter: () => {
        if (selectedTable) {
          setShowFilterSort(!showFilterSort);
        }
      },
      refresh: () => {
        if (selectedTable) {
          fetchTableData(selectedTable);
        }
      }
    });

    return cleanup;
  }, [data, selectedTable, showForm, showFilterSort]);

  const fetchTables = async () => {
    try {
      const response = await API.get('/tables');
      setTables(response.data.tables);
    } catch (error) {
      console.error('Error fetching tables:', error);
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

  const fetchTableData = async (tableName) => {
    setLoading(true);
    try {
      await fetchSchema(tableName);
      const response = await API.get(`/tables/${tableName}/data`);
      setData(response.data.data);
      setRowCount(response.data.count);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error fetching data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTableSelect = (tableName) => {
    setSelectedTable(tableName);
    setShowForm(false);
    setShowSchema(false);
    setShowRelationships(false);
    setShowFilterSort(false);
    setShowAIHelper(false);
    setFilteredData([]);
    fetchTableData(tableName);
  };

  const handleAddRow = async (rowData) => {
    try {
      await API.post(`/tables/${selectedTable}/rows`, rowData);
      setShowForm(false);
      fetchTableData(selectedTable);
    } catch (error) {
      console.error('Error adding row:', error);
      alert('Error adding row: ' + error.response?.data?.error);
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
      console.error('Error applying filter/sort:', error);
      alert('Error: ' + error.response?.data?.error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-gray-800 dark:to-gray-900 text-white p-6 shadow-lg transition-colors duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-2">
              <span>⚡</span> TableForge
            </h1>
            <p className="text-blue-100 dark:text-gray-400 mt-1">
              Spreadsheet Interface for Real Databases
            </p>
          </div>
          <DarkModeToggle />
        </div>
      </header>
      
      <TableSelector 
        tables={tables} 
        onSelectTable={handleTableSelect} 
        selectedTable={selectedTable} 
      />

      <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {!selectedTable ? (
          <div className="text-center py-20 text-gray-500 text-lg">
            ← Select a table to view its data
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                    {selectedTable}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {rowCount} {rowCount === 1 ? 'row' : 'rows'} in table
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex-1 lg:flex-none px-3 py-2 lg:px-4 lg:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition shadow text-sm lg:text-base"
                    title="Add Row (Ctrl+A)"
                  >
                    {showForm ? '✕' : '+'} Add
                  </button>
                  <button
                    onClick={() => setShowSchema(!showSchema)}
                    className="flex-1 lg:flex-none px-3 py-2 lg:px-4 lg:py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium transition shadow text-sm lg:text-base"
                    title="View Schema"
                  >
                    📋 Schema
                  </button>
                  <button
                    onClick={() => setShowRelationships(!showRelationships)}
                    className="flex-1 lg:flex-none px-3 py-2 lg:px-4 lg:py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition shadow text-sm lg:text-base"
                    title="View Relationships"
                  >
                    🔗 Rels
                  </button>
                  <button
                    onClick={() => setShowFilterSort(!showFilterSort)}
                    className="flex-1 lg:flex-none px-3 py-2 lg:px-4 lg:py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 font-medium transition shadow text-sm lg:text-base"
                    title="Filter & Sort (Ctrl+F)"
                  >
                    🔍 Filter
                  </button>
                  <button
                    onClick={() => setShowAIHelper(!showAIHelper)}
                    className="flex-1 lg:flex-none px-3 py-2 lg:px-4 lg:py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-medium transition shadow text-sm lg:text-base"
                    title="AI Query Helper"
                  >
                    🤖 AI
                  </button>
                  <button
                    onClick={() => exportToCSV(data, selectedTable)}
                    className="flex-1 lg:flex-none px-3 py-2 lg:px-4 lg:py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 font-medium transition shadow text-sm lg:text-base"
                    title="Export CSV (Ctrl+E)"
                  >
                    📥 Export
                  </button>
                  <button
                    onClick={() => fetchTableData(selectedTable)}
                    className="flex-1 lg:flex-none px-3 py-2 lg:px-4 lg:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition shadow text-sm lg:text-base"
                    title="Refresh (Ctrl+R)"
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>
            </div>

            {selectedTable && !showForm && !showSchema && !showFilterSort && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded border border-blue-200 dark:border-blue-700 text-sm text-blue-700 dark:text-blue-300">
                <strong>⌨️ Keyboard Shortcuts:</strong> Ctrl+E (Export) • Ctrl+A (Add Row) • Ctrl+F (Filter) • Ctrl+R (Refresh)
              </div>
            )}

            {showForm && columns.length > 0 && (
              <RowForm
                columns={columns}
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

            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
              Data
            </h2>
            {loading ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="inline-block">
                  <div className="animate-spin text-3xl">⏳</div>
                  <p className="mt-2 font-medium">Loading...</p>
                </div>
              </div>
            ) : (
              <GridComponent
                tableName={selectedTable}
                data={filteredData.length > 0 ? filteredData : data}
                onDataChange={() => {
                  fetchTableData(selectedTable);
                  setFilteredData([]);
                }}
              />
            )}
          </>
        )}
      </main>

      <footer className="bg-gray-800 dark:bg-gray-950 text-gray-300 p-4 text-center text-sm transition-colors duration-300">
        TableForge © 2024 | Built with ❤️ for Watch The Code
      </footer>
    </div>
  );
}

export default App;
