import { useAuth } from '../context/AuthContext';
import { Card, StatCard, Badge } from '../components/UI';

const endpoints = [
  { method: 'POST', path: '/api/auth/signup', desc: 'Register new user' },
  { method: 'POST', path: '/api/auth/login', desc: 'Login & get token' },
  { method: 'GET', path: '/api/auth/me', desc: 'Get current user', auth: true },
  { method: 'PUT', path: '/api/users/profile', desc: 'Update profile', auth: true },
  { method: 'GET', path: '/api/chat/:room', desc: 'Chat history', auth: true },
  { method: 'POST', path: '/api/upload', desc: 'Upload file', auth: true },
  { method: 'POST', path: '/api/payments/create-checkout', desc: 'Stripe checkout', auth: true },
  { method: 'GET', path: '/api/admin/analytics', desc: 'Platform stats', auth: true, admin: true },
];

const methodColors = { GET: 'success', POST: 'accent', PUT: 'warning', DELETE: 'danger' };

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div style={{ padding: '32px 28px', maxWidth: 900 }}>
      {/* Welcome */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)' }}>
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text2)', marginTop: 4, fontSize: 14 }}>
          Your full-stack backend is live and running
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 32 }}>
        <StatCard label="Auth" value="JWT" sub="bcrypt + token expiry" icon="🔐" />
        <StatCard label="Database" value="MongoDB" sub="Mongoose ORM" icon="🗄️" />
        <StatCard label="Real-time" value="Socket.io" sub="Chat + presence" icon="⚡" />
        <StatCard label="Payments" value="Stripe" sub="Webhooks enabled" icon="💳" />
      </div>

      {/* API Reference */}
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>API endpoints</h2>
          <span style={{ fontSize: 12, color: 'var(--text3)', background: 'var(--bg3)', padding: '4px 10px', borderRadius: 6 }}>
            Base:https://login-signup-backend-myng.onrender.com
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {endpoints.map((ep, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
              background: 'var(--bg3)', borderRadius: 9, border: '1px solid var(--border)',
            }}>
              <Badge color={methodColors[ep.method]}>{ep.method}</Badge>
              <code style={{ fontSize: 12, color: 'var(--accent2)', flex: 1, fontFamily: 'monospace' }}>{ep.path}</code>
              <span style={{ fontSize: 12, color: 'var(--text3)' }}>{ep.desc}</span>
              {ep.auth && <Badge color="warning">Auth</Badge>}
              {ep.admin && <Badge color="danger">Admin</Badge>}
            </div>
          ))}
        </div>
      </Card>

      {/* Stack */}
      <Card style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Tech stack</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['Node.js', 'Express.js', 'MongoDB', 'JWT', 'bcrypt', 'Socket.io', 'Multer', 'Cloudinary', 'Stripe', 'Redis', 'Docker', 'Winston'].map(t => (
            <span key={t} style={{
              background: 'var(--bg3)', border: '1px solid var(--border-hover)',
              borderRadius: 7, padding: '5px 12px', fontSize: 12, color: 'var(--text2)', fontWeight: 500,
            }}>{t}</span>
          ))}
        </div>
      </Card>
    </div>
  );
}
