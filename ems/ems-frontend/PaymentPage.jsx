import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Btn, Card, Badge, Toast } from '../components/UI';
import API from '../utils/api';

export default function PaymentPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const checkout = async () => {
    setLoading(true);
    try {
      const r = await API.post('/payments/create-checkout', { plan: 'pro' });
      window.open(r.data.url, '_blank');
    } catch (err) { showToast(err.response?.data?.message || 'Payment error', 'danger'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ padding: '32px 28px', maxWidth: 640 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Payments</h1>
      <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 28 }}>Manage your subscription plan</p>

      {/* Current plan */}
      <Card style={{ marginBottom: 16, borderColor: user?.subscription === 'pro' ? 'var(--accent-border)' : 'var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>Current plan</div>
            <div style={{ fontSize: 22, fontWeight: 700, textTransform: 'capitalize' }}>{user?.subscription || 'free'}</div>
          </div>
          <Badge color={user?.subscription === 'pro' ? 'accent' : 'warning'}>{user?.subscription || 'free'}</Badge>
        </div>
      </Card>

      {/* Plans */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
        {/* Free */}
        <Card>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Free</div>
            <div style={{ fontSize: 26, fontWeight: 800 }}>$0<span style={{ fontSize: 14, color: 'var(--text2)', fontWeight: 400 }}>/mo</span></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
            {['Authentication API', 'User profiles', '10 uploads/mo', 'Public chat rooms'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text2)' }}>
                <span style={{ color: 'var(--success)', fontSize: 14 }}>✓</span> {f}
              </div>
            ))}
          </div>
          <Btn variant="ghost" disabled style={{ width: '100%' }}>
            {user?.subscription === 'free' ? 'Current plan' : 'Downgrade'}
          </Btn>
        </Card>

        {/* Pro */}
        <Card style={{ borderColor: 'var(--accent-border)', background: 'rgba(124,111,247,0.05)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -10, right: 14 }}>
            <Badge color="accent">Popular</Badge>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Pro</div>
            <div style={{ fontSize: 26, fontWeight: 800 }}>$9.99<span style={{ fontSize: 14, color: 'var(--text2)', fontWeight: 400 }}>/mo</span></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
            {['Everything in Free', 'Unlimited uploads', 'Admin dashboard', 'Priority support', 'Stripe payments', 'Real-time analytics'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text2)' }}>
                <span style={{ color: 'var(--accent2)', fontSize: 14 }}>✓</span> {f}
              </div>
            ))}
          </div>
          <Btn onClick={checkout} loading={loading} disabled={user?.subscription === 'pro'} style={{ width: '100%' }}>
            {user?.subscription === 'pro' ? '✓ Active' : 'Upgrade to Pro'}
          </Btn>
        </Card>
      </div>

      <Card>
        <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', lineHeight: 1.6 }}>
          🔒 Payments powered by <strong style={{ color: 'var(--accent2)' }}>Stripe</strong> — your card details are never stored on our servers.
          Test with card <code style={{ background: 'var(--bg3)', padding: '1px 6px', borderRadius: 4 }}>4242 4242 4242 4242</code>
        </div>
      </Card>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
