import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Btn, Field, Card, Toast, Avatar, Badge } from '../components/UI';
import API from '../utils/api';

export default function ProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const updateProfile = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await API.put('/users/profile', form);
      showToast('Profile updated');
    } catch (err) { showToast(err.response?.data?.message || 'Error', 'danger'); }
    finally { setLoading(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault(); setPwLoading(true);
    try {
      await API.put('/users/change-password', pwForm);
      showToast('Password changed');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) { showToast(err.response?.data?.message || 'Error', 'danger'); }
    finally { setPwLoading(false); }
  };

  return (
    <div style={{ padding: '32px 28px', maxWidth: 640 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Profile</h1>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <Avatar name={user?.name} size={56} src={user?.avatar} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{user?.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>{user?.email}</div>
            <div style={{ marginTop: 6 }}><Badge color={user?.role === 'admin' ? 'danger' : 'accent'}>{user?.role}</Badge></div>
          </div>
        </div>

        <form onSubmit={updateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>Bio</label>
            <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              rows={3} maxLength={200} placeholder="Tell us about yourself..."
              style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8,
                color: 'var(--text)', padding: '10px 14px', fontSize: 14, resize: 'vertical', outline: 'none' }} />
          </div>
          <Btn type="submit" loading={loading}>Save changes</Btn>
        </form>
      </Card>

      <Card>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Change password</h2>
        <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Current password" type="password" placeholder="••••••••"
            value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} />
          <Field label="New password" type="password" placeholder="••••••••"
            value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} />
          <Btn type="submit" variant="ghost" loading={pwLoading}>Update password</Btn>
        </form>
      </Card>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
