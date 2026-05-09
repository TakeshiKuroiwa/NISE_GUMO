import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './context/authStore';
import { LoginPage } from './pages/LoginPage';
import { Layout } from './components/Layout';
import './App.css';

// Lazy load pages
const DashboardPage = React.lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const ProjectsPage = React.lazy(() =>
  import('./pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage }))
);
const EditorPage = React.lazy(() =>
  import('./pages/EditorPage').then((m) => ({ default: m.EditorPage }))
);
const AdminPage = React.lazy(() =>
  import('./pages/AdminPage').then((m) => ({ default: m.AdminPage }))
);
const ProfilePage = React.lazy(() =>
  import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);
const SettingsPage = React.lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  const { getCurrentUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      getCurrentUser().catch(() => {
        // If getCurrentUser fails, user will be redirected to login
      });
    }
  }, [getCurrentUser, isAuthenticated]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <React.Suspense
                fallback={
                  <div className="loading-container">
                    <div className="spinner"></div>
                  </div>
                }
              >
                <DashboardPage />
              </React.Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <React.Suspense
                fallback={
                  <div className="loading-container">
                    <div className="spinner"></div>
                  </div>
                }
              >
                <ProjectsPage />
              </React.Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/editor"
          element={
            <ProtectedRoute>
              <React.Suspense
                fallback={
                  <div className="loading-container">
                    <div className="spinner"></div>
                  </div>
                }
              >
                <EditorPage />
              </React.Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <React.Suspense
                fallback={
                  <div className="loading-container">
                    <div className="spinner"></div>
                  </div>
                }
              >
                <AdminPage />
              </React.Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <React.Suspense
                fallback={
                  <div className="loading-container">
                    <div className="spinner"></div>
                  </div>
                }
              >
                <ProfilePage />
              </React.Suspense>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <React.Suspense
                fallback={
                  <div className="loading-container">
                    <div className="spinner"></div>
                  </div>
                }
              >
                <SettingsPage />
              </React.Suspense>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
