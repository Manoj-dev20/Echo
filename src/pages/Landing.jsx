import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Layout';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 768, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        height: 56, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 24px',
        borderBottom: '1px solid var(--border)',
      }}>
        <Logo />
        <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>⚙</button>
      </header>

      {/* Hero */}
      <main style={{ flex: 1, padding: '48px 24px 40px', display: 'flex', flexDirection: 'column' }}>
        <div className="badge badge-green" style={{ alignSelf: 'flex-start', marginBottom: 28 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
          SYSTEM ONLINE
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(42px, 8vw, 64px)',
          fontWeight: 700, lineHeight: 1.1, marginBottom: 20,
          animation: 'fadeUp 0.5s ease both',
        }}>
          The world is changing.<br />
          Know how it affects{' '}
          <span style={{ color: 'var(--green)' }}>YOU.</span>
        </h1>

        <p style={{
          color: 'var(--text-sec)', fontSize: 16, lineHeight: 1.7,
          maxWidth: 480, marginBottom: 36,
          animation: 'fadeUp 0.5s 0.1s ease both',
        }}>
          Echo connects real-world signals to your personal reality.
          Personalized intelligence. Zero noise.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', animation: 'fadeUp 0.5s 0.2s ease both' }}>
          <button
            className="btn-primary"
            onClick={() => navigate('/setup')}
            style={{ fontSize: 15, padding: '14px 32px' }}
          >
            GET STARTED →
          </button>
          <button
            className="btn-outline"
            onClick={() => navigate('/dashboard')}
            style={{ fontSize: 14 }}
          >
            Sign in
          </button>
        </div>

        {/* Steps */}
        <div style={{
          display: 'flex', gap: 0, marginTop: 64, position: 'relative',
          animation: 'fadeUp 0.5s 0.3s ease both',
        }}>
          {[
            { num: '01', label: 'SYNC', desc: 'Upload your AI memory export', icon: '↑' },
            { num: '02', label: 'LEARN', desc: 'Echo builds your personal profile', icon: '◎' },
            { num: '03', label: 'PREDICT', desc: 'Get warned before the world affects you', icon: '◈' },
          ].map((step, i) => (
            <div key={step.num} style={{ flex: 1, position: 'relative' }}>
              {i < 2 && (
                <div style={{
                  position: 'absolute', top: 24, left: '60%', right: '-10%',
                  height: 1, borderTop: '1px dashed var(--border)',
                }} />
              )}
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, color: 'var(--green)', marginBottom: 14,
              }}>
                {step.icon}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>
                {step.num} / {step.label}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-sec)', lineHeight: 1.5 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '20px 24px', borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
          © 2026 ECHO_CORE. ALL_SYSTEMS_OPERATIONAL.
        </span>
        <div style={{ display: 'flex', gap: 20 }}>
          {['SYNC', 'LEARN', 'PREDICT'].map(l => (
            <span key={l} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}
