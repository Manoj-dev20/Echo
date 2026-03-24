import { useState, useRef, useEffect } from 'react';
import { PageLayout } from '../components/Layout';
import { sendChat } from '../utils/api';

const DOMAINS = ['ALL', 'CAREER', 'FINANCE', 'HEALTH', 'LIVELIHOOD', 'CIVIC'];
const DOMAIN_COLORS = {
  CAREER: '#FF4D4D', FINANCE: '#FFB830', HEALTH: '#00E676',
  LIVELIHOOD: '#4ADE80', CIVIC: '#60A5FA',
};

function NewsCard({ card }) {
  const color = DOMAIN_COLORS[card.domain] || 'var(--green)';
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 16, marginTop: 8,
      animation: 'fadeUp 0.3s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{
          padding: '3px 10px', borderRadius: 20,
          background: `${color}22`, color, border: `1px solid ${color}44`,
          fontFamily: 'var(--font-mono)', fontSize: 10,
        }}>
          {card.domain}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color }}>
          IMPACT: <strong>{card.impactScore}</strong>
        </span>
      </div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 6, lineHeight: 1.4 }}>
        {card.headline}
      </h3>
      <p style={{ fontSize: 13, color: 'var(--text-sec)', lineHeight: 1.6, marginBottom: 10 }}>
        {card.body}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
          SOURCE: {card.source}
        </span>
        <button style={{
          background: 'none', border: 'none', color, fontFamily: 'var(--font-mono)',
          fontSize: 11, cursor: 'pointer', fontWeight: 600,
        }}>
          DIVE DEEPER →
        </button>
      </div>
    </div>
  );
}

function ChatMessage({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 16, animation: 'fadeUp 0.3s ease',
    }}>
      {!isUser && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <svg width="14" height="14" viewBox="0 0 14 14">
            <circle cx="7" cy="7" r="3" fill="var(--green)" />
            <circle cx="7" cy="1.5" r="1.2" fill="var(--green)" opacity="0.5" />
            <circle cx="7" cy="12.5" r="1.2" fill="var(--green)" opacity="0.5" />
            <circle cx="1.5" cy="7" r="1.2" fill="var(--green)" opacity="0.5" />
            <circle cx="12.5" cy="7" r="1.2" fill="var(--green)" opacity="0.5" />
          </svg>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--green)', letterSpacing: 1 }}>
            ECHO INTELLIGENCE
          </span>
        </div>
      )}

      {msg.type === 'cards' ? (
        <div style={{ width: '100%' }}>
          {msg.cards?.map((card, i) => <NewsCard key={i} card={card} />)}
        </div>
      ) : (
        <div style={{
          maxWidth: '85%',
          padding: '10px 14px',
          borderRadius: isUser ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
          background: isUser ? 'var(--green)' : 'var(--bg-card)',
          border: isUser ? 'none' : '1px solid var(--border)',
          color: isUser ? 'var(--bg)' : 'var(--text)',
          fontSize: 14, lineHeight: 1.7,
        }}>
          {msg.content}
        </div>
      )}

      {msg.sources?.map((s, i) => (
        <div key={i} style={{
          maxWidth: '85%', marginTop: 6,
          padding: '8px 12px',
          borderRadius: 8, borderLeft: '3px solid var(--green)',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderLeftColor: 'var(--green)',
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginBottom: 3 }}>
            {s.label}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-sec)' }}>{s.quote}</div>
        </div>
      ))}

      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 4, padding: '0 4px' }}>
        {msg.timestamp}
      </span>
    </div>
  );
}

