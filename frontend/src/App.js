import React, { useState, useRef, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: "Hey there, trail seeker! I'm **Stella**, your North Star guide.\n\nHow can I help you today?",
  type: 'welcome',
};

const QUICK_REPLIES = [
  {
    label: 'Track my order',
    text: 'I want to track my order',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
    ),
    primary: true,
  },
  {
    label: 'Returns & exchanges',
    text: 'I need to return an item',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.68"/></svg>
    ),
    primary: true,
  },
  {
    label: 'Find the right gear',
    text: 'Help me find the right gear',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
    ),
    primary: true,
  },
  {
    label: 'Talk to a person',
    text: 'I want to speak to a human agent',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    ),
    primary: false,
  },
];

const ORDER_STATUSES = { '111': 'Shipped', '222': 'Processing', '333': 'Delivered' };

function detectOrderNumber(text) {
  const match = text.match(/#?(\d{3,})/);
  return match ? match[1] : null;
}

function detectOrderInHistory(messages) {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') {
      const num = detectOrderNumber(messages[i].content);
      if (num) return num;
    }
  }
  return null;
}

function OrderCard({ orderNum, status }) {
  const colors = {
    Shipped:    { bg: '#eaf3de', border: '#c0dd97', text: '#3b6d11', icon: '✓' },
    Processing: { bg: '#faeeda', border: '#fac775', text: '#854f0b', icon: '⏳' },
    Delivered:  { bg: '#e6f1fb', border: '#b5d4f4', text: '#185fa5', icon: '📦' },
  };
  const c = colors[status] || colors.Processing;
  const eta = status === 'Shipped' ? 'Tomorrow' : status === 'Processing' ? 'Ships in 24 hrs' : 'Delivered';

  return (
    <div style={{ borderRadius: '14px 14px 14px 3px', overflow: 'hidden', border: '0.5px solid #e5e2d8', maxWidth: '87%' }}>
      <div style={{ background: c.bg, borderBottom: `0.5px solid ${c.border}`, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 12 }}>{c.icon}</span>
        <span style={{ color: c.text, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em' }}>ORDER {status.toUpperCase()}</span>
      </div>
      <div style={{ background: '#fff', padding: '10px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ color: '#888', fontSize: 11 }}>Order number</span>
          <span style={{ color: '#1a1a1a', fontSize: 12, fontWeight: 600 }}>#{orderNum}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#888', fontSize: 11 }}>Status</span>
          <span style={{ color: c.text, fontSize: 12, fontWeight: 600 }}>{eta}</span>
        </div>
      </div>
    </div>
  );
}

function BubbleText({ content }) {
  const parts = content.split(/\*\*(.*?)\*\*/g);
  return (
    <p style={{ fontSize: 13, lineHeight: 1.6, color: '#1a1a1a', margin: 0 }}>
      {parts.map((p, i) =>
        i % 2 === 1 ? <strong key={i} style={{ color: '#2c6e49' }}>{p}</strong> : p
      )}
    </p>
  );
}

function Message({ msg, index }) {
  const isUser = msg.role === 'user';
  const orderNum = msg.orderCard;
  const status = orderNum ? ORDER_STATUSES[orderNum] : null;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        alignItems: 'flex-end',
        gap: 8,
        animation: 'fadeIn 0.28s ease',
      }}
    >
      {!isUser && (
        <div style={{
          width: 26, height: 26, borderRadius: '50%', background: '#1a2e19',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7dc47a" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
      )}

      <div style={{ maxWidth: '85%', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {orderNum && status ? (
          <>
            <OrderCard orderNum={orderNum} status={status} />
            {msg.content && (
              <div style={{ background: '#fff', border: '0.5px solid #e5e2d8', borderRadius: '14px 14px 14px 3px', padding: '9px 12px' }}>
                <BubbleText content={msg.content} />
              </div>
            )}
          </>
        ) : (
          <div style={{
            background: isUser ? '#1a2e19' : '#fff',
            border: isUser ? 'none' : '0.5px solid #e5e2d8',
            borderRadius: isUser ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
            padding: '9px 12px',
          }}>
            {isUser
              ? <p style={{ fontSize: 13, lineHeight: 1.6, color: '#f0ede4', margin: 0 }}>{msg.content}</p>
              : msg.content.split('\n').map((line, i, arr) => (
                  <React.Fragment key={i}>
                    <BubbleText content={line} />
                    {i < arr.length - 1 && <br />}
                  </React.Fragment>
                ))
            }
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
      <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#1a2e19', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7dc47a" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </div>
      <div style={{ background: '#fff', border: '0.5px solid #e5e2d8', borderRadius: '14px 14px 14px 3px', padding: '10px 14px' }}>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {[0, 200, 400].map(delay => (
            <div key={delay} style={{
              width: 7, height: 7, borderRadius: '50%', background: '#8fa88d',
              animation: `bounce 1s ${delay}ms infinite`,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isHandoff, setIsHandoff] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    setShowQuick(false);
    const userMsg = { role: 'user', content: userText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.reply;

      if (reply.includes('Transferring to Live Agent')) setIsHandoff(true);

      const orderNum = detectOrderInHistory(newMessages);
      const hasOrderCard = orderNum && ORDER_STATUSES[orderNum] &&
        (reply.toLowerCase().includes('order') || reply.toLowerCase().includes('ship') || reply.toLowerCase().includes('deliver') || reply.toLowerCase().includes('process'));

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: hasOrderCard ? 'Is there anything else I can help you with today?' : reply,
        orderCard: hasOrderCard ? orderNum : null,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const reset = () => { setMessages([WELCOME_MESSAGE]); setIsHandoff(false); setInput(''); setShowQuick(true); };

  return (
    <div style={s.page}>
      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        * { box-sizing: border-box; }
        input:focus { outline: none; border-color: #2c6e49 !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d0cdc4; border-radius: 4px; }
      `}</style>

      {/* Header */}
      <div style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={s.headerAvatar}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7dc47a" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div>
            <div style={{ color: '#f0ede4', fontSize: 14, fontWeight: 600 }}>Stella</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: isHandoff ? '#f4a340' : '#7dc47a', animation: 'pulse 2s infinite' }} />
              <span style={{ color: isHandoff ? '#f4a340' : '#7dc47a', fontSize: 11 }}>
                {isHandoff ? 'Connecting to live agent...' : 'Online · North Star Support'}
              </span>
            </div>
          </div>
        </div>
        <button onClick={reset} style={s.resetBtn} title="New chat">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8fa88d" strokeWidth="2">
            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.68"/>
          </svg>
        </button>
      </div>

      {/* Brand banner */}
      <div style={s.banner}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7dc47a" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span style={{ color: '#a8c9a5', fontSize: 10, letterSpacing: '0.06em', fontWeight: 500 }}>YOUR TRAIL TO GREAT GEAR STARTS HERE</span>
      </div>

      {/* Messages */}
      <div style={s.messages}>
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} index={i} />
        ))}

        {showQuick && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginLeft: 34, animation: 'fadeIn 0.3s ease' }}>
            {QUICK_REPLIES.map(qr => (
              <button key={qr.text} onClick={() => sendMessage(qr.text)} style={{
                ...s.chip,
                borderColor: qr.primary ? '#2c6e49' : '#d0cdc4',
                color: qr.primary ? '#2c6e49' : '#888',
              }}>
                <span style={{ color: 'inherit' }}>{qr.icon}</span>
                {qr.label}
              </button>
            ))}
          </div>
        )}

        {loading && <TypingIndicator />}

        {isHandoff && (
          <div style={s.handoffBanner}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f4a340', animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontWeight: 600, fontSize: 12, color: '#7a5000' }}>Connecting to live agent</span>
            </div>
            <p style={{ fontSize: 12, color: '#9a6800', margin: 0 }}>Average wait time: 2 minutes. A North Star team member will be with you shortly.</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={s.inputRow}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder={isHandoff ? 'Chat with live agent...' : 'Type a message...'}
          disabled={loading}
          style={s.input}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          style={{ ...s.sendBtn, opacity: (!input.trim() || loading) ? 0.4 : 1 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7dc47a" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>

      <div style={s.footer}>Powered by North Star · AI-assisted support</div>
    </div>
  );
}

const s = {
  page: {
    display: 'flex', flexDirection: 'column',
    height: '100vh', maxWidth: 480, margin: '0 auto',
    fontFamily: "'Inter', -apple-system, sans-serif",
    background: '#f7f6f2',
    boxShadow: '0 0 60px rgba(0,0,0,0.15)',
  },
  header: {
    background: '#1a2e19', padding: '14px 18px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  headerAvatar: {
    width: 38, height: 38, borderRadius: '50%', background: '#2c4a2a',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  resetBtn: {
    background: '#2c4a2a', border: 'none', borderRadius: '50%',
    width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
  },
  banner: {
    background: '#1a2e19', borderBottom: '1px solid #2c4a2a',
    padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 7,
  },
  messages: {
    flex: 1, overflowY: 'auto', padding: '18px 14px',
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  chip: {
    background: '#fff', border: '1px solid', borderRadius: 20,
    padding: '7px 13px', fontSize: 12, cursor: 'pointer',
    textAlign: 'left', display: 'flex', alignItems: 'center', gap: 7,
    fontFamily: 'inherit', fontWeight: 500, transition: 'all 0.15s',
  },
  handoffBanner: {
    background: '#fff8ed', border: '1px solid #f4a340',
    borderRadius: 12, padding: '10px 14px', animation: 'fadeIn 0.3s ease',
  },
  inputRow: {
    display: 'flex', gap: 8, padding: '12px 14px',
    background: '#fff', borderTop: '0.5px solid #e5e2d8', alignItems: 'center',
  },
  input: {
    flex: 1, border: '1.5px solid #e5e2d8', borderRadius: 24,
    padding: '10px 16px', fontSize: 13, fontFamily: 'inherit',
    background: '#f7f6f2', color: '#1a1a1a', transition: 'border-color 0.2s',
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: '50%', background: '#1a2e19',
    border: 'none', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'opacity 0.2s',
  },
  footer: {
    textAlign: 'center', fontSize: 10, color: '#b0a89a',
    padding: '7px', background: '#fff', borderTop: '0.5px solid #e5e2d8',
  },
};
