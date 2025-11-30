import React, { useState, useEffect } from 'react';
import { 
  Upload, File, Download, Trash2, Share2, Search, 
  FolderOpen, Image, FileText, Film, Music, Archive,
  MoreVertical, Eye, Edit2, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fileStorageService } from '../services/fileStorageService';

const FileManagerPage = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [storageUsage, setStorageUsage] = useState({ totalStorageMB: 0 });

  useEffect(() => {
    if (user?.tenantId) {
      fetchFiles();
      fetchStorageUsage();
    }
  }, [user, selectedCategory]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const data = selectedCategory === 'all'
        ? await fileStorageService.getTenantFiles(user.tenantId)
        : await fileStorageService.getFilesByCategory(user.tenantId, selectedCategory);
      setFiles(data);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStorageUsage = async () => {
    try {
      const data = await fileStorageService.getStorageUsage(user.tenantId);
      setStorageUsage(data);
    } catch (error) {
      console.error('Failed to fetch storage usage:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      await fileStorageService.uploadFile(
        file, 
        user.tenantId, 
        user.userId,
        '', // description
        selectedCategory === 'all' ? 'general' : selectedCategory
      );
      fetchFiles();
      fetchStorageUsage();
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Failed to upload file: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fileId) => {
    try {
      await fileStorageService.downloadFile(fileId, user.userId);
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  const handleDelete = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await fileStorageService.deleteFile(fileId, user.userId);
      fetchFiles();
      fetchStorageUsage();
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchFiles();
      return;
    }

    try {
      const data = await fileStorageService.searchFiles(user.tenantId, searchQuery);
      setFiles(data);
    } catch (error) {
      console.error('Failed to search files:', error);
    }
  };

  const getFileIcon = (fileExtension, category) => {
    const ext = fileExtension?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) {
      return <Image className="text-blue-500" size={20} />;
    }
    if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext)) {
      return <FileText className="text-red-500" size={20} />;
    }
    if (['mp4', 'avi', 'mov', 'mkv'].includes(ext)) {
      return <Film className="text-purple-500" size={20} />;
    }
    if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) {
      return <Music className="text-green-500" size={20} />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
      return <Archive className="text-orange-500" size={20} />;
    }
    
    return <File className="text-gray-500" size={20} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const categories = [
    { id: 'all', label: 'All Files', icon: FolderOpen },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'images', label: 'Images', icon: Image },
    { id: 'videos', label: 'Videos', icon: Film },
    { id: 'audio', label: 'Audio', icon: Music }
  ];

  const filteredFiles = files.filter(file =>
    file.originalFilename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">File Manager</h1>
          <p className="text-gray-600">
            Upload, organize, and manage your files
          </p>
        </div>

        {/* Storage Usage */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Storage Usage</h3>
            <span className="text-sm text-gray-600">
              {storageUsage.totalStorageMB.toFixed(2)} MB / 10 GB
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${Math.min((storageUsage.totalStorageMB / 10240) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={18} />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Upload Button */}
            <label className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
              {uploading ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Upload File
                </>
              )}
              <input
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>

            <button
              onClick={fetchFiles}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* Files Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FolderOpen size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No files found</h3>
            <p className="text-gray-600">Upload your first file to get started</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.fileExtension, file.category)}
                          <div>
                            <div className="font-medium text-gray-900">{file.originalFilename}</div>
                            {file.description && (
                              <div className="text-sm text-gray-500">{file.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatFileSize(file.fileSize)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          {file.fileExtension?.toUpperCase() || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(file.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownload(file.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileManagerPage;