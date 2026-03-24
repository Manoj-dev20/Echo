import { useState, useEffect } from 'react';
import { PageLayout } from '../components/Layout';
import { loadAlerts, updateAlert } from '../utils/api';

const DOMAIN_COLORS = {
  CAREER: '#FF4D4D', FINANCE: '#FFB830', HEALTH: '#00E676',
  LIVELIHOOD: '#4ADE80', CIVIC: '#60A5FA',
};
const FILTERS = ['ALL', 'CAREER', 'FINANCE', 'HEALTH', 'LIVELIHOOD', 'CIVIC'];

function AlertCard({ alert, onStatusChange }) {
  const color = DOMAIN_COLORS[alert.domain?.toUpperCase()] || 'var(--green)';
  const [updating, setUpdating] = useState(false);

  const statusBadge = {
    NEW: 'badge-red',
    SEEN: 'badge-muted',
    ACTED: 'badge-green',
    RESOLVED: 'badge-muted',
  };

  const handleAct = async () => {
    setUpdating(true);
    try {
      await onStatusChange(alert.alertId, 'ACTED');
    } catch (_) {}
    setUpdating(false);
  };

  return (
    <div style={{
      background: 'var(--bg-card)', borderRadius: 'var(--radius)',
      border: '1px solid var(--border)', borderLeft: `4px solid ${color}`,
      padding: 16, marginBottom: 12, animation: 'fadeUp 0.3s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={`badge ${statusBadge[alert.status] || 'badge-muted'}`} style={{ fontSize: 9 }}>
            {alert.status}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>
            DOMAIN / {alert.domain?.toUpperCase()}
          </span>
        </div>
        {alert.status === 'ACTED' ? (
          <span style={{ fontSize: 14, color: 'var(--green)' }}>✓</span>
        ) : (
          <span style={{ color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>⋮</span>
        )}
      </div>

      <h3 style={{
        fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600,
        color: 'var(--text)', lineHeight: 1.4, marginBottom: 12,
      }}>
        {alert.headline}
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
        {[
          { label: 'IMPACT', val: alert.impactScore },
          { label: 'TIMELINE', val: alert.timeline },
          { label: 'CONF', val: alert.confidence },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'var(--bg)', borderRadius: 8, padding: '8px 10px',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', marginBottom: 3 }}>
              {stat.label}
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 500,
              color: stat.label === 'IMPACT' ? color :
                     stat.label === 'CONF' ? (stat.val === 'HIGH' ? 'var(--red)' : stat.val === 'MEDIUM' ? 'var(--amber)' : 'var(--text-sec)') :
                     'var(--text)',
            }}>
              {stat.val}
            </div>
          </div>
        ))}
      </div>

      {alert.status !== 'ACTED' && alert.status !== 'RESOLVED' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button className="btn-primary" style={{ justifyContent: 'center', fontSize: 12, padding: '10px' }}>
            VIEW FULL REPORT →
          </button>
          <button
            onClick={handleAct}
            disabled={updating}
            className="btn-outline"
            style={{ fontSize: 12, padding: '10px', textAlign: 'center' }}
          >
            {updating ? <div className="spinner" style={{ margin: '0 auto' }} /> : 'MARK AS ACTED'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Alerts() {
  const userId = localStorage.getItem('echo_user_id') || 'demo_user';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [error, setError] = useState('');

  const fetchAlerts = (domain = null) => {
    setLoading(true);
    loadAlerts(userId, domain !== 'ALL' ? domain : null)
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Could not load alerts. Is your n8n webhook running?'); setLoading(false); });
  };

  useEffect(() => { fetchAlerts(); }, []);

  const handleFilter = (f) => {
    setActiveFilter(f);
    fetchAlerts(f);
  };

  const handleStatusChange = async (alertId, status) => {
    await updateAlert(alertId, status, userId);
    fetchAlerts(activeFilter);
  };

  return (
    <PageLayout header="default">
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 4 }}>
              INTELLIGENCE LOG
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700 }}>ALERTS</h1>
          </div>
          <button style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', color: 'var(--text-sec)', cursor: 'pointer', fontSize: 14 }}>
            ▼
          </button>
        </div>

        {/* Domain filter tabs */}
        <div style={{
          display: 'flex', gap: 0, overflowX: 'auto',
          borderBottom: '1px solid var(--border)', marginTop: 12,
        }}>
          {FILTERS.map(f => {
            const count = data?.domainCounts?.[f.toLowerCase()];
            return (
              <button
                key={f}
                onClick={() => handleFilter(f)}
                style={{
                  background: 'none', border: 'none',
                  padding: '10px 12px', whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  color: activeFilter === f ? 'var(--green)' : 'var(--text-muted)',
                  borderBottom: activeFilter === f ? '2px solid var(--green)' : '2px solid transparent',
                  cursor: 'pointer', marginBottom: -1,
                }}
              >
                {f}{count ? ` (${count})` : ''}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh', gap: 12 }}>
            <div className="spinner" style={{ width: 24, height: 24 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>Loading alerts...</span>
          </div>
        ) : error ? (
          <div style={{ padding: '20px 0' }}>
            <div style={{ padding: 16, background: 'rgba(255,77,77,0.08)', border: '1px solid rgba(255,77,77,0.3)', borderRadius: 'var(--radius)', color: 'var(--red)', fontSize: 13 }}>
              {error}
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            {data?.stats && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 16, marginBottom: 16 }}>
                {[
                  { label: 'ACTIVE', val: String(data.stats.active).padStart(2, '0'), color: 'var(--red)' },
                  { label: 'ACTED ON', val: String(data.stats.actedOn).padStart(2, '0'), color: 'var(--text-sec)' },
                  { label: 'RESOLVED', val: String(data.stats.resolved).padStart(2, '0'), color: 'var(--text-muted)' },
                ].map(s => (
                  <div key={s.label} className="card" style={{ padding: '12px 14px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 500, color: s.color }}>{s.val}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Alert cards */}
            {data?.alerts?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>🛡</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, marginBottom: 6 }}>No alerts in this domain</div>
                <div style={{ fontSize: 13 }}>Your agents are watching.</div>
              </div>
            ) : (
              data?.alerts?.map((alert, i) => (
                <AlertCard key={alert.alertId || i} alert={alert} onStatusChange={handleStatusChange} />
              ))
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}
