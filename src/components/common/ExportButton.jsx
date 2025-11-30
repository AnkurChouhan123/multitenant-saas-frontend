// src/components/common/ExportButton.jsx - NEW FILE

import React, { useState } from 'react';
import { exportToCSV, exportToExcel, exportToJSON, exportTableToPDF } from '../../utils/exportUtils';

/**
 * Export Button Component - Provides UI for export options
 */
const ExportButton = ({ data, filename = 'export', columns = null }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format) => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    setExporting(true);
    setShowMenu(false);

    try {
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
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setTimeout(() => setExporting(false), 500);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={exporting || !data || data.length === 0}
        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {exporting ? 'Exporting...' : 'Export'}
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
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 overflow-hidden border border-gray-200">
            <div className="py-1">
              <button
                onClick={() => handleExport('csv')}
                className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition text-left"
              >
                <span className="text-2xl mr-3">📊</span>
                <div className="flex-1">
                  <span className="block text-sm font-medium text-gray-900">Export as CSV</span>
                  <span className="block text-xs text-gray-500">Spreadsheet format</span>
                </div>
              </button>
              
              <button
                onClick={() => handleExport('excel')}
                className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition text-left"
              >
                <span className="text-2xl mr-3">📗</span>
                <div className="flex-1">
                  <span className="block text-sm font-medium text-gray-900">Export as Excel</span>
                  <span className="block text-xs text-gray-500">Microsoft Excel format</span>
                </div>
              </button>
              
              <button
                onClick={() => handleExport('json')}
                className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition text-left"
              >
                <span className="text-2xl mr-3">🔧</span>
                <div className="flex-1">
                  <span className="block text-sm font-medium text-gray-900">Export as JSON</span>
                  <span className="block text-xs text-gray-500">API-friendly format</span>
                </div>
              </button>
              
              <button
                onClick={() => handleExport('pdf')}
                className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition text-left"
              >
                <span className="text-2xl mr-3">📄</span>
                <div className="flex-1">
                  <span className="block text-sm font-medium text-gray-900">Export as PDF</span>
                  <span className="block text-xs text-gray-500">Print-ready format</span>
                </div>
              </button>
            </div>

            <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                {data && data.length > 0 
                  ? `${data.length} record${data.length !== 1 ? 's' : ''} will be exported`
                  : 'No data to export'
                }
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;

/**
 * Simple Export Link Component (alternative to button)
 */
export const ExportLink = ({ data, filename = 'export', format = 'csv', children }) => {
  const handleClick = (e) => {
    e.preventDefault();
    
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    switch (format) {
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
        exportToCSV(data, `${filename}.csv`);
    }
  };

  return (
    <a
      href="#"
      onClick={handleClick}
      className="text-primary-600 hover:text-primary-700 font-medium text-sm underline"
    >
      {children || `Export as ${format.toUpperCase()}`}
    </a>
  );
};

/**
 * Compact Export Button (icon only)
 */
export const CompactExportButton = ({ data, filename = 'export', onExportStart, onExportComplete }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = async (format) => {
    if (!data || data.length === 0) return;
    
    if (onExportStart) onExportStart();
    setShowMenu(false);

    try {
      switch (format) {
        case 'csv':
          exportToCSV(data, `${filename}.csv`);
          break;
        case 'excel':
          exportToExcel(data, `${filename}.xlsx`);
          break;
        case 'json':
          exportToJSON(data, `${filename}.json`);
          break;
        case 'pdf':
          exportTableToPDF(data, `${filename}.pdf`, filename);
          break;
      }
      if (onExportComplete) onExportComplete();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={!data || data.length === 0}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
        title="Export data"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl z-50 overflow-hidden border border-gray-200">
            <button onClick={() => handleExport('csv')} className="w-full px-4 py-2 hover:bg-gray-50 text-left text-sm">
              CSV
            </button>
            <button onClick={() => handleExport('excel')} className="w-full px-4 py-2 hover:bg-gray-50 text-left text-sm">
              Excel
            </button>
            <button onClick={() => handleExport('json')} className="w-full px-4 py-2 hover:bg-gray-50 text-left text-sm">
              JSON
            </button>
            <button onClick={() => handleExport('pdf')} className="w-full px-4 py-2 hover:bg-gray-50 text-left text-sm">
              PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
};