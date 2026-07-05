import { useState } from 'react';

/* ─── Button ─── */
export function Btn({ children, onClick, variant = 'primary', loading, style, type = 'button', disabled }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: '10px 20px', borderRadius: 10, fontSize: 14,
    fontWeight: 500, transition: 'all 0.18s', cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1, ...style,
  };
  const styles = {
    primary: { background: 'var(--accent)', color: '#fff' },
    ghost: { background: 'transparent', border: '1px solid var(--border-hover)', color: 'var(--text2)' },
    danger: { background: 'var(--danger-bg)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--danger)' },
    success: { background: 'var(--success-bg)', border: '1px solid rgba(52,211,153,0.3)', color: 'var(--success)' },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      style={{ ...base, ...styles[variant] }}
      onMouseEnter={e => { if (!disabled && !loading) e.target.style.opacity = '0.85'; }}
      onMouseLeave={e => { e.target.style.opacity = disabled || loading ? '0.6' : '1'; }}>
      {loading ? <Spinner size={16} /> : children}
    </button>
  );
}

/* ─── Spinner ─── */
export function Spinner({ size = 20 }) {
  return (
    <span style={{ display: 'inline-block', width: size, height: size }}>
      <svg viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite', width: '100%', height: '100%' }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/* ─── Card ─── */
export function Card({ children, style }) {
  return (
    <div style={{
      background: 'var(--glass)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '24px',
      backdropFilter: 'blur(12px)', ...style
    }}>
      {children}
    </div>
  );
}

/* ─── Badge ─── */
export function Badge({ children, color = 'accent' }) {
  const map = {
    accent: { bg: 'var(--accent-bg)', border: 'var(--accent-border)', color: 'var(--accent2)' },
    success: { bg: 'var(--success-bg)', border: 'rgba(52,211,153,0.3)', color: 'var(--success)' },
    danger: { bg: 'var(--danger-bg)', border: 'rgba(248,113,113,0.3)', color: 'var(--danger)' },
    warning: { bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)', color: 'var(--warning)' },
  };
  const s = map[color] || map.accent;
  return (
    <span style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color,
      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, display: 'inline-block' }}>
      {children}
    </span>
  );
}

/* ─── Toast ─── */
export function Toast({ msg, type = 'success', onClose }) {
  if (!msg) return null;
  const colors = { success: 'var(--success)', danger: 'var(--danger)', info: 'var(--accent2)' };
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: 'var(--bg3)', border: `1px solid ${colors[type]}33`,
      borderLeft: `3px solid ${colors[type]}`, borderRadius: 10,
      padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
      color: colors[type], fontSize: 14, fontWeight: 500, boxShadow: 'var(--shadow)',
      animation: 'slideIn 0.3s ease',
    }}>
      <style>{`@keyframes slideIn{from{transform:translateX(60px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>
      {msg}
      <button onClick={onClose} style={{ background: 'none', color: 'var(--text3)', fontSize: 18, marginLeft: 8 }}>×</button>
    </div>
  );
}

/* ─── Avatar ─── */
export function Avatar({ name = '?', size = 36, src }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: 'var(--accent-bg)',
      border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', color: 'var(--accent2)', fontSize: size * 0.38, fontWeight: 600,
    }}>
      {initials}
    </div>
  );
}

/* ─── Input Field ─── */
export function Field({ label, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <label style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>{label}</label>}
      <input {...props} />
    </div>
  );
}

/* ─── Stat Card ─── */
export function StatCard({ label, value, sub, icon }) {
  return (
    <div style={{
      background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
      padding: '20px', display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        {icon && <span style={{ fontSize: 20 }}>{icon}</span>}
      </div>
      <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: 'var(--text3)' }}>{sub}</span>}
    </div>
  );
}
