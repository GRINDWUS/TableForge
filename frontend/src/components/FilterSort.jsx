import React, { useState } from 'react';

export function FilterSort({ columns, onApply, onClear }) {
  const [filterColumn, setFilterColumn] = useState(columns[0] || '');
  const [filterValue, setFilterValue] = useState('');
  const [sortColumn, setSortColumn] = useState(columns[0] || '');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    setLoading(true);
    try {
      await onApply({
        filter: filterValue ? { column: filterColumn, value: filterValue } : null,
        sort: { column: sortColumn, order: sortOrder }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded border shadow mb-4">
      <h3 className="text-lg font-bold mb-4 text-gray-800">🔍 Filter & Sort</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* Filter Column Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter Column:
          </label>
          <select
            value={filterColumn}
            onChange={(e) => setFilterColumn(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {columns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>

        {/* Filter Value Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Value:
          </label>
          <input
            type="text"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            placeholder="Enter value..."
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Sort Column Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort by Column:
          </label>
          <select
            value={sortColumn}
            onChange={(e) => setSortColumn(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {columns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>

        {/* Sort Order Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order:
          </label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleApply}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 font-medium transition"
        >
          {loading ? '⏳ Applying...' : '✓ Apply'}
        </button>

        <button
          onClick={onClear}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 font-medium transition"
        >
          ✕ Clear
        </button>

        <p className="ml-auto text-sm text-gray-500 flex items-center">
          💡 Filter searches for text containing your value
        </p>
      </div>
    </div>
  );
}
