import { useState, useEffect } from 'react';
import { Btn, Card, Badge, Toast, Avatar, StatCard } from '../components/UI';
import API from '../utils/api';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    Promise.all([
      API.get('/admin/users'),
      API.get('/admin/analytics'),
    ]).then(([u, a]) => {
      setUsers(u.data.users);
      setAnalytics(a.data.analytics);
    }).catch(() => showToast('Admin access required', 'danger'))
      .finally(() => setLoading(false));
  }, []);

  const ban = async (id, isActive) => {
    try {
      await API.put(`/admin/users/${id}/ban`);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: !u.isActive } : u));
      showToast(isActive ? 'User banned' : 'User unbanned');
    } catch { showToast('Action failed', 'danger'); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await API.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
      showToast('User deleted');
    } catch { showToast('Delete failed', 'danger'); }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{ padding: 40, color: 'var(--text2)' }}>Loading...</div>;

  return (
    <div style={{ padding: '32px 28px', maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Admin dashboard</h1>
        <Badge color="danger">Admin only</Badge>
      </div>

      {/* Analytics */}
      {analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
          <StatCard label="Total users" value={analytics.totalUsers} icon="👥" />
          <StatCard label="Active users" value={analytics.activeUsers} icon="✅" />
          <StatCard label="Revenue" value={`$${(analytics.totalRevenue / 100).toFixed(2)}`} icon="💰" />
          <StatCard label="Messages" value={analytics.totalMessages} icon="💬" />
        </div>
      )}

      {/* Users table */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600 }}>All users ({filtered.length})</h2>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name or email..." style={{ width: 220, padding: '7px 12px', fontSize: 13 }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(u => (
            <div key={u._id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
              background: 'var(--bg3)', borderRadius: 10, border: '1px solid var(--border)',
            }}>
              <Avatar name={u.name} size={34} src={u.avatar} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{u.email}</div>
              </div>
              <Badge color={u.role === 'admin' ? 'danger' : 'accent'}>{u.role}</Badge>
              <Badge color={u.isActive ? 'success' : 'danger'}>{u.isActive ? 'active' : 'banned'}</Badge>
              <Badge color={u.subscription === 'pro' ? 'accent' : 'warning'}>{u.subscription || 'free'}</Badge>
              <div style={{ display: 'flex', gap: 6 }}>
                <Btn variant={u.isActive ? 'danger' : 'success'} onClick={() => ban(u._id, u.isActive)}
                  style={{ padding: '5px 10px', fontSize: 11 }}>
                  {u.isActive ? 'Ban' : 'Unban'}
                </Btn>
                {u.role !== 'admin' && (
                  <Btn variant="danger" onClick={() => del(u._id)} style={{ padding: '5px 10px', fontSize: 11 }}>Delete</Btn>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text3)', padding: '20px', fontSize: 14 }}>No users found</div>
          )}
        </div>
      </Card>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
