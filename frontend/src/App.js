import React, { useState, useRef, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: "Hey there, trail seeker! 🏔️ I'm Stella, your North Star support assistant. I can help you with:\n\n• Track an order\n• Returns & exchanges\n• Product recommendations\n• Connect you with our team\n\nWhat can I help you with today?",
};

const QUICK_REPLIES = [
  { label: '📦 Track my order', text: 'I want to track my order' },
  { label: '🔄 Returns & exchanges', text: 'I need to return an item' },
  { label: '🎒 Product recommendations', text: 'Help me find the right gear' },
  { label: '🧑 Talk to a person', text: 'I want to speak to a human agent' },
];

export default function App() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isHandoff, setIsHandoff] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        }),
      });

      const data = await res.json();
      const reply = data.reply;

      if (reply.includes('Transferring to Live Agent')) {
        setIsHandoff(true);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment."
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setIsHandoff(false);
    setInput('');
  };

  const showQuickReplies = messages.length <= 1;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.avatar}>⭐</div>
          <div>
            <div style={styles.botName}>Stella</div>
            <div style={styles.botSub}>North Star Support</div>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={isHandoff ? styles.statusHandoff : styles.statusOnline}>
            <span style={styles.dot}></span>
            {isHandoff ? 'Live Agent' : 'Online'}
          </div>
          <button style={styles.resetBtn} onClick={resetChat} title="Start new chat">↺</button>
        </div>
      </div>

      {/* Messages */}
      <div style={styles.messagesArea}>
        {messages.map((msg, i) => (
          <div key={i} style={msg.role === 'user' ? styles.userRow : styles.botRow}>
            {msg.role === 'assistant' && <div style={styles.botAvatar}>⭐</div>}
            <div style={msg.role === 'user' ? styles.userBubble : styles.botBubble}>
              {msg.content.split('\n').map((line, j) => (
                <span key={j}>{line}{j < msg.content.split('\n').length - 1 && <br />}</span>
              ))}
            </div>
          </div>
        ))}

        {/* Quick reply chips */}
        {showQuickReplies && (
          <div style={styles.quickReplies}>
            {QUICK_REPLIES.map((qr) => (
              <button key={qr.text} style={styles.chip} onClick={() => sendMessage(qr.text)}>
                {qr.label}
              </button>
            ))}
          </div>
        )}

        {/* Typing indicator */}
        {loading && (
          <div style={styles.botRow}>
            <div style={styles.botAvatar}>⭐</div>
            <div style={styles.botBubble}>
              <div style={styles.typing}>
                <span style={{...styles.dot2, animationDelay: '0ms'}}></span>
                <span style={{...styles.dot2, animationDelay: '200ms'}}></span>
                <span style={{...styles.dot2, animationDelay: '400ms'}}></span>
              </div>
            </div>
          </div>
        )}

        {/* Handoff notice */}
        {isHandoff && (
          <div style={styles.handoffBanner}>
            🟢 You're now connected with a live agent. Average wait time: 2 minutes.
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={styles.inputArea}>
        <input
          ref={inputRef}
          style={styles.input}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={isHandoff ? 'Chat with live agent...' : 'Type a message...'}
          disabled={loading}
        />
        <button
          style={{...styles.sendBtn, opacity: (!input.trim() || loading) ? 0.4 : 1}}
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
        >
          ➤
        </button>
      </div>

      <div style={styles.footer}>Powered by North Star • AI-assisted support</div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    maxWidth: '480px',
    margin: '0 auto',
    fontFamily: "'Inter', sans-serif",
    background: '#F7F6F2',
    boxShadow: '0 0 40px rgba(0,0,0,0.12)',
  },
  header: {
    background: '#1B2E1A',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: {
    width: '40px', height: '40px',
    background: '#2D4A2B',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px',
  },
  botName: { color: '#F0EDE4', fontWeight: 600, fontSize: '15px' },
  botSub: { color: '#8FA88D', fontSize: '12px', marginTop: '1px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  statusOnline: {
    display: 'flex', alignItems: 'center', gap: '6px',
    color: '#7DC47A', fontSize: '12px', fontWeight: 500,
  },
  statusHandoff: {
    display: 'flex', alignItems: 'center', gap: '6px',
    color: '#F4A340', fontSize: '12px', fontWeight: 500,
  },
  dot: {
    display: 'inline-block', width: '7px', height: '7px',
    borderRadius: '50%', background: 'currentColor',
  },
  resetBtn: {
    background: 'none', border: 'none', color: '#8FA88D',
    fontSize: '20px', cursor: 'pointer', padding: '0 4px',
    lineHeight: 1,
  },
  messagesArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  botRow: { display: 'flex', alignItems: 'flex-end', gap: '8px' },
  userRow: { display: 'flex', justifyContent: 'flex-end' },
  botAvatar: {
    width: '28px', height: '28px', minWidth: '28px',
    background: '#1B2E1A', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '13px',
  },
  botBubble: {
    background: '#fff',
    border: '1px solid #E5E2D8',
    borderRadius: '18px 18px 18px 4px',
    padding: '12px 15px',
    maxWidth: '80%',
    fontSize: '14px',
    color: '#1A1A1A',
    lineHeight: '1.5',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  userBubble: {
    background: '#1B2E1A',
    color: '#F0EDE4',
    borderRadius: '18px 18px 4px 18px',
    padding: '12px 15px',
    maxWidth: '80%',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  quickReplies: {
    display: 'flex', flexWrap: 'wrap', gap: '8px',
    marginLeft: '36px',
  },
  chip: {
    background: '#fff',
    border: '1.5px solid #2D4A2B',
    color: '#1B2E1A',
    borderRadius: '20px',
    padding: '7px 14px',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    transition: 'background 0.15s',
  },
  typing: { display: 'flex', gap: '4px', alignItems: 'center', padding: '2px 0' },
  dot2: {
    display: 'inline-block',
    width: '7px', height: '7px',
    borderRadius: '50%',
    background: '#8FA88D',
    animation: 'bounce 1s infinite',
  },
  handoffBanner: {
    background: '#FFF8ED',
    border: '1px solid #F4A340',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#7A5000',
    textAlign: 'center',
  },
  inputArea: {
    display: 'flex',
    gap: '10px',
    padding: '12px 16px',
    background: '#fff',
    borderTop: '1px solid #E5E2D8',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    border: '1.5px solid #E5E2D8',
    borderRadius: '24px',
    padding: '10px 16px',
    fontSize: '14px',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    background: '#F7F6F2',
    color: '#1A1A1A',
  },
  sendBtn: {
    width: '40px', height: '40px',
    background: '#1B2E1A',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'opacity 0.2s',
  },
  footer: {
    textAlign: 'center',
    fontSize: '11px',
    color: '#B0A89A',
    padding: '8px',
    background: '#fff',
  },
};

// Inject keyframe animation
const style = document.createElement('style');
style.textContent = `@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`;
document.head.appendChild(style);