export default function Chat() {
  const userId = localStorage.getItem('echo_user_id') || 'demo_user';
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [updatesLoaded, setUpdatesLoaded] = useState(false);
  const [sessionId] = useState(`chat_${Date.now()}`);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (msg) => {
    setMessages(prev => [...prev, { ...msg, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
  };

  const fetchUpdates = async () => {
    setUpdatesLoaded(true);
    setLoading(true);
    try {
      const res = await sendChat('', 'updates', userId, sessionId);
      addMessage({ role: 'assistant', type: 'cards', cards: res.content });
    } catch (_) {
      addMessage({ role: 'assistant', type: 'text', content: 'Could not connect to Echo. Make sure your n8n webhook is running at the configured URL.' });
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput('');
    setUpdatesLoaded(true);
    addMessage({ role: 'user', type: 'text', content: msg });
    setLoading(true);
    try {
      const res = await sendChat(msg, 'query', userId, sessionId);
      addMessage({ role: 'assistant', type: 'text', content: res.response, sources: res.sources });
    } catch (_) {
      addMessage({ role: 'assistant', type: 'text', content: 'Connection error. Is your n8n webhook running?' });
    }
    setLoading(false);
  };

  const filteredMessages = messages.filter(m => {
    if (activeFilter === 'ALL') return true;
    if (m.type === 'cards') return m.cards?.some(c => c.domain === activeFilter);
    return true;
  });

  return (
    <PageLayout header="default">
      {/* Domain Filter Tabs */}
      <div style={{
        display: 'flex', gap: 0, overflowX: 'auto',
        borderBottom: '1px solid var(--border)',
        padding: '0 20px', position: 'sticky', top: 56, background: 'var(--bg)', zIndex: 90,
      }}>
        {DOMAINS.map(d => (
          <button
            key={d}
            onClick={() => setActiveFilter(d)}
            style={{
              background: 'none', border: 'none',
              padding: '12px 14px', whiteSpace: 'nowrap',
              fontFamily: 'var(--font-mono)', fontSize: 11,
              color: activeFilter === d ? 'var(--green)' : 'var(--text-muted)',
              borderBottom: activeFilter === d ? '2px solid var(--green)' : '2px solid transparent',
              cursor: 'pointer', transition: 'color 0.2s',
              marginBottom: -1,
            }}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Chat Body */}
      <div style={{ padding: '16px 20px', minHeight: 'calc(100vh - 200px)' }}>
        {/* Empty State */}
        {!updatesLoaded && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', textAlign: 'center',
            padding: '60px 20px', animation: 'fadeIn 0.4s ease',
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: 16,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, marginBottom: 16, color: 'var(--green)',
            }}>◎</div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 8 }}>
              What's happening in your world?
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-sec)', marginBottom: 24, maxWidth: 300, lineHeight: 1.6 }}>
              Echo fetches personalized updates based on your profile and current world signals.
            </p>
            <button
              className="btn-primary"
              onClick={fetchUpdates}
              style={{
                borderRadius: 24, fontSize: 14, padding: '12px 28px',
                animation: 'pulse 2s infinite',
              }}
            >
              ANY UPDATES?
            </button>
          </div>
        )}

        {/* Date separator */}
        {updatesLoaded && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
              TODAY, {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
        )}

        {filteredMessages.map((msg, i) => <ChatMessage key={i} msg={msg} />)}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16, animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 14 14">
                <circle cx="7" cy="7" r="3" fill="var(--green)" />
                <circle cx="7" cy="1.5" r="1.2" fill="var(--green)" opacity="0.5" />
                <circle cx="7" cy="12.5" r="1.2" fill="var(--green)" opacity="0.5" />
                <circle cx="1.5" cy="7" r="1.2" fill="var(--green)" opacity="0.5" />
                <circle cx="12.5" cy="7" r="1.2" fill="var(--green)" opacity="0.5" />
              </svg>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--green)' }}>ECHO INTELLIGENCE</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="typing-dots">
                <span /><span /><span />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                Echo is scanning world signals...
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div style={{
        position: 'fixed', bottom: 64, left: 0, right: 0,
        background: 'var(--bg)', borderTop: '1px solid var(--border)',
        padding: '12px 16px', maxWidth: 768, margin: '0 auto',
        display: 'flex', gap: 10, alignItems: 'center',
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask Echo anything..."
          disabled={loading}
          style={{
            flex: 1, padding: '10px 16px',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 24, color: 'var(--text)', fontSize: 14, outline: 'none',
            fontFamily: 'var(--font-body)', transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--border-active)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: input.trim() ? 'var(--green)' : 'var(--bg-elevated)',
            border: 'none', color: input.trim() ? 'var(--bg)' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, cursor: input.trim() ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s', flexShrink: 0,
          }}
        >
          ➤
        </button>
      </div>
    </PageLayout>
  );
}
