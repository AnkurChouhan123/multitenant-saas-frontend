import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import userService from '../services/userService';
import BulkActions, { useBulkSelection } from '../components/common/BulkActions';
import ExportButton from '../components/common/ExportButton';
import { useDebounce, useLocalStorage } from '../hooks/customHooks';
import FileUpload from '../components/common/FileUpload';
import { FormInput, FormSelect, FormButton } from '../components/common/FormComponents';
import { exportToCSV, exportTableToPDF, exportToExcel, exportToJSON, quickExport } from '../utils/exportUtils';
import { ArrowLeft, Plus, Download, Upload, RefreshCw, Grid3x3, List, ChevronDown } from 'lucide-react';

const UsersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchUsers();
  }, []);

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
      addToast('Failed to load users', 'error');
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
      const errorMsg = err.response?.data?.message || 'Failed to create user';
      setError(errorMsg);
      addToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Delete ${userName}?`)) return;
    
    try {
      await userService.deleteUser(userId);
      addToast('User deleted successfully!', 'success');
      fetchUsers();
    } catch (error) {
      addToast('Failed to delete user', 'error');
    }
  };

  const handleBulkDelete = async (items) => {
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

  const handleBulkChangeStatus = async (status) => {
    try {
      await Promise.all(
        selectedItems.map(item => 
          userService.updateUser(item.id, { ...item, active: status === 'active' })
        )
      );
      addToast(`Updated ${selectedItems.length} users`, 'success');
      clearSelection();
      fetchUsers();
    } catch (error) {
      addToast('Failed to update users', 'error');
    }
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
      SUPER_ADMIN: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
    };
    return colors[role] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <div className="text-center">
          <svg className="animate-spin h-16 w-16 text-purple-500 dark:text-purple-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-300">Loading users...</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Please wait while we fetch your data</p>
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
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                👥 User Management
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                {filteredUsers.length} of {users.length} users
              </p>
            </div>
            
            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex items-center gap-2 flex-wrap justify-end">
              <button
                onClick={fetchUsers}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-900 dark:text-gray-100 font-semibold rounded-lg transition"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              {/* Export Dropdown */}
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
                    <button
                      onClick={() => handleExportUsers('csv')}
                      className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition"
                    >
                      📄 CSV
                    </button>
                    <button
                      onClick={() => handleExportUsers('pdf')}
                      className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition border-t border-gray-200 dark:border-gray-700"
                    >
                      📕 PDF
                    </button>
                    <button
                      onClick={() => handleExportUsers('excel')}
                      className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition border-t border-gray-200 dark:border-gray-700"
                    >
                      📊 Excel
                    </button>
                    <button
                      onClick={() => handleExportUsers('json')}
                      className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition border-t border-gray-200 dark:border-gray-700"
                    >
                      {} JSON
                    </button>
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

            {/* Mobile Action Buttons */}
            <div className="sm:hidden flex items-center gap-2 w-full justify-end">
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="p-2.5 bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white rounded-lg transition"
                  title="Export"
                >
                  <Download className="w-5 h-5" />
                </button>
                
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                    <button
                      onClick={() => handleExportUsers('csv')}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition"
                    >
                      📄 CSV
                    </button>
                    <button
                      onClick={() => handleExportUsers('pdf')}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition border-t border-gray-200 dark:border-gray-700"
                    >
                      📕 PDF
                    </button>
                    <button
                      onClick={() => handleExportUsers('excel')}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition border-t border-gray-200 dark:border-gray-700"
                    >
                      📊 Excel
                    </button>
                    <button
                      onClick={() => handleExportUsers('json')}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition border-t border-gray-200 dark:border-gray-700"
                    >
                      {} JSON
                    </button>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setShowImportModal(true)}
                className="p-2.5 bg-yellow-600 dark:bg-yellow-700 hover:bg-yellow-700 dark:hover:bg-yellow-600 text-white rounded-lg transition"
                title="Import"
              >
                <Upload className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowModal(true)}
                className="p-2.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg transition"
                title="Add User"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Filters & Controls */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl sm:rounded-2xl shadow-lg mb-6 overflow-hidden">
          {/* Desktop Filters */}
          <div className="hidden md:block p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="col-span-1 lg:col-span-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition"
              />

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
              >
                <option value="all">All Roles</option>
                <option value="TENANT_ADMIN">Admins</option>
                <option value="USER">Users</option>
                <option value="VIEWER">Viewers</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
              >
                <option value="name">Sort by Name</option>
                <option value="email">Sort by Email</option>
                <option value="role">Sort by Role</option>
                <option value="created">Sort by Date</option>
              </select>

              {/* Sort Order */}
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition font-semibold"
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'} Sort
              </button>

              {/* View Mode */}
              <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                  className={`flex-1 p-2.5 transition ${viewMode === 'grid' ? 'bg-purple-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                >
                  <Grid3x3 className="w-5 h-5 mx-auto" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  title="List View"
                  className={`flex-1 p-2.5 transition ${viewMode === 'list' ? 'bg-purple-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                >
                  <List className="w-5 h-5 mx-auto" />
                </button>
              </div>
            </div>

            {/* Select All - Desktop */}
            {filteredUsers.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center">
                <input
                  type="checkbox"
                  checked={isAllSelected()}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 text-purple-600 dark:text-purple-400 rounded accent-purple-600"
                />
                <label className="ml-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Select All ({filteredUsers.length})
                </label>
              </div>
            )}
          </div>

          {/* Mobile Filters */}
          <div className="md:hidden p-4">
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg font-semibold flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-600 transition"
            >
              <span>🔍 Filters & Sort</span>
              <span className={`transition transform ${mobileFiltersOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {mobileFiltersOpen && (
              <div className="mt-3 space-y-3">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition"
                />

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                >
                  <option value="all">All Roles</option>
                  <option value="TENANT_ADMIN">Admins</option>
                  <option value="USER">Users</option>
                  <option value="VIEWER">Viewers</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
                >
                  <option value="name">Sort by Name</option>
                  <option value="email">Sort by Email</option>
                  <option value="role">Sort by Role</option>
                  <option value="created">Sort by Date</option>
                </select>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition font-semibold"
                  >
                    {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
                  </button>
                  <button
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition font-semibold"
                  >
                    {viewMode === 'grid' ? '📋 List' : '📊 Grid'}
                  </button>
                </div>

                {/* Select All - Mobile */}
                {filteredUsers.length > 0 && (
                  <div className="flex items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                    <input
                      type="checkbox"
                      checked={isAllSelected()}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-purple-600 dark:text-purple-400 rounded accent-purple-600"
                    />
                    <label className="ml-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Select All ({filteredUsers.length})
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Users Display */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-5xl sm:text-6xl mb-4">👥</div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">No users found</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || roleFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Get started by adding your first team member'}
            </p>
            {!searchQuery && roleFilter === 'all' && (
              <button
                onClick={() => setShowModal(true)}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-semibold transition transform hover:scale-105 active:scale-95 inline-flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Your First User
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredUsers.map((u) => (
              <div key={u.id} className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 overflow-hidden">
                <div className="p-5 sm:p-6">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <input
                      type="checkbox"
                      checked={isSelected(u)}
                      onChange={() => toggleSelection(u)}
                      className="mt-1 h-4 w-4 text-purple-600 dark:text-purple-400 rounded accent-purple-600 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                        {u.firstName[0]}{u.lastName[0]}
                      </div>
                    </div>
                  </div>

                  {/* Name & Email */}
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1 truncate">
                    {u.firstName} {u.lastName}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 truncate">
                    {u.email}
                  </p>

                  {/* Badges */}
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

                  {/* Date */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Created: {new Date(u.createdAt).toLocaleDateString()}
                  </p>

                  {/* Delete Button */}
                  {u.id !== user.userId && (
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
          // List View - Desktop Table
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700/50">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700/50">
                  <tr>
                    <th className="px-4 sm:px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={isAllSelected()}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 text-purple-600 dark:text-purple-400 rounded accent-purple-600"
                      />
                    </th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="hidden md:table-cell px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="hidden lg:table-cell px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700/50">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                      <td className="px-4 sm:px-6 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected(u)}
                          onChange={() => toggleSelection(u)}
                          className="h-4 w-4 text-purple-600 dark:text-purple-400 rounded accent-purple-600"
                        />
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {u.firstName[0]}{u.lastName[0]}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">{u.firstName} {u.lastName}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 md:hidden truncate">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden md:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600 dark:text-gray-400">{u.email}</td>
                      <td className="hidden lg:table-cell px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(u.role)}`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1 ${
                          u.active 
                            ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' 
                            : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
                        }`}>
                          {u.active ? '✓ Active' : '✗ Inactive'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        {u.id !== user.userId && (
                          <button
                            onClick={() => handleDelete(u.id, `${u.firstName} ${u.lastName}`)}
                            className="text-xs sm:text-sm text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 font-semibold transition"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Bulk Actions Bar */}
      <BulkActions
        selectedItems={selectedItems}
        onDelete={handleBulkDelete}
        onExport={handleBulkExport}
        onChangeStatus={handleBulkChangeStatus}
        onClearSelection={clearSelection}
      />

      {/* Add User Modal */}
      {showModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 backdrop-blur-sm">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)}></div>
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl z-50 max-w-md w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New User</h2>
              {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 font-semibold">{error}</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4 dark:text-zinc-900">
                <FormInput
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                <FormInput
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
                <FormInput
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <FormInput
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  helperText="Minimum 6 characters"
                />
                <FormSelect
                  label="Role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  options={[
                    { value: 'USER', label: 'User' },
                    { value: 'TENANT_ADMIN', label: 'Admin' },
                    { value: 'VIEWER', label: 'Viewer' }
                  ]}
                />
                <div className="flex justify-end gap-3 pt-6">
                  <FormButton
                    type="button"
                    variant="secondary"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2"
                  >
                    Cancel
                  </FormButton>
                  <FormButton
                    type="submit"
                    variant="primary"
                    loading={submitting}
                    className="px-6 py-2"
                  >
                    Create User
                  </FormButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 backdrop-blur-sm">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowImportModal(false)}></div>
            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl z-50 max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Import Users from CSV</h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-6">
                Upload a CSV file with columns: firstName, lastName, email, role
              </p>
              <FileUpload
                accept=".csv"
                maxSize={5242880}
                maxFiles={1}
                multiple={false}
                onUpload={handleImportUsers}
              />
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;