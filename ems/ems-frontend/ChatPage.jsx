import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Btn, Avatar } from '../components/UI';
import { io } from 'socket.io-client';
import API from '../utils/api';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'https://login-signup-backend-myng.onrender.com';

export default function ChatPage() {
  const { user } = useAuth();
  const [room, setRoom] = useState('general');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState('');
  const [online, setOnline] = useState([]);
  const [socket, setSocket] = useState(null);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const s = io(SOCKET_URL, { auth: { token } });
    setSocket(s);

    s.emit('join_room', room);
    s.on('receive_message', msg => setMessages(prev => [...prev, msg]));
    s.on('user_typing', ({ name }) => {
      setTyping(`${name} is typing...`);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTyping(''), 2000);
    });
    s.on('online_users', users => setOnline(users));

    API.get(`/chat/${room}`).then(r => setMessages(r.data.messages)).catch(() => {});

    return () => s.disconnect();
  }, [room]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim() || !socket) return;
    socket.emit('send_message', { room, text });
    setText('');
  };

  const handleTyping = (v) => {
    setText(v);
    socket?.emit('typing', { room });
  };

  const rooms = ['general', 'dev', 'random'];

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 0px)', overflow: 'hidden' }}>
      {/* Room list */}
      <div style={{ width: 160, borderRight: '1px solid var(--border)', padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 8px', marginBottom: 8 }}>Rooms</div>
        {rooms.map(r => (
          <button key={r} onClick={() => setRoom(r)} style={{
            padding: '8px 10px', borderRadius: 8, background: room === r ? 'var(--accent-bg)' : 'transparent',
            border: room === r ? '1px solid var(--accent-border)' : '1px solid transparent',
            color: room === r ? 'var(--accent2)' : 'var(--text2)', fontSize: 13, fontWeight: room === r ? 600 : 400,
            textAlign: 'left', cursor: 'pointer',
          }}>
            # {r}
          </button>
        ))}
        <div style={{ marginTop: 'auto', fontSize: 11, color: 'var(--text3)' }}>
          <div style={{ padding: '0 8px', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Online ({online.length})</div>
          <div style={{ padding: '0 8px', color: 'var(--success)', fontSize: 11 }}>● {online.length} user{online.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 15 }}>
          # {room}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 14, marginTop: 40 }}>
              No messages yet. Say hello! 👋
            </div>
          )}
          {messages.map((msg, i) => {
            const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;
            return (
              <div key={i} style={{ display: 'flex', gap: 10, flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                <Avatar name={msg.sender?.name || 'U'} size={28} />
                <div style={{ maxWidth: '70%' }}>
                  {!isMe && <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>{msg.sender?.name}</div>}
                  <div style={{
                    background: isMe ? 'var(--accent)' : 'var(--bg3)',
                    border: `1px solid ${isMe ? 'transparent' : 'var(--border)'}`,
                    borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    padding: '8px 12px', fontSize: 14, color: isMe ? '#fff' : 'var(--text)',
                  }}>{msg.text}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3, textAlign: isMe ? 'right' : 'left' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {typing && <div style={{ padding: '0 20px 8px', fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>{typing}</div>}

        <form onSubmit={send} style={{ display: 'flex', gap: 10, padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
          <input value={text} onChange={e => handleTyping(e.target.value)}
            placeholder={`Message #${room}...`}
            style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', padding: '10px 14px', fontSize: 14, outline: 'none' }} />
          <Btn type="submit" disabled={!text.trim()} style={{ padding: '10px 18px' }}>Send</Btn>
        </form>
      </div>
    </div>
  );
}
