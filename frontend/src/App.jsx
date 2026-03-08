import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Layout from './components/Layout';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userData, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!currentUser) return <Navigate to="/login" replace />;

  if (allowedRoles && userData && !allowedRoles.includes(userData.role)) {
    // If user has a role, redirect to appropriate dashboard. 
    // Otherwise go back to login/landing
    if (userData.role === 'student') return <Navigate to="/dashboard" replace />;
    if (userData.role === 'admin' || userData.role === 'warden') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student Routes */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Layout>
              <Routes>
                <Route path="/" element={<StudentDashboard />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin', 'warden']}>
            <Layout>
              <Routes>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
