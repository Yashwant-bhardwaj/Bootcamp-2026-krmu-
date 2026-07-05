import { useState, useRef } from 'react';
import { Btn, Card, Toast, Badge } from '../components/UI';
import API from '../utils/api';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploads, setUploads] = useState([]);
  const [toast, setToast] = useState(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef();

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const r = await API.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploads(prev => [{ url: r.data.url, publicId: r.data.publicId, name: file.name, size: file.size }, ...prev]);
      setFile(null);
      showToast('File uploaded successfully');
    } catch (err) { showToast(err.response?.data?.message || 'Upload failed', 'danger'); }
    finally { setUploading(false); }
  };

  const remove = async (publicId) => {
    try {
      await API.delete(`/upload/${publicId}`);
      setUploads(prev => prev.filter(u => u.publicId !== publicId));
      showToast('File deleted');
    } catch { showToast('Delete failed', 'danger'); }
  };

  const onDrop = (e) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const fmt = (bytes) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  return (
    <div style={{ padding: '32px 28px', maxWidth: 680 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>File upload</h1>

      <Card style={{ marginBottom: 20 }}>
        {/* Drop zone */}
        <div
          onClick={() => inputRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          style={{
            border: `2px dashed ${drag ? 'var(--accent)' : 'var(--border-hover)'}`,
            borderRadius: 12, padding: '36px 20px', textAlign: 'center',
            background: drag ? 'var(--accent-bg)' : 'var(--bg3)',
            cursor: 'pointer', transition: 'all 0.2s', marginBottom: 16,
          }}>
          <input ref={inputRef} type="file" style={{ display: 'none' }} accept=".jpg,.jpeg,.png,.pdf"
            onChange={e => setFile(e.target.files[0])} />
          <div style={{ fontSize: 32, marginBottom: 8 }}>☁️</div>
          <div style={{ fontSize: 14, color: 'var(--text2)', fontWeight: 500 }}>
            {file ? file.name : 'Drop file here or click to browse'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>JPG, PNG, PDF — max 5 MB</div>
          {file && (
            <div style={{ marginTop: 10 }}>
              <Badge color="accent">{fmt(file.size)}</Badge>
            </div>
          )}
        </div>

        <Btn onClick={upload} loading={uploading} disabled={!file} style={{ width: '100%', padding: '11px' }}>
          Upload file
        </Btn>
      </Card>

      {uploads.length > 0 && (
        <Card>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Uploaded files ({uploads.length})</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {uploads.map((u, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)',
              }}>
                <div style={{ fontSize: 22 }}>{u.name.endsWith('.pdf') ? '📄' : '🖼️'}</div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{fmt(u.size)}</div>
                </div>
                <a href={u.url} target="_blank" rel="noreferrer"
                  style={{ fontSize: 12, color: 'var(--accent2)', padding: '5px 10px', background: 'var(--accent-bg)', borderRadius: 6, border: '1px solid var(--accent-border)' }}>
                  View
                </a>
                <Btn variant="danger" onClick={() => remove(u.publicId)} style={{ padding: '5px 10px', fontSize: 12 }}>Delete</Btn>
              </div>
            ))}
          </div>
        </Card>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
