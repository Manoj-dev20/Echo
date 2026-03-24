import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PageLayout } from '../components/Layout';
import { sendAgentChat } from '../utils/api';

export default function AgentChat() {
  const navigate = useNavigate();
  const location = useLocation();
  const { agent, openingMessage, contextStrip, sessionId: initSessionId } = location.state || {};

  const userId = localStorage.getItem('echo_user_id') || 'demo_user';
  const [sessionId] = useState(initSessionId || `agent_${Date.now()}`);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  const agentName = agent?.name || 'Career';
  const agentColor = agent?.color || '#FF4D4D';
  const agentIcon = agent?.icon || '💼';

  useEffect(() => {
    if (openingMessage) {
      setMessages([{
        role: 'agent',
        content: openingMessage,
        sources: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
  }, [openingMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = {
      role: 'user',
      content: msg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await sendAgentChat(agentName, msg, userId, sessionId);
      setMessages(prev => [...prev, {
        role: 'agent',
        content: res.response,
        sources: res.sources || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } catch (_) {
      setMessages(prev => [...prev, {
        role: 'agent',
        content: 'Connection error. Make sure your n8n webhook is running.',
        sources: [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
    setLoading(false);
  };

  if (!agent) {
    return (
      <PageLayout header="agent" agentName="Unknown" onBack={() => navigate('/agents')}>
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-sec)' }}>
          No agent selected. <button className="btn-outline" onClick={() => navigate('/agents')} style={{ marginTop: 12 }}>Go back</button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout header="agent" agentName={agentName} agentColor={agentColor} onBack={() => navigate('/agents')} noNav>
      {/* Context strip */}
      <div style={{
        padding: '8px 16px', background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>
          SYSTEM_LOG // CONTEXT_INITIATED
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-sec)' }}>
          {contextStrip || `${agentName} Agent is analyzing based on: Your profile + Live signals + Commitment history`}
        </div>
      </div>

      {/* Messages */}
      <div style={{ padding: '16px 20px', minHeight: 'calc(100vh - 260px)', paddingBottom: 120 }}>
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          return (
            <div key={i} style={{
              display: 'flex', flexDirection: 'column',
              alignItems: isUser ? 'flex-end' : 'flex-start',
              marginBottom: 20, animation: 'fadeUp 0.3s ease',
            }}>
              {!isUser && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: `${agentColor}22`, border: `1px solid ${agentColor}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
                  }}>
                    {agentIcon}
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10,
                    color: agentColor, letterSpacing: 1,
                  }}>
                    {agentName.toUpperCase()}_AGENT.SYS
                  </span>
                </div>
              )}

              {isUser ? (
                <div style={{
                  maxWidth: '80%', padding: '10px 16px',
                  borderRadius: '16px 16px 4px 16px',
                  background: 'var(--green)', color: 'var(--bg)',
                  fontSize: 14, lineHeight: 1.6,
                }}>
                  {msg.content}
                </div>
              ) : (
                <div style={{ maxWidth: '90%' }}>
                  <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7 }}>
                    {msg.content}
                  </p>
                  {msg.sources?.map((s, j) => (
                    <div key={j} style={{
                      marginTop: 8, padding: '8px 12px',
                      borderLeft: `3px solid ${agentColor}`,
                      background: 'var(--bg-card)', borderRadius: '0 8px 8px 0',
                    }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>
                        {s.label}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-sec)', fontStyle: 'italic' }}>
                        "{s.quote}"
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>
                {isUser ? `${msg.timestamp}  SENT` : msg.timestamp}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {loading && (
          <div style={{ animation: 'fadeIn 0.3s ease', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: `${agentColor}22`, border: `1px solid ${agentColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
              }}>
                {agentIcon}
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: agentColor }}>
                {agentName.toUpperCase()}_AGENT.SYS
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="typing-dots">
                <span style={{ background: agentColor }} />
                <span style={{ background: agentColor }} />
                <span style={{ background: agentColor }} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                ANALYZING SIGNALS...
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Bottom input */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--bg)', maxWidth: 768, margin: '0 auto',
      }}>
        <div style={{
          padding: '4px 16px', borderTop: '1px solid var(--border)',
          fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)',
        }}>
          AGENTS HUB / {agentName.toUpperCase()} AGENT
        </div>
        <div style={{ padding: '8px 16px 16px', display: 'flex', gap: 10 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder={`Ask ${agentName} Agent anything...`}
            disabled={loading}
            style={{
              flex: 1, padding: '10px 16px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 12, color: 'var(--text)', fontSize: 13,
              outline: 'none', fontFamily: 'var(--font-body)',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = agentColor}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            style={{
              width: 40, height: 40, borderRadius: 10,
              background: input.trim() ? agentColor : 'var(--bg-elevated)',
              border: 'none', color: input.trim() ? '#080C08' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, cursor: input.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s', flexShrink: 0,
            }}
          >➤</button>
        </div>
        <div style={{ padding: '0 16px 8px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>
            SYSTEM_READY_V1.0
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--green)' }}>
            CONTEXT_ACTIVE
          </span>
        </div>
      </div>
    </PageLayout>
  );
}
