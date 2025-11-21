// src/utils/exportUtils.js

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
 * Export Component - Provides UI for export options
 */
import React, { useState } from 'react';

export const ExportButton = ({ data, filename = 'export', columns = null }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = (format) => {
    switch (format) {
      case 'csv':
        exportToCSV(data, `${filename}.csv`, columns);
        break;
      case 'excel':
        exportToExcel(data, `${filename}.xlsx`, columns);
        break;
      case 'json':
        exportToJSON(data, `${filename}.json`);
        break;
      case 'pdf':
        exportTableToPDF(data, `${filename}.pdf`, filename);
        break;
      default:
        console.warn('Unknown export format');
    }
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
      >
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export
        <svg className={`w-4 h-4 ml-2 transition-transform ${showMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 overflow-hidden">
            <button
              onClick={() => handleExport('csv')}
              className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition"
            >
              <span className="text-2xl mr-3">📊</span>
              <span className="text-gray-900">Export as CSV</span>
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition"
            >
              <span className="text-2xl mr-3">📗</span>
              <span className="text-gray-900">Export as Excel</span>
            </button>
            <button
              onClick={() => handleExport('json')}
              className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition"
            >
              <span className="text-2xl mr-3">🔧</span>
              <span className="text-gray-900">Export as JSON</span>
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition"
            >
              <span className="text-2xl mr-3">📄</span>
              <span className="text-gray-900">Export as PDF</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};