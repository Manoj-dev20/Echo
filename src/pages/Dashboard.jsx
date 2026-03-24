import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/Layout';
import { loadDashboard, answerFollowUp, saveCommitment } from '../utils/api';

const DOMAIN_CONFIG = {
  career: { label: 'CAREER', color: '#FF4D4D' },
  finance: { label: 'FINANCE', color: '#FFB830' },
  health: { label: 'HEALTH', color: '#00E676' },
  civic: { label: 'CIVIC', color: '#60A5FA' },
};

function ArcMeter({ score, color, size = 80 }) {
  const r = (size / 2) - 8;
  const circ = Math.PI * r;
  const offset = circ - (circ * Math.min(score, 100)) / 100;

  return (
    <svg width={size} height={size / 2 + 8} viewBox={`0 0 ${size} ${size / 2 + 8}`}>
      <path
        d={`M ${8} ${size / 2} A ${r} ${r} 0 0 1 ${size - 8} ${size / 2}`}
        fill="none" stroke="var(--border)" strokeWidth="4" strokeLinecap="round"
      />
      <path
        d={`M ${8} ${size / 2} A ${r} ${r} 0 0 1 ${size - 8} ${size / 2}`}
        fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      />
    </svg>
  );
}

function DomainCard({ domain, data }) {
  const navigate = useNavigate();
  const cfg = DOMAIN_CONFIG[domain];
  const badgeMap = { URGENT: 'badge-red', WATCH: 'badge-amber', SAFE: 'badge-green' };

  return (
    <div
      className="card"
      onClick={() => navigate('/chat')}
      style={{ cursor: 'pointer', transition: 'border-color 0.2s', animation: 'fadeUp 0.4s ease both' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = cfg.color + '55'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1 }}>
          {cfg.label}
        </span>
        <span className={`badge ${badgeMap[data.badge] || 'badge-muted'}`} style={{ fontSize: 9, padding: '2px 8px' }}>
          {data.badge}
        </span>
      </div>
      <ArcMeter score={data.score} color={cfg.color} size={72} />
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 36, fontWeight: 500, color: cfg.color }}>
          {data.score}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>/100</span>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-sec)', marginTop: 6, lineHeight: 1.4 }}>{data.summary}</p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('echo_user_id') || 'demo_user';
  const isFirstVisit = localStorage.getItem('echo_first_visit') === 'true';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followUpAnswered, setFollowUpAnswered] = useState(false);
  const [profileConfirmed, setProfileConfirmed] = useState(!isFirstVisit);
  const [commitment, setCommitment] = useState('');
  const [showCommitInput, setShowCommitInput] = useState(false);
  const [savingCommit, setSavingCommit] = useState(false);

  useEffect(() => {
    loadDashboard(userId)
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Could not load dashboard. Is your n8n webhook running?'); setLoading(false); });
  }, [userId]);

  const handleFollowUp = async (answer) => {
    setFollowUpAnswered(true);
    try {
      await answerFollowUp(answer, data.followUpQuestion, userId);
    } catch (_) {}
  };

  const handleProfileConfirm = () => {
    setProfileConfirmed(true);
    localStorage.setItem('echo_first_visit', 'false');
  };

  const handleCommitment = async () => {
    if (!commitment.trim()) return;
    setSavingCommit(true);
    try {
      await saveCommitment(commitment, userId);
      setCommitment('');
      setShowCommitInput(false);
    } catch (_) {}
    setSavingCommit(false);
  };

  if (loading) {
    return (
      <PageLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
          <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
            Loading your intelligence briefing...
          </p>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div style={{ padding: 24 }}>
          <div style={{ padding: 20, background: 'rgba(255,77,77,0.08)', border: '1px solid rgba(255,77,77,0.3)', borderRadius: 'var(--radius)', color: 'var(--red)', fontSize: 14, lineHeight: 1.6 }}>
            <strong>Connection Error</strong><br />{error}
            <br /><br />
            <button className="btn-outline" onClick={() => window.location.reload()} style={{ fontSize: 13 }}>Retry</button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div style={{ padding: '20px 20px 0' }}>
        {/* Welcome */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1 }}>
            WELCOME BACK, {data?.userName?.toUpperCase() || 'USER'}
          </span>
          <span className="badge badge-green" style={{ fontSize: 9, padding: '1px 8px' }}>● ACTIVE_SESSION</span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 7vw, 48px)',
          fontWeight: 700, lineHeight: 1.1, marginBottom: 24,
          animation: 'fadeUp 0.4s ease both',
        }}>
          The world is changing{' '}
          <span style={{ color: 'var(--green)' }}>so should you.</span>
        </h1>

        {/* Profile Summary Card — First Visit Only */}
        {!profileConfirmed && data?.profileSummary && (
          <div className="card" style={{
            borderColor: 'var(--green)', borderLeftWidth: 3,
            marginBottom: 16, animation: 'fadeUp 0.4s 0.1s ease both',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--green)', marginBottom: 8, letterSpacing: 1 }}>
              ● ECHO HAS READ YOUR PROFILE
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-sec)', lineHeight: 1.6, marginBottom: 14 }}>
              "{data.profileSummary}"
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-primary" onClick={handleProfileConfirm} style={{ fontSize: 13, padding: '8px 20px' }}>
                Yes, that's me
              </button>
              <button className="btn-outline" onClick={handleProfileConfirm} style={{ fontSize: 13, padding: '8px 16px' }}>
                Correct it
              </button>
            </div>
          </div>
        )}

        {/* Follow-up Question */}
        {data?.followUpQuestion && !followUpAnswered && (
          <div className="card" style={{ marginBottom: 16, animation: 'fadeUp 0.4s 0.15s ease both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span className="badge badge-muted" style={{ fontSize: 9 }}>● FOLLOW-UP FROM EARLIER</span>
              <span style={{ fontSize: 18 }}>🎓</span>
            </div>
            <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', marginBottom: 14 }}>
              {data.followUpQuestion}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn-primary"
                onClick={() => handleFollowUp('yes')}
                style={{ fontSize: 13, padding: '10px 24px' }}
              >Yes</button>
              <button
                className="btn-outline"
                onClick={() => handleFollowUp('no')}
                style={{ fontSize: 13, padding: '10px 20px' }}
              >Not yet</button>
            </div>
          </div>
        )}

        {/* Domain Scores */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1 }}>
              YOUR WORLD SIGNALS
            </span>
            <button
              onClick={() => { setLoading(true); loadDashboard(userId).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false)); }}
              style={{ background: 'none', border: 'none', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              ↻ REFRESH
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {data?.domainScores && Object.entries(data.domainScores).map(([domain, info]) => (
              <DomainCard key={domain} domain={domain} data={info} />
            ))}
          </div>
        </div>

        {/* Profile Depth Card */}
        {data?.profileDepth && (
          <div className="card" style={{ marginBottom: 16, animation: 'fadeUp 0.4s 0.2s ease both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1 }}>
                PROFILE DEPTH
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--green)' }}>
                {data.profileDepth.completeness}%
              </span>
            </div>
            <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, marginBottom: 12, overflow: 'hidden' }}>
              <div style={{
                height: '100%', background: 'var(--green)', borderRadius: 2,
                width: `${data.profileDepth.completeness}%`,
                transition: 'width 1s ease',
              }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[
                { label: 'Goals tracked', val: data.profileDepth.goalsTracked },
                { label: 'Active commits', val: data.profileDepth.activeCommitments },
                { label: 'Last updated', val: data.profileDepth.lastUpdated },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 500, color: 'var(--text)' }}>
                    {s.val}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Commitment FAB */}
      <div style={{ position: 'fixed', bottom: 80, right: 20, zIndex: 50 }}>
        {showCommitInput ? (
          <div className="card" style={{
            position: 'absolute', bottom: 60, right: 0, width: 280,
            animation: 'fadeUp 0.2s ease',
          }}>
            <p style={{ fontSize: 12, color: 'var(--text-sec)', marginBottom: 8 }}>
              Tell Echo something you're planning to do...
            </p>
            <input
              value={commitment}
              onChange={e => setCommitment(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCommitment()}
              placeholder="I will complete DSA by Friday..."
              autoFocus
              style={{
                width: '100%', padding: '10px 12px', background: 'var(--bg)',
                border: '1px solid var(--border-active)', borderRadius: 10,
                color: 'var(--text)', fontSize: 13, outline: 'none', marginBottom: 10,
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn-primary"
                onClick={handleCommitment}
                disabled={savingCommit}
                style={{ flex: 1, justifyContent: 'center', padding: '8px', fontSize: 13 }}
              >
                {savingCommit ? <div className="spinner" /> : 'Commit'}
              </button>
              <button className="btn-outline" onClick={() => setShowCommitInput(false)} style={{ padding: '8px 12px', fontSize: 13 }}>
                ✕
              </button>
            </div>
          </div>
        ) : null}
        <button
          onClick={() => setShowCommitInput(!showCommitInput)}
          style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'var(--green)', border: 'none',
            color: 'var(--bg)', fontSize: 24, fontWeight: 300,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0,230,118,0.3)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {showCommitInput ? '✕' : '+'}
        </button>
      </div>
    </PageLayout>
  );
}
