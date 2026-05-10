// Module 03 · Blob Storage — custom hook for file upload/list/download/delete
import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

export function useFiles() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get('/api/files');
      setFiles(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  async function uploadFile(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const { data } = await api.post('/api/files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total)),
      });
      setFiles((prev) => [data, ...prev]);
      return data;
    } finally {
      setUploading(false);
    }
  }

  async function downloadFile(blobName) {
    const { data } = await api.get(`/api/files/${encodeURIComponent(blobName)}/download`);
    window.open(data.url, '_blank');
  }

  async function deleteFile(blobName) {
    await api.delete(`/api/files/${encodeURIComponent(blobName)}`);
    setFiles((prev) => prev.filter((f) => f.blobName !== blobName));
  }

  return { files, loading, uploading, error, refetch: fetchFiles, uploadFile, downloadFile, deleteFile };
}
