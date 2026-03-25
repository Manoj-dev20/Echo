// ─────────────────────────────────────────────────────────────────
//  ECHO — n8n API Bridge   |   src/utils/api.js
//  Workflow is LIVE at: https://maya143.app.n8n.cloud/webhook
// ─────────────────────────────────────────────────────────────────

const BASE_URL = 'https://maya143.app.n8n.cloud/webhook-test/upload-memory';
const USER_ID  = 'user_echo_001';

// Shared fetch helper
async function call(path, { method = 'GET', body } = {}) {
  const options = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`n8n ${method} ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

// ═════════════════════════════════════════════════
//  W1  POST /upload-memory          (Setup.jsx)
// ═════════════════════════════════════════════════
// Returns: { success, profileSummary, fieldsExtracted, profile:{name,domain,city,careerStage} }
export async function uploadMemory(fileContent, source = 'CHATGPT') {
  return call('/upload-memory', {
    method: 'POST',
    body: { fileContent, userId: USER_ID, source },
  });
}
/*
  HOW TO USE — Setup.jsx:

  const reader = new FileReader();
  reader.onload = async (e) => {
    const json = JSON.parse(e.target.result);
    const data = await uploadMemory(json, selectedSource);
    // data.profileSummary → "Web developer in Bangalore, mid-level"
    // data.profile        → { name, domain, city, careerStage }
    navigate('/dashboard');
  };
  reader.readAsText(file);
*/

// ═════════════════════════════════════════════════
//  W2  GET /dashboard               (Dashboard.jsx)
// ═════════════════════════════════════════════════
// Returns: { domainScores:{career,finance,health,civic}, followUpQuestion,
//            profileDepth:{completeness,goalsTracked,activeCommitments,lastUpdated},
//            isFirstVisit, profileSummary }
export async function loadDashboard() {
  return call(`/dashboard?userId=${USER_ID}`);
}
/*
  HOW TO USE — Dashboard.jsx:

  useEffect(() => {
    loadDashboard().then(data => {
      setDomainScores(data.domainScores);
      setFollowUpQuestion(data.followUpQuestion);
      setProfileDepth(data.profileDepth);
      setIsFirstVisit(data.isFirstVisit);
    });
  }, []);
*/

// ═════════════════════════════════════════════════
//  W3  POST /chat — mode: updates   (Chat.jsx)
// ═════════════════════════════════════════════════
// Returns: { type:'cards', cards:[{domain,headline,body,impactScore,source,diveDeeper}] }
export async function fetchUpdates(sessionId = 'session_1') {
  return call('/chat', {
    method: 'POST',
    body: { type: 'updates', userId: USER_ID, sessionId },
  });
}
/*
  HOW TO USE — Chat.jsx (ANY UPDATES? button):

  const handleUpdates = async () => {
    const data = await fetchUpdates();
    // data.cards → array, render each as a news card
    setCards(data.cards);
  };
*/

// ═════════════════════════════════════════════════
//  W3  POST /chat — mode: query     (Chat.jsx)
// ═════════════════════════════════════════════════
// Returns: { type:'chat', response, sources:[{name}], timestamp }
export async function sendChatMessage(message, sessionId = 'session_1') {
  return call('/chat', {
    method: 'POST',
    body: { type: 'query', message, userId: USER_ID, sessionId },
  });
}
/*
  HOW TO USE — Chat.jsx (user sends message):

  const handleSend = async (text) => {
    const data = await sendChatMessage(text, sessionId);
    // data.response → Echo's reply
    // data.sources  → [{name:'Reddit/layoffs'}] — render as source cards
    addMessage({ role: 'echo', text: data.response, sources: data.sources });
  };
*/

// ═════════════════════════════════════════════════
//  W4  POST /agent/init             (AgentsHub.jsx)
// ═════════════════════════════════════════════════
// agentName: 'Career' | 'Finance' | 'Health' | 'Livelihood' | 'Civic'
// Returns: { agentName, agentColor, openingMessage, contextStrip, sessionId }
export async function initAgent(agentName) {
  return call('/agent/init', {
    method: 'POST',
    body: { agentName, userId: USER_ID },
  });
}
/*
  HOW TO USE — AgentsHub.jsx (INITIALIZE button):

  const handleInit = async () => {
    const data = await initAgent(selectedAgent); // e.g. 'Career'
    // data.openingMessage → the confrontation opening
    // data.sessionId      → SAVE THIS, pass into every agent/chat call
    navigate('/agent-chat', { state: data });
  };
*/

// ═════════════════════════════════════════════════
//  W5  POST /agent/chat             (AgentChat.jsx)
// ═════════════════════════════════════════════════
// Returns: { response, sources:[{name}], timestamp, agentLabel }
export async function sendAgentMessage(agentName, message, sessionId) {
  return call('/agent/chat', {
    method: 'POST',
    body: { agentName, message, userId: USER_ID, sessionId },
  });
}
/*
  HOW TO USE — AgentChat.jsx:

  const handleSend = async (text) => {
    const data = await sendAgentMessage(agentName, text, sessionId);
    // data.response   → agent reply text
    // data.sources    → citation cards [{name}]
    // data.agentLabel → "CAREER AGENT"
    addMessage({ role: 'agent', text: data.response, sources: data.sources });
  };
*/

// ═════════════════════════════════════════════════
//  W7  GET /alerts                  (Alerts.jsx)
// ═════════════════════════════════════════════════
// Returns: { alerts:[{alertId,domain,headline,body,impactScore,
//                     timeline,confidence,status,personalContext}],
//            stats:{active,actedOn,resolved},
//            domainCounts:{CAREER,FINANCE,HEALTH,LIVELIHOOD,CIVIC} }
export async function loadAlerts(domain = null) {
  const q = domain ? `?userId=${USER_ID}&domain=${domain}` : `?userId=${USER_ID}`;
  return call(`/alerts${q}`);
}
/*
  HOW TO USE — Alerts.jsx:

  useEffect(() => {
    loadAlerts().then(data => {
      setAlerts(data.alerts);
      setStats(data.stats);
    });
  }, []);

  // Domain filter:
  const onFilter = async (domain) => {
    const data = await loadAlerts(domain === 'ALL' ? null : domain);
    setAlerts(data.alerts);
  };
*/

// ═════════════════════════════════════════════════
//  W7  POST /alerts/update          (Alerts.jsx)
// ═════════════════════════════════════════════════
// Returns: { success, alertId, newStatus }
export async function updateAlert(alertId, status = 'ACTED') {
  return call('/alerts/update', {
    method: 'POST',
    body: { alertId, status, userId: USER_ID },
  });
}
/*
  HOW TO USE — Alerts.jsx (MARK AS ACTED button):

  const handleMarkActed = async (alertId) => {
    await updateAlert(alertId, 'ACTED');
    setAlerts(prev => prev.map(a =>
      a.alertId === alertId ? { ...a, status: 'ACTED' } : a
    ));
  };
*/

// ═════════════════════════════════════════════════
//  W8P  GET /profile                (Profile.jsx)
// ═════════════════════════════════════════════════
// Returns: { profile:{name,careerStage,domain,city,goals[],interests[],
//                     concerns[],financeSituation,profileCompleteness},
//            commitments:[{category,newValue,deadlineDate,status,messageSnippet}],
//            pastCommitments:[...],
//            updatesLog:[{timestamp,category,messageSnippet}] }
export async function loadProfile() {
  return call(`/profile?userId=${USER_ID}`);
}
/*
  HOW TO USE — Profile.jsx:

  useEffect(() => {
    loadProfile().then(data => {
      setProfile(data.profile);
      setCommitments(data.commitments);
      setUpdatesLog(data.updatesLog);
    });
  }, []);
*/

// ═════════════════════════════════════════════════
//  W8C  POST /commitment            (Dashboard.jsx FAB)
// ═════════════════════════════════════════════════
// Returns: { success, message, updated, fieldsChanged }
export async function logCommitment(message) {
  return call('/commitment', {
    method: 'POST',
    body: { message, userId: USER_ID },
  });
}
/*
  HOW TO USE — Dashboard.jsx (floating + button):

  const handleCommit = async (text) => {
    await logCommitment(text);
    showToast('✓ Commitment logged. Echo will follow up.');
    closeBottomSheet();
  };
*/

// ═════════════════════════════════════════════════
//  WFU  POST /followup              (Dashboard.jsx yes/no cards)
// ═════════════════════════════════════════════════
// Returns: { success: true }
export async function answerFollowUp(answer, question) {
  return call('/followup', {
    method: 'POST',
    body: {
      message: `Follow-up answer: ${answer} — "${question}"`,
      userId: USER_ID,
      answer,
      question,
    },
  });
}
/*
  HOW TO USE — Dashboard.jsx (YES / NOT YET buttons):

  <button onClick={() => answerFollowUp('yes', followUpQuestion)}>YES ✓</button>
  <button onClick={() => answerFollowUp('no',  followUpQuestion)}>NOT YET</button>
*/