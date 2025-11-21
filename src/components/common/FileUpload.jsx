// src/components/common/FileUpload.jsx

import React, { useState, useRef } from 'react';

const FileUpload = ({ 
  onUpload, 
  accept = '*',
  maxSize = 5242880, // 5MB default
  maxFiles = 5,
  multiple = true,
  showPreview = true 
}) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const validateFile = (file) => {
    if (file.size > maxSize) {
      return { valid: false, error: `File size exceeds ${formatFileSize(maxSize)}` };
    }
    
    if (accept !== '*' && !accept.split(',').some(type => 
      file.type.match(type.trim()) || file.name.endsWith(type.trim())
    )) {
      return { valid: false, error: 'File type not allowed' };
    }
    
    return { valid: true };
  };

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).slice(0, maxFiles - files.length);
    
    const validatedFiles = newFiles.map(file => {
      const validation = validateFile(file);
      return {
        file,
        id: Math.random().toString(36),
        name: file.name,
        size: file.size,
        type: file.type,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        error: validation.error,
        valid: validation.valid
      };
    });

    setFiles(prev => [...prev, ...validatedFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = (id) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const uploadFiles = async () => {
    const validFiles = files.filter(f => f.valid);
    
    if (validFiles.length === 0) return;

    setUploading(true);
    
    for (const fileObj of validFiles) {
      try {
        setUploadProgress(prev => ({ ...prev, [fileObj.id]: 0 }));
        
        // Simulate upload progress
        const interval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [fileObj.id]: Math.min((prev[fileObj.id] || 0) + 10, 90)
          }));
        }, 200);

        // Call the upload handler
        await onUpload(fileObj.file, (progress) => {
          clearInterval(interval);
          setUploadProgress(prev => ({ ...prev, [fileObj.id]: progress }));
        });

        clearInterval(interval);
        setUploadProgress(prev => ({ ...prev, [fileObj.id]: 100 }));
        
      } catch (error) {
        console.error('Upload failed:', error);
        setFiles(prev => prev.map(f => 
          f.id === fileObj.id ? { ...f, error: 'Upload failed' } : f
        ));
      }
    }
    
    setUploading(false);
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    return '📎';
  };

  return (
    <div className="w-full">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
        `}
      >
        <div className="flex flex-col items-center">
          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-lg font-medium text-gray-700 mb-1">
            Drop files here or click to browse
          </p>
          <p className="text-sm text-gray-500">
            {accept === '*' ? 'Any file type' : accept} • Max {formatFileSize(maxSize)} • {maxFiles} files max
          </p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((fileObj) => (
            <div
              key={fileObj.id}
              className={`flex items-center p-4 rounded-lg border ${
                fileObj.error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
              }`}
            >
              {/* Preview or Icon */}
              <div className="flex-shrink-0 mr-4">
                {showPreview && fileObj.preview ? (
                  <img
                    src={fileObj.preview}
                    alt={fileObj.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded text-2xl">
                    {getFileIcon(fileObj.type)}
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {fileObj.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(fileObj.size)}
                </p>
                
                {/* Error Message */}
                {fileObj.error && (
                  <p className="text-xs text-red-600 mt-1">{fileObj.error}</p>
                )}

                {/* Progress Bar */}
                {uploading && fileObj.valid && uploadProgress[fileObj.id] !== undefined && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress[fileObj.id]}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {uploadProgress[fileObj.id]}% uploaded
                    </p>
                  </div>
                )}
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeFile(fileObj.id)}
                disabled={uploading}
                className="ml-4 text-red-500 hover:text-red-700 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {files.filter(f => f.valid).length > 0 && (
        <button
          onClick={uploadFiles}
          disabled={uploading}
          className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {uploading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </span>
          ) : (
            `Upload ${files.filter(f => f.valid).length} file(s)`
          )}
        </button>
      )}
    </div>
  );
};

export default FileUpload;