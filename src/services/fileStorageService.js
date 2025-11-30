import api from './api';

/**
 * File Storage Service - API calls for file management
 */
export const fileStorageService = {
  
  // Upload file
  uploadFile: async (file, tenantId, userId, description = '', category = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/files/upload', formData, {
      params: { tenantId, userId, description, category },
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },

  // Download file
  downloadFile: async (fileId, userId) => {
    const response = await api.get(`/files/download/${fileId}`, {
      params: { userId },
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from Content-Disposition header
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'download';
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return response.data;
  },

  // Get all files for tenant
  getTenantFiles: async (tenantId) => {
    const response = await api.get(`/files/tenant/${tenantId}`);
    return response.data;
  },

  // Get files uploaded by user
  getUserFiles: async (userId) => {
    const response = await api.get(`/files/user/${userId}`);
    return response.data;
  },

  // Get files by category
  getFilesByCategory: async (tenantId, category) => {
    const response = await api.get(`/files/category/${tenantId}/${category}`);
    return response.data;
  },

  // Search files
  searchFiles: async (tenantId, keyword) => {
    const response = await api.get('/files/search', {
      params: { tenantId, keyword }
    });
    return response.data;
  },

  // Get recent files
  getRecentFiles: async (tenantId, limit = 10) => {
    const response = await api.get(`/files/recent/${tenantId}`, {
      params: { limit }
    });
    return response.data;
  },

  // Get file by ID
  getFileById: async (fileId) => {
    const response = await api.get(`/files/${fileId}`);
    return response.data;
  },

  // Update file metadata
  updateFileMetadata: async (fileId, description, category, tags) => {
    const response = await api.put(`/files/${fileId}/metadata`, null, {
      params: { description, category, tags }
    });
    return response.data;
  },

  // Share file with users
  shareFile: async (fileId, userIds) => {
    const response = await api.post(`/files/${fileId}/share`, userIds);
    return response.data;
  },

  // Delete file (soft delete)
  deleteFile: async (fileId, userId) => {
    const response = await api.delete(`/files/${fileId}`, {
      params: { userId }
    });
    return response.data;
  },

  // Permanently delete file
  permanentlyDeleteFile: async (fileId) => {
    const response = await api.delete(`/files/${fileId}/permanent`);
    return response.data;
  },

  // Restore deleted file
  restoreFile: async (fileId) => {
    const response = await api.put(`/files/${fileId}/restore`);
    return response.data;
  },

  // Get storage usage
  getStorageUsage: async (tenantId) => {
    const response = await api.get(`/files/storage/${tenantId}`);
    return response.data;
  }
};

export default fileStorageService;