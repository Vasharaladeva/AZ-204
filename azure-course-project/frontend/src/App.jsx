import { Routes, Route, Navigate } from 'react-router-dom';
import { useIsAuthenticated } from '@azure/msal-react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import NotesPage from './pages/NotesPage';
import FilesPage from './pages/FilesPage';
import DashboardPage from './pages/DashboardPage';

// Simple guard — redirect to home if not authenticated
function ProtectedRoute({ children }) {
  const isAuthenticated = useIsAuthenticated();
  // In dev mode (no Entra ID configured), always allow access
  const devMode = !import.meta.env.VITE_AZURE_CLIENT_ID || import.meta.env.VITE_AZURE_CLIENT_ID === 'dev-client-id';
  if (!isAuthenticated && !devMode) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/notes" element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
        <Route path="/files" element={<ProtectedRoute><FilesPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      </Routes>
    </Layout>
  );
}
