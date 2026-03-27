const BASE_URL = 'https://maya143.app.n8n.cloud/webhook-test/chat';

const api = async (endpoint, options = {}) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};

export const uploadMemory = (fileContent, userId) =>
  api('/upload-memory', {
    method: 'POST',
    body: JSON.stringify({ fileContent, userId }),
  });

export const loadDashboard = (userId) =>
  api(`/dashboard?userId=${userId}`);

export const sendChat = (message, type, userId, sessionId) =>
  api('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, type, userId, sessionId }),
  });

export const initAgent = (agentName, userId) =>
  api('/agent/init', {
    method: 'POST',
    body: JSON.stringify({ agentName, userId }),
  });

export const sendAgentChat = (agentName, message, userId, sessionId) =>
  api('/agent/chat', {
    method: 'POST',
    body: JSON.stringify({ agentName, message, userId, sessionId }),
  });

export const loadAlerts = (userId, domain = null) =>
  api(`/alerts?userId=${userId}${domain ? `&domain=${domain}` : ''}`);

export const updateAlert = (alertId, status, userId) =>
  api('/alerts/update', {
    method: 'POST',
    body: JSON.stringify({ alertId, status, userId }),
  });

export const loadProfile = (userId) =>
  api(`/profile?userId=${userId}`);

export const saveCommitment = (message, userId) =>
  api('/commitment', {
    method: 'POST',
    body: JSON.stringify({ message, userId }),
  });

export const answerFollowUp = (answer, question, userId) =>
  api('/followup', {
    method: 'POST',
    body: JSON.stringify({ answer, question, userId }),
  });
