import React from 'react';

export function GridComponent({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No data available
      </div>
    );
  }

  const columns = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto p-6 bg-white rounded">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-blue-100">
            {columns.map((col) => (
              <th
                key={col}
                className="border border-gray-300 p-3 text-left font-bold"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td
                  key={`${idx}-${col}`}
                  className="border border-gray-300 p-3"
                >
                  {row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
