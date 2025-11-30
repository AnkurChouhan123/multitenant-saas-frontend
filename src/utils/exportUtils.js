// src/utils/exportUtils.js - FIXED VERSION (Pure Utilities Only)

/**
 * Export data to CSV format
 */
export const exportToCSV = (data, filename = 'export.csv', columns = null) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Determine columns
  const cols = columns || Object.keys(data[0]);
  
  // Create CSV content
  const headers = cols.join(',');
  const rows = data.map(row => 
    cols.map(col => {
      const value = row[col];
      // Handle values with commas, quotes, or newlines
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',')
  ).join('\n');

  const csv = `${headers}\n${rows}`;

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
};

/**
 * Export data to Excel format (using CSV as base)
 */
export const exportToExcel = (data, filename = 'export.xlsx', columns = null) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // For now, we'll use CSV format with .xlsx extension
  // In a real app, you'd use libraries like xlsx or exceljs
  const cols = columns || Object.keys(data[0]);
  
  const headers = cols.join('\t');
  const rows = data.map(row => 
    cols.map(col => row[col] ?? '').join('\t')
  ).join('\n');

  const tsv = `${headers}\n${rows}`;
  
  const blob = new Blob([tsv], { type: 'application/vnd.ms-excel' });
  downloadBlob(blob, filename);
};

/**
 * Export data to JSON format
 */
export const exportToJSON = (data, filename = 'export.json') => {
  if (!data) {
    console.warn('No data to export');
    return;
  }

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, filename);
};

/**
 * Export table to PDF (basic HTML to PDF)
 */
export const exportTableToPDF = (data, filename = 'export.pdf', title = 'Data Export') => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const columns = Object.keys(data[0]);
  
  // Create HTML table
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
        }
        h1 {
          color: #333;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background-color: #667eea;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: bold;
        }
        td {
          padding: 10px;
          border-bottom: 1px solid #ddd;
        }
        tr:hover {
          background-color: #f5f5f5;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      <table>
        <thead>
          <tr>
            ${columns.map(col => `<th>${col}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${columns.map(col => `<td>${row[col] ?? ''}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        <p>Total Records: ${data.length}</p>
      </div>
    </body>
    </html>
  `;

  // Open print dialog (user can save as PDF)
  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
};

/**
 * Helper function to download blob
 */
const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

/**
 * Quick export function - exports to CSV by default
 */
export const quickExport = (data, filename = 'export', format = 'csv') => {
  switch (format.toLowerCase()) {
    case 'csv':
      exportToCSV(data, `${filename}.csv`);
      break;
    case 'excel':
    case 'xlsx':
      exportToExcel(data, `${filename}.xlsx`);
      break;
    case 'json':
      exportToJSON(data, `${filename}.json`);
      break;
    case 'pdf':
      exportTableToPDF(data, `${filename}.pdf`, filename);
      break;
    default:
      console.warn('Unknown format, defaulting to CSV');
      exportToCSV(data, `${filename}.csv`);
  }
};

/**
 * Format data for export (handles nested objects)
 */
export const formatDataForExport = (data) => {
  return data.map(item => {
    const formatted = {};
    for (const key in item) {
      if (typeof item[key] === 'object' && item[key] !== null) {
        formatted[key] = JSON.stringify(item[key]);
      } else {
        formatted[key] = item[key];
      }
    }
    return formatted;
  });
};

/**
 * Export with progress callback
 */
export const exportWithProgress = async (data, filename, format, onProgress) => {
  const totalRows = data.length;
  const chunkSize = 100;
  let processedRows = 0;

  const chunks = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }

  for (const chunk of chunks) {
    processedRows += chunk.length;
    if (onProgress) {
      onProgress(Math.round((processedRows / totalRows) * 100));
    }
    // Small delay to allow UI to update
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  // Now do the actual export
  quickExport(data, filename, format);
  
  if (onProgress) {
    onProgress(100);
  }
};