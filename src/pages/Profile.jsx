import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/Layout';
import { loadProfile } from '../utils/api';

export default function Profile() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('echo_user_id') || 'demo_user';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile(userId)
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Could not load profile. Is your n8n webhook running?'); setLoading(false); });
  }, [userId]);

  const handleClearProfile = () => {
    if (window.confirm('Clear your Echo profile and start over?')) {
      localStorage.clear();
      navigate('/');
    }
  };

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 10 }}>
        {title}
      </div>
      {children}
    </div>
  );

  const Tag = ({ label, color }) => (
    <span style={{
      padding: '4px 10px', borderRadius: 20, fontSize: 12,
      background: color ? `${color}18` : 'var(--bg-elevated)',
      border: `1px solid ${color ? `${color}44` : 'var(--border)'}`,
      color: color || 'var(--text-sec)',
    }}>{label}</span>
  );

  if (loading) {
    return (
      <PageLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 12 }}>
          <div className="spinner" style={{ width: 24, height: 24 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>Loading profile...</span>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div style={{ padding: 20 }}>
          <div style={{ padding: 16, background: 'rgba(255,77,77,0.08)', border: '1px solid rgba(255,77,77,0.3)', borderRadius: 'var(--radius)', color: 'var(--red)', fontSize: 13 }}>
            {error}
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout header="default">
      <div style={{ padding: '20px 20px 0' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 20 }}>
          Your Profile
        </h1>

        {/* Profile Summary */}
        {data?.profileSummary && (
          <div className="card" style={{ marginBottom: 20, borderColor: 'var(--green)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--green)', marginBottom: 8 }}>
              WHAT ECHO KNOWS ABOUT YOU
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-sec)', lineHeight: 1.7 }}>
              "{data.profileSummary}"
            </p>
          </div>
        )}

        {/* Profile completeness */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>PROFILE DEPTH</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--green)' }}>{data?.completeness || 0}%</span>
          </div>
          <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--green)', borderRadius: 2, width: `${data?.completeness || 0}%`, transition: 'width 1s ease' }} />
          </div>
        </div>

        {/* Core Info */}
        <Section title="CORE IDENTITY">
          <div className="card">
            {[
              { label: 'Name', val: data?.name },
              { label: 'Career Stage', val: data?.careerStage },
              { label: 'Domain', val: data?.domain },
              { label: 'City', val: data?.city },
              { label: 'Finance', val: data?.financeSituation },
            ].filter(r => r.val).map(row => (
              <div key={row.label} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '8px 0', borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{row.label}</span>
                <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{row.val}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Goals */}
        {data?.goals?.length > 0 && (
          <Section title="GOALS TRACKED">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {data.goals.map((g, i) => <Tag key={i} label={g} color="var(--green)" />)}
            </div>
          </Section>
        )}

        {/* Active Commitments */}
        {data?.activeCommitments?.length > 0 && (
          <Section title="ACTIVE COMMITMENTS">
            {data.activeCommitments.map((c, i) => (
              <div key={i} className="card" style={{ marginBottom: 8, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 4 }}>{c.commitment}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>
                      Added {c.addedDate} • Deadline {c.deadline}
                    </div>
                  </div>
                  <span className={`badge ${c.status === 'OVERDUE' ? 'badge-red' : 'badge-amber'}`} style={{ fontSize: 9, marginLeft: 8 }}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </Section>
        )}

        {/* Interests */}
        {data?.interests?.length > 0 && (
          <Section title="INTERESTS">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {data.interests.map((item, i) => <Tag key={i} label={item} />)}
            </div>
          </Section>
        )}

        {/* Concerns */}
        {data?.concerns?.length > 0 && (
          <Section title="CONCERNS BEING MONITORED">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {data.concerns.map((c, i) => <Tag key={i} label={c} color="var(--amber)" />)}
            </div>
          </Section>
        )}

        {/* Recent Updates */}
        {data?.recentUpdates?.length > 0 && (
          <Section title="RECENT PROFILE UPDATES">
            {data.recentUpdates.map((u, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, padding: '8px 0',
                borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', marginTop: 6, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-sec)' }}>{u.description}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>
                    {u.timestamp} • via {u.source}
                  </div>
                </div>
              </div>
            ))}
          </Section>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24, marginBottom: 8 }}>
          <button
            className="btn-outline"
            onClick={() => navigate('/setup')}
            style={{ width: '100%', textAlign: 'center', padding: 12 }}
          >
            ↑ Re-upload Memory Export
          </button>
          <button
            onClick={handleClearProfile}
            style={{
              width: '100%', padding: 12, textAlign: 'center',
              background: 'rgba(255,77,77,0.08)', border: '1px solid rgba(255,77,77,0.3)',
              borderRadius: 12, color: 'var(--red)', fontSize: 14, cursor: 'pointer',
            }}
          >
            🗑 Clear Profile & Restart
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
