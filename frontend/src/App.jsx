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
import AdminLayout from './components/layout/AdminLayout';
import './App.css';
import DoctorLayout from './components/layout/DoctorLayout';

const AppContent = () => {
  const { user, login, logout, isLoginModalOpen, openLoginModal, closeLoginModal, loading } = useAuth();
  const location = useLocation();

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

