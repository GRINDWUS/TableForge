import React from 'react';

export function TableSelector({ tables, onSelectTable, selectedTable }) {
  return (
    <div className="p-4 bg-white border-b shadow">
      <h2 className="text-lg font-bold mb-3 text-gray-800">Tables</h2>
      <div className="flex gap-2 flex-wrap">
        {tables.map((table) => (
          <button
            key={table}
            onClick={() => onSelectTable(table)}
            className={`px-4 py-2 rounded font-medium transition ${
              selectedTable === table
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {table}
          </button>
        ))}
      </div>
    </div>
  );
}
