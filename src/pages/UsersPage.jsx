import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import userService from '../services/userService';
import BulkActions, { useBulkSelection } from '../components/common/BulkActions';
import { useDebounce, useLocalStorage } from '../hooks/customHooks';
import FileUpload from '../components/common/FileUpload';
import { FormInput, FormSelect, FormButton } from '../components/common/FormComponents';
import { quickExport } from '../utils/exportUtils';
import { ArrowLeft, Plus, Download, Upload, RefreshCw, Grid3x3, List, ChevronDown, Eye } from 'lucide-react';

/**
 * UsersPage with proper permissions:
 * - TENANT_OWNER, TENANT_ADMIN: Full management ✅
 * - USER: View only 👁️
 * - VIEWER: No access ❌
 */
const UsersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canManageUsers, setCanManageUsers] = useState(false);
  const [canViewUsers, setCanViewUsers] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useLocalStorage('userRoleFilter', 'all');
  const [sortBy, setSortBy] = useLocalStorage('userSortBy', 'name');
  const [sortOrder, setSortOrder] = useLocalStorage('userSortOrder', 'asc');
  const [viewMode, setViewMode] = useLocalStorage('userViewMode', 'grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  const { 
    selectedItems, 
    toggleSelection, 
    toggleSelectAll, 
    isSelected, 
    isAllSelected,
    clearSelection 
  } = useBulkSelection(filteredUsers);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'USER',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Check permissions
  useEffect(() => {
    const checkPermission = async () => {
      try {
        // Quick client-side check
        const allowedRoles = ['TENANT_OWNER', 'TENANT_ADMIN', 'USER'];
        if (!allowedRoles.includes(user?.role)) {
          setCanViewUsers(false);
          setCanManageUsers(false);
          setCheckingPermission(false);
          addToast('Access denied: You do not have permission to view users', 'error');
          setTimeout(() => navigate('/dashboard'), 2000);
          return;
        }

        // Backend verification
        const response = await userService.checkUserPermission(user.tenantId);
        setCanViewUsers(response.canView);
        setCanManageUsers(response.canManage);
        
        if (!response.canView) {
          addToast('Access denied: You cannot view the user list', 'error');
          setTimeout(() => navigate('/dashboard'), 2000);
        }
      } catch (error) {
        console.error('Permission check failed:', error);
        setCanViewUsers(false);
        setCanManageUsers(false);
        addToast('Access denied', 'error');
        setTimeout(() => navigate('/dashboard'), 2000);
      } finally {
        setCheckingPermission(false);
      }
    };

    if (user) {
      checkPermission();
    }
  }, [user, navigate, addToast]);

  useEffect(() => {
    if (canViewUsers && !checkingPermission) {
      fetchUsers();
    }
  }, [canViewUsers, checkingPermission]);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, debouncedSearch, roleFilter, sortBy, sortOrder]);

  const fetchUsers = async () => {
    try {
      setRefreshing(true);
      setLoading(true);
      const data = await userService.getUsersByTenant(user.tenantId);
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 403) {
        addToast('Access denied: You cannot view users', 'error');
        navigate('/dashboard');
      } else {
        addToast('Failed to load users', 'error');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterAndSortUsers = () => {
    let filtered = [...users];

    if (debouncedSearch) {
      filtered = filtered.filter(u => 
        u.firstName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        u.lastName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch(sortBy) {
        case 'name':
          aVal = `${a.firstName} ${a.lastName}`.toLowerCase();
          bVal = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case 'email':
          aVal = a.email.toLowerCase();
          bVal = b.email.toLowerCase();
          break;
        case 'role':
          aVal = a.role;
          bVal = b.role;
          break;
        case 'created':
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canManageUsers) {
      addToast('Access denied: Only admins can create users', 'error');
      return;
    }
    
    setError('');
    setSubmitting(true);
    
    try {
      await userService.createUser(formData, user.tenantId);
      addToast('User created successfully!', 'success');
      setShowModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'USER',
      });
      fetchUsers();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Failed to create user';
      setError(errorMsg);
      addToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!canManageUsers) {
      addToast('Access denied: Only admins can delete users', 'error');
      return;
    }
    
    if (!window.confirm(`Delete ${userName}?`)) return;
    
    try {
      await userService.deleteUser(userId);
      addToast('User deleted successfully!', 'success');
      fetchUsers();
    } catch (error) {
      if (error.response?.status === 403) {
        addToast('Access denied: You cannot delete this user', 'error');
      } else {
        addToast('Failed to delete user', 'error');
      }
    }
  };

  const handleBulkDelete = async (items) => {
    if (!canManageUsers) {
      addToast('Access denied: Only admins can delete users', 'error');
      return;
    }
    
    try {
      await Promise.all(items.map(item => userService.deleteUser(item.id)));
      addToast(`Deleted ${items.length} users`, 'success');
      clearSelection();
      fetchUsers();
    } catch (error) {
      addToast('Failed to delete users', 'error');
    }
  };

  const handleBulkExport = (items) => {
    const data = items.map(u => ({
      Name: `${u.firstName} ${u.lastName}`,
      Email: u.email,
      Role: u.role,
      Status: u.active ? 'Active' : 'Inactive',
      Created: new Date(u.createdAt).toLocaleDateString()
    }));
    
    quickExport(data, `users_bulk_export_${new Date().toISOString().split('T')[0]}`, 'csv');
    addToast(`Exported ${items.length} users`, 'success');
  };

  const handleExportUsers = (format) => {
    const exportData = filteredUsers.map(u => ({
      Name: `${u.firstName} ${u.lastName}`,
      Email: u.email,
      Role: u.role,
      Status: u.active ? 'Active' : 'Inactive',
      Created: new Date(u.createdAt).toLocaleDateString()
    }));

    const filename = `users_${new Date().toISOString().split('T')[0]}`;

    try {
      quickExport(exportData, filename, format);
      addToast(`Exported ${filteredUsers.length} users as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      addToast(`Failed to export as ${format.toUpperCase()}`, 'error');
    }
    
    setShowExportMenu(false);
  };

  const handleImportUsers = async (file, onProgress) => {
    if (!canManageUsers) {
      addToast('Access denied: Only admins can import users', 'error');
      return;
    }
    
    try {
      const text = await file.text();
      const rows = text.split('\n').slice(1);
      
      let imported = 0;
      for (let i = 0; i < rows.length; i++) {
        const [firstName, lastName, email, role] = rows[i].split(',');
        if (firstName && email) {
          try {
            await userService.createUser({
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              email: email.trim(),
              password: 'ChangeMe123!',
              role: role?.trim() || 'USER'
            }, user.tenantId);
            imported++;
          } catch (err) {
            console.error('Failed to import user:', email);
          }
        }
        onProgress(Math.round(((i + 1) / rows.length) * 100));
      }
      
      addToast(`Imported ${imported} users`, 'success');
      setShowImportModal(false);
      fetchUsers();
    } catch (error) {
      addToast('Import failed', 'error');
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      TENANT_ADMIN: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300',
      USER: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300',
      VIEWER: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
      SUPER_ADMIN: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300',
      TENANT_OWNER: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
    };
    return colors[role] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
  };

  // Show loading while checking permission
  if (checkingPermission) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <svg className="animate-spin h-16 w-16 text-purple-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-300">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Show access denied if no view permission
  if (!canViewUsers) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-6 mx-auto w-24 h-24 flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            You don't have permission to view the user list.
            <br />
            <span className="text-sm mt-2 block">Only admins and users can access this page.</span>
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <svg className="animate-spin h-16 w-16 text-purple-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-300">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Page Header */}
      <div className="px-3 sm:px-6 lg:px-8 py-6 sm:py-8 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition transform" />
            Back to Dashboard
          </button>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                  👥 User Management
                </h1>
                {!canManageUsers && (
                  <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs font-medium">
                    <Eye className="w-3 h-3" />
                    View Only
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                {filteredUsers.length} of {users.length} users
                {!canManageUsers && ' • You can view but not modify users'}
              </p>
            </div>
            
            {/* Action Buttons - Only show if user can manage */}
            {canManageUsers && (
              <div className="hidden sm:flex items-center gap-2 flex-wrap justify-end">
                <button
                  onClick={fetchUsers}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-900 dark:text-gray-100 font-semibold rounded-lg transition"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white font-semibold rounded-lg transition shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Export</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                      <button onClick={() => handleExportUsers('csv')} className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition">📄 CSV</button>
                      <button onClick={() => handleExportUsers('pdf')} className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition border-t border-gray-200 dark:border-gray-700">📕 PDF</button>
                      <button onClick={() => handleExportUsers('excel')} className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition border-t border-gray-200 dark:border-gray-700">📊 Excel</button>
                      <button onClick={() => handleExportUsers('json')} className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition border-t border-gray-200 dark:border-gray-700">{} JSON</button>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-yellow-600 dark:bg-yellow-700 hover:bg-yellow-700 dark:hover:bg-yellow-600 text-white font-semibold rounded-lg transition shadow-lg"
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Import</span>
                </button>
                
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-lg transition shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add User</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Warning banner for view-only users */}
        {!canManageUsers && (
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  You have view-only access
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  You can view all users in your organization, but only admins can create, edit, or delete users.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters & Controls - Continue with rest of your existing code but hide management buttons */}
        {/* ... Rest of your component code ... */}
        {/* Make sure to wrap delete buttons and bulk actions with canManageUsers check */}

        {/* Grid/List View - Replace delete buttons with conditional rendering */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredUsers.map((u) => (
              <div key={u.id} className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 overflow-hidden">
                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-3 mb-4">
                    {canManageUsers && (
                      <input
                        type="checkbox"
                        checked={isSelected(u)}
                        onChange={() => toggleSelection(u)}
                        className="mt-1 h-4 w-4 text-purple-600 dark:text-purple-400 rounded accent-purple-600 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                        {u.firstName[0]}{u.lastName[0]}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1 truncate">
                    {u.firstName} {u.lastName}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 truncate">
                    {u.email}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(u.role)}`}>
                      {u.role.replace('_', ' ')}
                    </span>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      u.active 
                        ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' 
                        : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
                    }`}>
                      {u.active ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Created: {new Date(u.createdAt).toLocaleDateString()}
                  </p>

                  {canManageUsers && u.id !== user.userId && (
                    <button
                      onClick={() => handleDelete(u.id, `${u.firstName} ${u.lastName}`)}
                      className="w-full px-4 py-2.5 text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800/50 rounded-lg transition"
                    >
                      🗑️ Delete User
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>List view with similar conditional rendering...</div>
        )}
      </main>

      {/* Bulk Actions - Only show if user can manage */}
      {canManageUsers && (
        <BulkActions
          selectedItems={selectedItems}
          onDelete={handleBulkDelete}
          onExport={handleBulkExport}
          onClearSelection={clearSelection}
        />
      )}

      {/* Modals - Only show if user can manage */}
      {canManageUsers && showModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          {/* Add User Modal content */}
        </div>
      )}
    </div>
  );
};

export default UsersPage;