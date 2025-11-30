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
import { ThemeToggle } from '../context/ThemeContext';
import { exportToCSV } from '../utils/exportUtils';

const UsersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useLocalStorage('userRoleFilter', 'all');
  const [sortBy, setSortBy] = useLocalStorage('userSortBy', 'name');
  const [sortOrder, setSortOrder] = useLocalStorage('userSortOrder', 'asc');
  const [viewMode, setViewMode] = useLocalStorage('userViewMode', 'grid');
  
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

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, debouncedSearch, roleFilter, sortBy, sortOrder]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsersByTenant(user.tenantId);
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      addToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
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
    
    exportToCSV(data, `users_bulk_export_${new Date().toISOString().split('T')[0]}.csv`);
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
      fetchUsers();
    } catch (error) {
      addToast('Failed to update users', 'error');
    }
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

  const exportData = filteredUsers.map(u => ({
    Name: `${u.firstName} ${u.lastName}`,
    Email: u.email,
    Role: u.role,
    Status: u.active ? 'Active' : 'Inactive',
    Created: new Date(u.createdAt).toLocaleDateString()
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-primary-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-2 flex items-center transition"
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {filteredUsers.length} of {users.length} users
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              
              <ExportButton 
                data={exportData}
                filename="users"
              />
              
              <button
                onClick={() => setShowImportModal(true)}
                className="px-4 py-2 bg-yellow-600 dark:bg-yellow-700 text-white rounded-lg hover:bg-yellow-700 dark:hover:bg-yellow-600 transition flex items-center shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Import
              </button>
              
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 transition flex items-center shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add User
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Filters & Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
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
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="role">Role</option>
              <option value="created">Created Date</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>

            {/* View Mode */}
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 transition ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 transition ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'}`}
              >
                List
              </button>
            </div>

            <button
              onClick={fetchUsers}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition"
            >
              🔄
            </button>
          </div>

          {/* Bulk Select All */}
          {filteredUsers.length > 0 && (
            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                checked={isAllSelected()}
                onChange={toggleSelectAll}
                className="h-4 w-4 text-primary-600 rounded"
              />
              <label className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                Select All ({filteredUsers.length})
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Users Display */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {filteredUsers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchQuery || roleFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Get started by adding your first team member'}
            </p>
            {!searchQuery && roleFilter === 'all' && (
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 transition"
              >
                + Add Your First User
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredUsers.map((u) => (
              <div key={u.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="p-6">
                  <div className="flex items-start mb-4">
                    <input
                      type="checkbox"
                      checked={isSelected(u)}
                      onChange={() => toggleSelection(u)}
                      className="mt-1 mr-3 h-4 w-4 text-primary-600 rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white text-lg font-bold">
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <div className="ml-3 flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {u.firstName} {u.lastName}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(u.role)}`}>
                      {u.role.replace('_', ' ')}
                    </span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      u.active 
                        ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' 
                        : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
                    }`}>
                      {u.active ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </div>

                  {u.id !== user.userId && (
                    <button
                      onClick={() => handleDelete(u.id, `${u.firstName} ${u.lastName}`)}
                      className="w-full px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={isAllSelected()}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-primary-600 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected(u)}
                        onChange={() => toggleSelection(u)}
                        className="h-4 w-4 text-primary-600 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center text-white font-bold mr-3">
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{u.firstName} {u.lastName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(u.role)}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        u.active 
                          ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' 
                          : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
                      }`}>
                        {u.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {u.id !== user.userId && (
                        <button
                          onClick={() => handleDelete(u.id, `${u.firstName} ${u.lastName}`)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition font-medium"
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
        <div className="fixed z-50 text-zinc-700 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)}></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg z-50 max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add New User</h2>
              {error && (
                <div className="mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="flex justify-end space-x-2 pt-4">
                  <FormButton
                    type="button"
                    variant="secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </FormButton>
                  <FormButton
                    type="submit"
                    variant="primary"
                    loading={submitting}
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
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowImportModal(false)}></div>
            <div className="bg-white dark:bg-gray-800 rounded-lg z-50 max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Import Users from CSV</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Upload a CSV file with columns: firstName, lastName, email, role
              </p>
              <FileUpload
                accept=".csv"
                maxSize={5242880}
                maxFiles={1}
                multiple={false}
                onUpload={handleImportUsers}
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition"
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