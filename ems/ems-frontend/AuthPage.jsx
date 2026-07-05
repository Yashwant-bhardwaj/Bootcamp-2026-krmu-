import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Btn, Field, Toast } from '../components/UI';

export default function AuthPage() {
  const { login, signup } = useAuth();
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'login') await login(form.email, form.password);
      else await signup(form.name, form.email, form.password);
    } catch (err) {
      setToast({ msg: err.response?.data?.message || 'Something went wrong', type: 'danger' });
    } finally { setLoading(false); }
  };

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)} style={{
      flex: 1, padding: '10px', borderRadius: 8, border: 'none',
      background: tab === id ? 'var(--accent)' : 'transparent',
      color: tab === id ? '#fff' : 'var(--text2)', fontSize: 14, fontWeight: 500,
      transition: 'all 0.2s',
    }}>{label}</button>
  );

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 60% 20%, rgba(124,111,247,0.12) 0%, transparent 60%), var(--bg)',
      padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, margin: '0 auto 12px',
          }}>⚡</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>AuthApp</h1>
          <p style={{ fontSize: 14, color: 'var(--text2)', marginTop: 4 }}>Premium full-stack starter</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 18, padding: 28, boxShadow: 'var(--shadow)',
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg3)', borderRadius: 10, padding: 4, marginBottom: 24 }}>
            {tabBtn('login', 'Sign in')}
            {tabBtn('signup', 'Sign up')}
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {tab === 'signup' && (
              <Field label="Full name" type="text" placeholder="John Doe" value={form.name}
                onChange={e => set('name', e.target.value)} required />
            )}
            <Field label="Email address" type="email" placeholder="you@example.com" value={form.email}
              onChange={e => set('email', e.target.value)} required />
            <Field label="Password" type="password" placeholder="••••••••" value={form.password}
              onChange={e => set('password', e.target.value)} required />

            <Btn type="submit" loading={loading} style={{ width: '100%', padding: '12px', marginTop: 4, fontSize: 15 }}>
              {tab === 'login' ? 'Sign in' : 'Create account'}
            </Btn>
          </form>

          <p style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', marginTop: 20 }}>
            {tab === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setTab(tab === 'login' ? 'signup' : 'login')}
              style={{ background: 'none', color: 'var(--accent2)', fontSize: 12, cursor: 'pointer' }}>
              {tab === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
