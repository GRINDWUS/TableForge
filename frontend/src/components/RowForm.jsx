import React, { useState } from 'react';

export function RowForm({ columns, onSubmit, buttonText = 'Add Row' }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  const getColumnType = (col) => {
    const type = (col.type || col.Type || col.data_type || '').toLowerCase();
    if (type.includes('int') || type.includes('decimal') || type.includes('numeric') || type.includes('real') || type.includes('float') || type.includes('double')) return 'number';
    if (type.includes('date') || type.includes('time') || type.includes('timestamp')) return 'date';
    if (type.includes('bool') || type.includes('tinyint(1)')) return 'checkbox';
    return 'text';
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({});
    } finally {
      setLoading(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="p-6 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded mb-6 shadow-lg transition-colors duration-300"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">{buttonText}</h3>
        <span className="text-xs text-gray-400">Fill in the fields below</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {columns.map(col => {
          const colName = col.name || col.Field || col.column_name;
          const type = getColumnType(col);
          
          return (
            <div key={colName} className="flex flex-col">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 capitalize">
                {colName.replace(/_/g, ' ')}
                {type === 'checkbox' ? '' : ' *'}
              </label>
              
              {type === 'checkbox' ? (
                <div className="flex items-center h-11">
                  <input
                    type="checkbox"
                    name={colName}
                    checked={!!formData[colName]}
                    onChange={handleChange}
                    className="w-6 h-6 rounded accent-blue-500 cursor-pointer"
                  />
                  <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">Enabled</span>
                </div>
              ) : (
                <input
                  type={type === 'date' ? 'datetime-local' : type}
                  name={colName}
                  placeholder={`Enter ${colName}...`}
                  value={formData[colName] || ''}
                  onChange={handleChange}
                  className="p-3 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition shadow-sm"
                  required={type !== 'checkbox'}
                />
              )}
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition shadow-md transform hover:scale-105 active:scale-95"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : buttonText}
        </button>
      </div>
    </form>
  );
}
