import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Donations from './pages/Donations';
import AddDonation from './pages/AddDonation';
import Requests from './pages/Requests';
import VolunteerTasks from './pages/VolunteerTasks';
import Admin from './pages/Admin';

function AppLayout({ children }) {
  return (
    <div>
      <Navbar />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/donations"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Donations />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/add-donation"
              element={
                <ProtectedRoute allowedRoles={['DONOR']}>
                  <AppLayout>
                    <AddDonation />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/requests"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Requests />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/volunteer"
              element={
                <ProtectedRoute allowedRoles={['VOLUNTEER', 'ADMIN']}>
                  <AppLayout>
                    <VolunteerTasks />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AppLayout>
                    <Admin />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
