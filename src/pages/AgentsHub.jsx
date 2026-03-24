import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/Layout';
import { initAgent } from '../utils/api';

const AGENTS = [
  { name: 'Career', icon: '💼', color: '#FF4D4D', tagline: 'Job markets & skill trends', desc: 'Expert guidance for your professional journey', x: 50, y: 8 },
  { name: 'Finance', icon: '📊', color: '#FFB830', tagline: 'Economic signals & risk', desc: 'Personal finance intelligence and economic foresight', x: 82, y: 38 },
  { name: 'Health', icon: '🧠', color: '#00E676', tagline: 'Wellness & behavioral patterns', desc: 'Proactive health and wellbeing monitoring', x: 68, y: 78 },
  { name: 'Livelihood', icon: '🌾', color: '#4ADE80', tagline: 'Agriculture & gig economy', desc: 'Livelihood intelligence for rural and gig workers', x: 32, y: 78 },
  { name: 'Civic', icon: '🏙', color: '#60A5FA', tagline: 'Infrastructure & governance', desc: 'Civic intelligence and city-level risk prediction', x: 18, y: 38 },
];

export default function AgentsHub() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('echo_user_id') || 'demo_user';
  const [selected, setSelected] = useState(AGENTS[0]);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState('');

  const handleAgentClick = (agent) => {
    if (spinning) return;
    setSpinning(true);
    const spins = 360 * 2 + Math.random() * 360;
    setRotation(prev => prev + spins);
    setTimeout(() => {
      setSelected(agent);
      setSpinning(false);
    }, 1200);
  };

  const handleInitialize = async () => {
    setInitializing(true);
    setError('');
    try {
      const res = await initAgent(selected.name, userId);
      navigate('/agent-chat', { state: { agent: selected, openingMessage: res.openingMessage, contextStrip: res.contextStrip, sessionId: res.sessionId } });
    } catch (_) {
      setError('Could not connect to agent. Make sure your n8n webhook is running.');
      setInitializing(false);
    }
  };

  return (
    <PageLayout header="agents">
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 6 }}>
          ECOSYSTEM
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, letterSpacing: -0.5, marginBottom: 24 }}>
          AGENTS HUB
        </h1>

        {/* Wheel */}
        <div style={{ position: 'relative', width: '100%', maxWidth: 320, margin: '0 auto 24px', aspectRatio: '1' }}>
          {/* Outer dashed ring */}
          <svg style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            animation: 'rotateSlow 25s linear infinite',
          }} viewBox="0 0 320 320">
            <circle cx="160" cy="160" r="155" fill="none"
              stroke="var(--border)" strokeWidth="1"
              strokeDasharray="8 6" />
          </svg>

          {/* Connecting lines */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 320 320">
            {AGENTS.map(agent => {
              const ax = (agent.x / 100) * 320;
              const ay = (agent.y / 100) * 320;
              const isSelected = selected.name === agent.name;
              return (
                <line key={agent.name}
                  x1="160" y1="160" x2={ax} y2={ay}
                  stroke={isSelected ? agent.color : 'var(--border)'}
                  strokeWidth={isSelected ? 1.5 : 0.5}
                  strokeDasharray={isSelected ? '4 3' : 'none'}
                  opacity={isSelected ? 0.8 : 0.4}
                  style={{ transition: 'all 0.4s' }}
                />
              );
            })}
          </svg>

          {/* Center card */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: `translate(-50%, -50%) rotate(${spinning ? rotation : 0}deg)`,
            transition: spinning ? `transform 1.2s cubic-bezier(0.2, 0.8, 0.3, 1)` : 'none',
            width: 140, height: 140,
            borderRadius: '50%',
            background: `${selected.color}18`,
            border: `1.5px solid ${selected.color}55`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', padding: 12,
            zIndex: 10,
          }}>
            <span style={{ fontSize: 24, marginBottom: 4 }}>{selected.icon}</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
              {selected.name} Agent
            </span>
          </div>

          {/* Agent nodes */}
          {AGENTS.map(agent => {
            const isSelected = selected.name === agent.name;
            return (
              <button
                key={agent.name}
                onClick={() => handleAgentClick(agent)}
                style={{
                  position: 'absolute',
                  left: `${agent.x}%`, top: `${agent.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 52, height: 52, borderRadius: '50%',
                  background: isSelected ? `${agent.color}22` : 'var(--bg-elevated)',
                  border: `1px solid ${isSelected ? agent.color : 'var(--border)'}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: isSelected ? `0 0 12px ${agent.color}44` : 'none',
                  zIndex: 20,
                }}
              >
                <span style={{ fontSize: 18 }}>{agent.icon}</span>
              </button>
            );
          })}
        </div>

        {/* Agent labels */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
          {AGENTS.map(agent => (
            <button
              key={agent.name}
              onClick={() => handleAgentClick(agent)}
              style={{
                background: selected.name === agent.name ? `${agent.color}18` : 'var(--bg-card)',
                border: `1px solid ${selected.name === agent.name ? agent.color : 'var(--border)'}`,
                borderRadius: 20, padding: '5px 12px',
                fontFamily: 'var(--font-mono)', fontSize: 10,
                color: selected.name === agent.name ? agent.color : 'var(--text-muted)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {agent.name.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Selected Agent Info */}
        <div className="card" style={{ marginBottom: 12, borderColor: `${selected.color}44`, animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: `${selected.color}22`, border: `1px solid ${selected.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>{selected.icon}</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15 }}>
                {selected.name} Agent
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: selected.color }}>
                {selected.tagline.toUpperCase()}
              </div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-sec)', lineHeight: 1.6, marginBottom: 14 }}>
            {selected.desc}
          </p>
          {error && (
            <div style={{ padding: 10, background: 'rgba(255,77,77,0.1)', borderRadius: 8, fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>
              {error}
            </div>
          )}
          <button
            className="btn-primary"
            onClick={handleInitialize}
            disabled={initializing || spinning}
            style={{ width: '100%', justifyContent: 'center', background: selected.color, color: '#080C08' }}
          >
            {initializing ? <><div className="spinner" /> CONNECTING...</> : 'INITIALIZE'}
          </button>
        </div>

        {/* Bottom cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Recent Sessions</div>
            <div style={{ fontSize: 12, color: 'var(--text-sec)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: selected.color }} />
              {selected.name} Agent
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>
              LAST_ACTIVE: 2M AGO
            </div>
          </div>
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Agent Skills</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {selected.name === 'Career' && ['Job Analysis', 'Skill Gap', 'Interview Prep'].map(s => (
                <span key={s} className="badge badge-muted" style={{ fontSize: 9 }}>{s}</span>
              ))}
              {selected.name === 'Finance' && ['Budget Risk', 'Market Scan', 'Scheme Match'].map(s => (
                <span key={s} className="badge badge-muted" style={{ fontSize: 9 }}>{s}</span>
              ))}
              {selected.name === 'Health' && ['Risk Detection', 'Burnout Flags', 'Pattern Scan'].map(s => (
                <span key={s} className="badge badge-muted" style={{ fontSize: 9 }}>{s}</span>
              ))}
              {selected.name === 'Livelihood' && ['Crop Prices', 'Scheme Alert', 'Weather Risk'].map(s => (
                <span key={s} className="badge badge-muted" style={{ fontSize: 9 }}>{s}</span>
              ))}
              {selected.name === 'Civic' && ['Water Risk', 'Policy Track', 'Infra Alert'].map(s => (
                <span key={s} className="badge badge-muted" style={{ fontSize: 9 }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
