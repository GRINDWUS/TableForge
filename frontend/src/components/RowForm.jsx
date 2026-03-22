import React, { useState } from 'react';

export function RowForm({ columns, onSubmit, buttonText = 'Add Row' }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      className="p-4 bg-white border rounded mb-4 shadow"
    >
      <h3 className="text-lg font-bold mb-4 text-gray-800">{buttonText}</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        {columns.map(col => (
          <input
            key={col}
            type="text"
            name={col}
            placeholder={col}
            value={formData[col] || ''}
            onChange={handleChange}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        ))}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
      >
        {loading ? 'Adding...' : buttonText}
      </button>
    </form>
  );
}
