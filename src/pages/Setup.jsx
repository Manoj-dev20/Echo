import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Layout';
import { uploadMemory } from '../utils/api';

const STEPS = ['SYNC', 'VERIFY', 'LAUNCH'];

export default function Setup() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [activeTab, setActiveTab] = useState('CHATGPT');
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  const processingMessages = [
    'Reading your conversations...',
    'Mapping your interests...',
    'Identifying your goals...',
    'Building knowledge graph...',
    'Launching Echo...',
  ];

  const tabs = ['CHATGPT', 'CLAUDE', 'GEMINI', 'OTHER'];

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  const handleContinue = async () => {
    if (!file && !rawText.trim()) {
      setError('Please upload a file or paste your conversation text.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      let content = rawText;
      if (file) {
        content = await file.text();
      }

      const userId = `user_${Date.now()}`;
      localStorage.setItem('echo_user_id', userId);
      localStorage.setItem('echo_first_visit', 'true');

      setLoading(false);
      setProcessing(true);

      // Cycle through processing messages
      let step = 0;
      const interval = setInterval(() => {
        step++;
        setProcessingStep(step);
        if (step >= processingMessages.length - 1) clearInterval(interval);
      }, 1000);

      await uploadMemory(content, userId);

      clearInterval(interval);
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err) {
      setLoading(false);
      setProcessing(false);
      setError('Could not connect to Echo. Make sure your n8n webhook is running.');
    }
  };

  if (processing) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'var(--bg)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 24, zIndex: 1000,
        animation: 'fadeIn 0.3s ease',
      }}>
        {/* Progress ring */}
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border)" strokeWidth="3" />
          <circle
            cx="40" cy="40" r="34" fill="none"
            stroke="var(--green)" strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="213"
            strokeDashoffset={213 - (213 * (processingStep + 1)) / processingMessages.length}
            transform="rotate(-90 40 40)"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--green)',
          animation: 'fadeIn 0.4s ease', minHeight: 20,
          key: processingStep,
        }}>
          {processingMessages[Math.min(processingStep, processingMessages.length - 1)]}
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>This only happens once.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 768, margin: '0 auto', minHeight: '100vh' }}>
      <header style={{
        height: 56, display: 'flex', alignItems: 'center',
        padding: '0 24px', borderBottom: '1px solid var(--border)',
      }}>
        <Logo />
      </header>

      {/* Progress Steps */}
      <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
        {STEPS.map((step, i) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: i === 0 ? 'var(--green)' : 'var(--border)',
                border: i === 0 ? '2px solid var(--green)' : '2px solid var(--text-muted)',
              }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: i === 0 ? 'var(--green)' : 'var(--text-muted)' }}>
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ width: 80, height: 1, background: 'var(--border)', margin: '0 8px', marginBottom: 16 }} />
            )}
          </div>
        ))}
      </div>

      <div style={{ padding: '24px 24px 40px' }}>
        <div className="badge badge-green" style={{ marginBottom: 16 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
          SYSTEM INITIALIZATION
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginBottom: 32 }}>
          Sync your Digital <span style={{ color: 'var(--green)' }}>Echo.</span>
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
          {/* Left Column */}
          <div>
            {/* Source tabs */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '1px solid var(--border)' }}>
              {tabs.map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  style={{
                    background: 'none', border: 'none',
                    padding: '8px 16px',
                    fontFamily: 'var(--font-mono)', fontSize: 12,
                    color: activeTab === t ? 'var(--green)' : 'var(--text-muted)',
                    borderBottom: activeTab === t ? '2px solid var(--green)' : '2px solid transparent',
                    cursor: 'pointer', transition: 'color 0.2s',
                    marginBottom: -1,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Upload zone */}
            <div
              onClick={() => !file && fileRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              style={{
                border: `1.5px dashed ${file ? 'var(--green)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)',
                padding: 28,
                textAlign: 'center',
                cursor: file ? 'default' : 'pointer',
                background: file ? 'rgba(0,230,118,0.04)' : 'var(--bg-card)',
                transition: 'all 0.2s',
                marginBottom: 16,
              }}
            >
              <input ref={fileRef} type="file" accept=".json,.csv" onChange={handleFile} style={{ display: 'none' }} />
              {file ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, background: 'rgba(0,230,118,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--green)', fontSize: 18,
                  }}>✓</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--green)' }}>{file.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {(file.size / 1024 / 1024).toFixed(1)}MB • READY_FOR_INGESTION
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setFile(null); }}
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}
                  >×</button>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 28, marginBottom: 10, color: 'var(--text-muted)' }}>☁</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-sec)', marginBottom: 4 }}>
                    Drag & drop your conversation JSON
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Supported: .json, .csv (Max 50MB)</div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>OR</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            <div style={{ marginBottom: 4 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>RAW_INPUT_STREAM</div>
              <textarea
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder="Paste text strings to initialize patterns..."
                style={{
                  width: '100%', height: 120, padding: 14,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 12, color: 'var(--text-sec)',
                  fontFamily: 'var(--font-mono)', fontSize: 12, resize: 'none',
                  outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--border-active)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, marginBottom: 14 }}>
                WHY MEMORY?
              </h3>
              {[
                'Persistent personality mapping across model switching.',
                'Neural weight balancing for historical context accuracy.',
                'Encrypted local-first vector database architecture.',
                'Cross-session pattern recognition.',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--green)', marginTop: 2 }}>✓</span>
                  <span style={{ fontSize: 13, color: 'var(--text-sec)', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>

            {error && (
              <div style={{ padding: 12, background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.3)', borderRadius: 10, fontSize: 13, color: 'var(--red)' }}>
                {error}
              </div>
            )}

            <button
              className="btn-primary"
              onClick={handleContinue}
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: 16, fontSize: 15 }}
            >
              {loading ? <><div className="spinner" />&nbsp;INITIALIZING...</> : 'CONTINUE →'}
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'LATENCY_CORE', value: '0.12ms' },
                { label: 'NODE_STATUS', value: 'ENCRYPTED' },
              ].map(stat => (
                <div key={stat.label}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginBottom: 4 }}>{stat.label}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--green)' }}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom badges */}
        <div style={{ display: 'flex', gap: 24, marginTop: 32, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
          {[
            { icon: '🛡', label: 'SECURITY_VERIFIED' },
            { icon: '{}', label: 'FORMATS_OPTIMIZED' },
            { icon: '⚡', label: 'EDGE_PROCESSING' },
          ].map(b => (
            <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.icon}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
