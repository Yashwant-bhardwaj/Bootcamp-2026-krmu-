import { useAuth } from '../context/AuthContext';
import { Avatar, Badge } from './UI';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '⬛' },
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'chat', label: 'Chat', icon: '💬' },
  { id: 'upload', label: 'Upload', icon: '☁️' },
  { id: 'payment', label: 'Payments', icon: '💳' },
  { id: 'admin', label: 'Admin', icon: '🛡️', adminOnly: true },
];

export default function Sidebar({ active, onNav }) {
  const { user, logout } = useAuth();

  return (
    <aside style={{
      width: 220, minHeight: '100vh', background: 'var(--bg2)',
      borderRight: '1px solid var(--border)', display: 'flex',
      flexDirection: 'column', padding: '20px 12px', gap: 4, flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '4px 12px 20px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>⚡</div>
          <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>AuthApp</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.filter(i => !i.adminOnly || user?.role === 'admin').map(item => (
          <button key={item.id} onClick={() => onNav(item.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
              borderRadius: 9, background: active === item.id ? 'var(--accent-bg)' : 'transparent',
              border: active === item.id ? '1px solid var(--accent-border)' : '1px solid transparent',
              color: active === item.id ? 'var(--accent2)' : 'var(--text2)',
              fontSize: 14, fontWeight: active === item.id ? 600 : 400,
              transition: 'all 0.15s', cursor: 'pointer', textAlign: 'left',
            }}
            onMouseEnter={e => { if (active !== item.id) e.currentTarget.style.background = 'var(--glass)'; }}
            onMouseLeave={e => { if (active !== item.id) e.currentTarget.style.background = 'transparent'; }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
            {item.id === 'admin' && <Badge color="warning">Admin</Badge>}
          </button>
        ))}
      </nav>

      {/* User */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 8 }}>
          <Avatar name={user?.name} size={32} src={user?.avatar} />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{user?.role}</div>
          </div>
        </div>
        <button onClick={logout} style={{
          width: '100%', padding: '8px 12px', borderRadius: 9, background: 'var(--danger-bg)',
          border: '1px solid rgba(248,113,113,0.2)', color: 'var(--danger)', fontSize: 13, fontWeight: 500,
        }}>Sign out</button>
      </div>
    </aside>
  );
}
