import { useState } from 'react';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import UploadPage from './pages/UploadPage';
import PaymentPage from './pages/PaymentPage';
import AdminPage from './pages/AdminPage';
import Sidebar from './components/Sidebar';
import { Spinner } from './components/UI';

function AppInner() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState('dashboard');

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Spinner size={36} />
    </div>
  );

  if (!user) return <AuthPage />;

  const pages = {
    dashboard: <Dashboard />,
    profile: <ProfilePage />,
    chat: <ChatPage />,
    upload: <UploadPage />,
    payment: <PaymentPage />,
    admin: <AdminPage />,
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar active={page} onNav={setPage} />
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
        {pages[page] || <Dashboard />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
