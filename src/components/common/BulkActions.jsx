// src/components/common/BulkActions.jsx

import React, { useState } from 'react';

const BulkActions = ({ 
  selectedItems, 
  onDelete, 
  onExport, 
  onArchive,
  onChangeStatus,
  customActions = [],
  onClearSelection
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  if (selectedItems.length === 0) return null;

  const handleAction = async (actionFn, actionName) => {
    if (!window.confirm(`Are you sure you want to ${actionName} ${selectedItems.length} item(s)?`)) {
      return;
    }

    setLoading(true);
    try {
      await actionFn(selectedItems);
      onClearSelection();
    } catch (error) {
      console.error(`Failed to ${actionName}:`, error);
      alert(`Failed to ${actionName} items`);
    } finally {
      setLoading(false);
      setShowMenu(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center divide-x divide-gray-200">
          {/* Selection Info */}
          <div className="px-4 py-3 bg-blue-50">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-blue-900">
                {selectedItems.length} selected
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center px-2">
            {onExport && (
              <button
                onClick={() => handleAction(onExport, 'export')}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded transition disabled:opacity-50"
                title="Export selected"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            )}

            {onArchive && (
              <button
                onClick={() => handleAction(onArchive, 'archive')}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded transition disabled:opacity-50"
                title="Archive selected"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => handleAction(onDelete, 'delete')}
                disabled={loading}
                className="p-2 hover:bg-red-50 rounded transition disabled:opacity-50"
                title="Delete selected"
              >
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}

            {/* More Actions Dropdown */}
            {(customActions.length > 0 || onChangeStatus) && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  disabled={loading}
                  className="p-2 hover:bg-gray-100 rounded transition disabled:opacity-50"
                  title="More actions"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>

                {showMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-xl z-50 overflow-hidden border border-gray-200">
                      {onChangeStatus && (
                        <>
                          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                            Change Status
                          </div>
                          <button
                            onClick={() => handleAction(() => onChangeStatus('active'), 'activate')}
                            className="w-full flex items-center px-4 py-2 hover:bg-gray-50 transition text-left"
                          >
                            <span className="text-green-500 mr-3">●</span>
                            <span className="text-sm text-gray-700">Set Active</span>
                          </button>
                          <button
                            onClick={() => handleAction(() => onChangeStatus('inactive'), 'deactivate')}
                            className="w-full flex items-center px-4 py-2 hover:bg-gray-50 transition text-left"
                          >
                            <span className="text-red-500 mr-3">●</span>
                            <span className="text-sm text-gray-700">Set Inactive</span>
                          </button>
                        </>
                      )}

                      {customActions.length > 0 && (
                        <>
                          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase bg-gray-50 border-t border-gray-200">
                            Custom Actions
                          </div>
                          {customActions.map((action, index) => (
                            <button
                              key={index}
                              onClick={() => handleAction(action.handler, action.name)}
                              className="w-full flex items-center px-4 py-2 hover:bg-gray-50 transition text-left"
                            >
                              {action.icon && (
                                <span className="mr-3">{action.icon}</span>
                              )}
                              <span className="text-sm text-gray-700">{action.label}</span>
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Clear Selection */}
          <div className="px-2">
            <button
              onClick={onClearSelection}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded transition disabled:opacity-50"
              title="Clear selection"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="h-1 bg-blue-600 animate-pulse"></div>
        )}
      </div>
    </div>
  );
};

// Hook for managing bulk selection
export const useBulkSelection = (items) => {
  const [selectedItems, setSelectedItems] = useState([]);

  const toggleSelection = (item) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(i => i.id === item.id);
      if (isSelected) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items);
    }
  };

  const isSelected = (item) => {
    return selectedItems.some(i => i.id === item.id);
  };

  const isAllSelected = () => {
    return items.length > 0 && selectedItems.length === items.length;
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  return {
    selectedItems,
    toggleSelection,
    toggleSelectAll,
    isSelected,
    isAllSelected,
    clearSelection,
  };
};

// Example usage:
/*
import BulkActions, { useBulkSelection } from '../components/common/BulkActions';

const MyPage = () => {
  const { 
    selectedItems, 
    toggleSelection, 
    toggleSelectAll, 
    isSelected, 
    isAllSelected,
    clearSelection 
  } = useBulkSelection(users);

  const handleBulkDelete = async (items) => {
    await Promise.all(items.map(item => deleteUser(item.id)));
    fetchUsers();
  };

  const handleBulkExport = async (items) => {
    exportToCSV(items, 'users.csv');
  };

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={isAllSelected()}
                onChange={toggleSelectAll}
              />
            </th>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>
                <input
                  type="checkbox"
                  checked={isSelected(user)}
                  onChange={() => toggleSelection(user)}
                />
              </td>
              <td>{user.name}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <BulkActions
        selectedItems={selectedItems}
        onDelete={handleBulkDelete}
        onExport={handleBulkExport}
        onClearSelection={clearSelection}
        customActions={[
          {
            label: 'Send Email',
            icon: '📧',
            name: 'email',
            handler: async (items) => {
              // Custom action
            }
          }
        ]}
      />
    </>
  );
};
*/

export default BulkActions;