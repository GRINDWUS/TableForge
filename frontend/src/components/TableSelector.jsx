import React from 'react';

export function TableSelector({ tables, onSelectTable, selectedTable }) {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 border-b shadow transition-colors duration-300">
      <h2 className="text-lg font-bold mb-3 text-gray-800 dark:text-white">
        📊 Tables
      </h2>
      <div className="flex gap-2 flex-wrap">
        {tables.map((table) => (
          <button
            key={table}
            onClick={() => onSelectTable(table)}
            className={`px-4 py-2 rounded font-medium transition ${
              selectedTable === table
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {table}
          </button>
        ))}
      </div>
    </div>
  );
}
