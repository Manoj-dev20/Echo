import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Landing from './pages/Landing';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import AgentsHub from './pages/AgentsHub';
import AgentChat from './pages/AgentChat';
import Alerts from './pages/Alerts';
import Profile from './pages/Profile';

function ProtectedRoute({ children }) {
  const userId = localStorage.getItem('echo_user_id');
  if (!userId) return <Navigate to="/setup" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/agents" element={<ProtectedRoute><AgentsHub /></ProtectedRoute>} />
        <Route path="/agent-chat" element={<ProtectedRoute><AgentChat /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
