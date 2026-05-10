// Module 03 · Azure Blob Storage — File upload and management page
import { useRef, useState } from 'react';
import { useFiles } from '../hooks/useFiles';

function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FilesPage() {
  const { files, loading, uploading, error, uploadFile, downloadFile, deleteFile } = useFiles();
  const [progress, setProgress] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  async function handleFiles(fileList) {
    const file = fileList[0];
    if (!file) return;
    setProgress(0);
    try {
      await uploadFile(file, setProgress);
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed');
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Files</h1>
        <p className="text-sm text-gray-500">Module 03 · Stored in Azure Blob Storage</p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current.click()}
        className={`card border-2 border-dashed cursor-pointer text-center py-12 transition-colors ${
          dragOver ? 'border-azure-500 bg-azure-50' : 'border-gray-200 hover:border-azure-300 hover:bg-gray-50'
        }`}
      >
        <p className="text-4xl mb-3">☁️</p>
        <p className="text-gray-600 text-sm font-medium">Drop a file here or click to upload</p>
        <p className="text-gray-400 text-xs mt-1">Max 50 MB · any file type</p>
        <input ref={inputRef} type="file" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </div>

      {/* Upload progress */}
      {uploading && progress !== null && (
        <div className="card">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Uploading to Blob Storage…</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-azure-500 transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>
      )}

      {/* File table */}
      {loading ? (
        <div className="card animate-pulse space-y-3">
          {[1,2,3].map((i) => <div key={i} className="h-10 bg-gray-100 rounded"/>)}
        </div>
      ) : files.length === 0 ? (
        <div className="card text-center text-gray-400 py-12">
          <p className="text-3xl mb-3">📂</p>
          <p>No files uploaded yet.</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600 hidden sm:table-cell">Type</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600 hidden md:table-cell">Size</th>
                <th className="text-left px-5 py-3 font-medium text-gray-600 hidden lg:table-cell">Modified</th>
                <th className="px-5 py-3"/>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.blobName} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900 truncate max-w-[180px]">{file.fileName}</td>
                  <td className="px-5 py-3 text-gray-500 hidden sm:table-cell">
                    <span className="badge bg-gray-100 text-gray-600">{file.contentType?.split('/')[1] || '—'}</span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 hidden md:table-cell">{formatBytes(file.size)}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs hidden lg:table-cell">
                    {file.lastModified ? new Date(file.lastModified).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => downloadFile(file.blobName)} className="btn-secondary text-xs py-1">Download</button>
                      <button onClick={() => deleteFile(file.blobName)} className="text-xs text-red-500 hover:text-red-700 px-2">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
