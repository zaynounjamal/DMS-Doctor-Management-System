import React, { lazy, Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Header from './components/layout/Header';
import LoginModal from './components/auth/LoginModal';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Footer from './components/layout/Footer';
import UnifiedChatManager from './components/chat/UnifiedChatManager';

import usePreventNavigation from './hooks/usePreventNavigation';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';
import EditProfile from './pages/EditProfile';
import ChangePassword from './pages/ChangePassword';
import FinancialSummary from './pages/FinancialSummary';
import StatsSection from './pages/StatsSection';
import TreatmentsPage from './pages/TreatmentsPage';
import HomePage from './pages/HomePage';
// Doctor pages
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorPatients from './pages/DoctorPatients';
import DoctorPatientView from './pages/DoctorPatientView';
import DoctorProfitAnalytics from './pages/DoctorProfitAnalytics';
import OffDaysManager from './pages/OffDaysManager';
import CalendarView from './pages/CalendarView';
import Profile from './pages/Profile';
import SecretaryDashboard from './pages/SecretaryDashboard';
import SecretaryProfile from './pages/SecretaryProfile';
import SecretaryChat from './pages/SecretaryChat';
// Lazy load PaymentReports to avoid loading jspdf on initial app load
const PaymentReports = lazy(() => import('./pages/PaymentReports'));
import DailySchedule from './pages/DailySchedule';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminAuditLogs from './pages/AdminAuditLogs';
import AdminReports from './pages/AdminReports';
import AdminSchedule from './pages/AdminSchedule';
import AdminPatients from './pages/AdminPatients';
import AdminTreatments from './pages/AdminTreatments';
import AdminSettings from './pages/AdminSettings';
import AdminEmailTemplates from './pages/AdminEmailTemplates';
import AdminBlockedPhones from './pages/AdminBlockedPhones';
import AdminLayout from './components/layout/AdminLayout';
import './App.css';
import DoctorLayout from './components/layout/DoctorLayout';
import { getPublicSettings } from './api';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      const message = this.state.error?.message || String(this.state.error);
      return (
        <div className="min-h-screen p-6 bg-white text-gray-900">
          <div className="max-w-3xl mx-auto rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="text-sm font-bold text-red-700 uppercase tracking-widest">Application Error</div>
            <div className="mt-2 text-lg font-extrabold text-red-900">{message}</div>
            <pre className="mt-4 text-xs whitespace-pre-wrap text-red-900/80">{this.state.error?.stack}</pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppContent = () => {
  const { user, login, logout, isLoginModalOpen, openLoginModal, closeLoginModal, loading } = useAuth();
  const location = useLocation();

  React.useEffect(() => {
    let mounted = true;

    const toRgbTriplet = (input) => {
      if (typeof window === 'undefined') return null;
      if (typeof input !== 'string') return null;
      const v = input.trim();
      if (!v) return null;

      const tripletMatch = v.match(/^\s*(\d{1,3})\s+(\d{1,3})\s+(\d{1,3})\s*$/);
      if (tripletMatch) {
        const r = Number(tripletMatch[1]);
        const g = Number(tripletMatch[2]);
        const b = Number(tripletMatch[3]);
        if ([r, g, b].every((n) => Number.isFinite(n) && n >= 0 && n <= 255)) {
          return `${r} ${g} ${b}`;
        }
      }

      try {
        const el = document.createElement('span');
        el.style.color = v;
        document.body.appendChild(el);
        const computed = getComputedStyle(el).color;
        document.body.removeChild(el);

        const m = computed.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*(?:\.\d+)?))?\)$/);
        if (!m) return null;
        return `${Number(m[1])} ${Number(m[2])} ${Number(m[3])}`;
      } catch {
        return null;
      }
    };

    const applyThemeVars = (data) => {
      if (!data) return;

      const map = {
        ThemePrimaryLight: '--primary-light',
        ThemePrimaryDark: '--primary-dark',
        ThemeSecondaryLight: '--secondary-light',
        ThemeSecondaryDark: '--secondary-dark',
        ThemeAccentLight: '--accent-light',
        ThemeAccentDark: '--accent-dark',
        ThemeMutedLight: '--muted-light',
        ThemeMutedDark: '--muted-dark'
      };

      Object.entries(map).forEach(([key, cssVar]) => {
        const value = data[key];
        if (typeof value === 'string' && value.trim()) {
          const triplet = toRgbTriplet(value);
          if (triplet) {
            document.documentElement.style.setProperty(cssVar, triplet);
          }
        }
      });
    };

    (async () => {
      try {
        const data = await getPublicSettings();
        if (!mounted) return;
        applyThemeVars(data);
      } catch {
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Prevent browser back/forward navigation
  usePreventNavigation(true);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't show footer on profile page or secretary pages
  const showFooter = location.pathname !== '/profile' && !location.pathname.startsWith('/secretary');

  // Don't show header on secretary pages
  const showHeader = !location.pathname.startsWith('/secretary');

  const PublicLayout = () => (
    <>
      <Header
        onLoginClick={openLoginModal}
        user={user}
        onLogout={logout}
      />
      <main className="relative" style={{ paddingTop: '56px' }}>
        <Outlet />
      </main>
      {showFooter && <Footer />}
    </>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 overflow-x-hidden">


        <Routes>
          {/* Public & Patient Routes - Wrapped in PublicLayout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/treatments" element={<TreatmentsPage />} />
            <Route path="/book-appointment" element={<BookAppointment />} />

            {/* Protected Routes (Any Authenticated User) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/my-appointments" element={<MyAppointments />} />
              <Route path="/financial-summary" element={<FinancialSummary />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/change-password" element={<ChangePassword />} />
            </Route>
          </Route>

          {/* Doctor Routes Only - Wrapped in DoctorLayout */}
          <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
            <Route element={<DoctorLayout />}>
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor/appointments" element={<DoctorAppointments />} />
              <Route path="/doctor/patients" element={<DoctorPatients />} />
              <Route path="/doctor/patients/:patientId" element={<DoctorPatientView />} />
              <Route path="/doctor/profit" element={<DoctorProfitAnalytics />} />
              <Route path="/doctor/offdays" element={<OffDaysManager />} />
              <Route path="/doctor/calendar" element={<CalendarView />} />
            </Route>
          </Route>

          {/* Secretary Routes Only */}
          <Route element={<ProtectedRoute allowedRoles={['secretary']} />}>
            <Route path="/secretary-dashboard" element={<SecretaryDashboard />} />
            <Route path="/secretary/profile" element={<SecretaryProfile />} />
            <Route path="/secretary/chat" element={<SecretaryChat />} />
            <Route path="/secretary/payments" element={
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
                <PaymentReports />
              </Suspense>
            } />
            <Route path="/secretary/schedule" element={<DailySchedule />} />
          </Route>


          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/blocked-phones" element={<AdminBlockedPhones />} />
              <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/schedule" element={<AdminSchedule />} />
              <Route path="/admin/patients" element={<AdminPatients />} />
              <Route path="/admin/treatments" element={<AdminTreatments />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/email-templates" element={<AdminEmailTemplates />} />
            </Route>
          </Route>

        </Routes>

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={closeLoginModal}
          onLogin={login}
        />
      </div>
    </ErrorBoundary>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <AppContent />
            <UnifiedChatManager />
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

