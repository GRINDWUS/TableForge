export function exportToCSV(data, tableName) {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  try {
    // Get headers from first row
    const headers = Object.keys(data[0]);
    
    // Create CSV header line
    let csvContent = headers.map(h => `"${h}"`).join(',') + '\n';
    
    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        
        // Handle null/undefined
        if (value === null || value === undefined) {
          return '""';
        }
        
        // Handle strings with special characters
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        
        return `"${stringValue}"`;
      });
      csvContent += values.join(',') + '\n';
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `${tableName}-${timestamp}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    alert('Error exporting data: ' + error.message);
  }
}
