import { useNavigate, useLocation } from 'react-router-dom';

export function Header({ variant = 'default', agentName, agentColor, onBack }) {
  const navigate = useNavigate();

  if (variant === 'agent') {
    return (
      <header style={{
        height: 56, background: 'var(--bg)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', color: 'var(--text-sec)',
          fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
        }}>
          ← <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>Agents Hub</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: agentColor ? `${agentColor}22` : 'var(--bg-elevated)',
            border: `1px solid ${agentColor || 'var(--border)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
          }}>
            {agentName === 'Career' ? '💼' : agentName === 'Finance' ? '📊' :
             agentName === 'Health' ? '🧠' : agentName === 'Livelihood' ? '🌾' : '🏙'}
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15 }}>
            {agentName} Agent
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--green)' }}>ACTIVE</span>
        </div>
      </header>
    );
  }

  if (variant === 'minimal') {
    return (
      <header style={{
        height: 56, background: 'var(--bg)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Logo />
        {variant === 'landing' && (
          <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            ⚙
          </button>
        )}
      </header>
    );
  }

  return (
    <header style={{
      height: 56, background: 'var(--bg)', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', position: 'sticky', top: 0, zIndex: 100,
    }}>
      <Logo />
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {variant === 'agents' && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
            AGENTS ACTIVE: <span style={{ color: 'var(--green)' }}>5/5</span>
          </span>
        )}
        <button style={{ background: 'none', border: 'none', color: 'var(--text-sec)', cursor: 'pointer', fontSize: 16 }}>🔍</button>
        <button style={{ background: 'none', border: 'none', color: 'var(--text-sec)', cursor: 'pointer', fontSize: 16, position: 'relative' }}>
          🔔
        </button>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--bg-elevated)', border: '1px solid var(--border-active)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--green)',
          cursor: 'pointer',
        }}>A</div>
      </div>
    </header>
  );
}

export function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="3" fill="var(--green)" />
        <circle cx="9" cy="2" r="1.5" fill="var(--green)" opacity="0.7" />
        <circle cx="9" cy="16" r="1.5" fill="var(--green)" opacity="0.7" />
        <circle cx="2" cy="9" r="1.5" fill="var(--green)" opacity="0.7" />
        <circle cx="16" cy="9" r="1.5" fill="var(--green)" opacity="0.7" />
        <line x1="9" y1="3.5" x2="9" y2="6" stroke="var(--green)" strokeWidth="1" opacity="0.5" />
        <line x1="9" y1="12" x2="9" y2="14.5" stroke="var(--green)" strokeWidth="1" opacity="0.5" />
        <line x1="3.5" y1="9" x2="6" y2="9" stroke="var(--green)" strokeWidth="1" opacity="0.5" />
        <line x1="12" y1="9" x2="14.5" y2="9" stroke="var(--green)" strokeWidth="1" opacity="0.5" />
      </svg>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: 1 }}>ECHO</span>
    </div>
  );
}

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const tabs = [
    { icon: '⌂', label: 'HOME', path: '/dashboard' },
    { icon: '◻', label: 'CHAT', path: '/chat' },
    { icon: '⬡', label: 'AGENTS', path: '/agents' },
    { icon: '⚑', label: 'ALERTS', path: '/alerts' },
    { icon: '◉', label: 'PROFILE', path: '/profile' },
  ];

  return (
    <nav style={{
      height: 64, background: 'var(--bg)', borderTop: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      maxWidth: 768, margin: '0 auto',
    }}>
      {tabs.map(tab => {
        const active = path === tab.path || (tab.path === '/dashboard' && path === '/');
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              background: active ? 'var(--bg-elevated)' : 'none',
              border: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '6px 16px', borderRadius: 12,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: 18, color: active ? 'var(--green)' : 'var(--text-muted)' }}>
              {tab.icon}
            </span>
            <span style={{
              fontSize: 9, fontFamily: 'var(--font-mono)',
              color: active ? 'var(--green)' : 'var(--text-muted)',
              fontWeight: active ? 500 : 400, letterSpacing: 0.5,
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export function PageLayout({ children, header = 'default', agentName, agentColor, onBack, noNav = false }) {
  return (
    <div style={{ maxWidth: 768, margin: '0 auto', minHeight: '100vh', position: 'relative' }}>
      <Header variant={header} agentName={agentName} agentColor={agentColor} onBack={onBack} />
      <main style={{ paddingBottom: noNav ? 0 : 80 }}>
        {children}
      </main>
      {!noNav && <BottomNav />}
    </div>
  );
}
