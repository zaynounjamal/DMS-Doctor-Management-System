import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/layout/Header';
import LoginModal from './components/auth/LoginModal';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Footer from './components/layout/Footer';
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
import './App.css';

const AppContent = () => {
  const { user, login, logout, isLoginModalOpen, openLoginModal, closeLoginModal, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
        <Header 
          onLoginClick={openLoginModal}
          user={user}
          onLogout={logout}
        />
        
        <main className="relative" style={{ paddingTop: '56px' }}>
          <Routes>
            {/* Public Routes */}
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
            
            {/* Doctor Routes Only */}
            <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
                <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
                <Route path="/doctor/appointments" element={<DoctorAppointments />} />
                <Route path="/doctor/patients" element={<DoctorPatients />} />
                <Route path="/doctor/patients/:patientId" element={<DoctorPatientView />} />
                <Route path="/doctor/profit" element={<DoctorProfitAnalytics />} />
                <Route path="/doctor/offdays" element={<OffDaysManager />} />
                <Route path="/doctor/calendar" element={<CalendarView />} />
            </Route>
          </Routes>
        </main>
        
        <Footer />

        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={closeLoginModal} 
          onLogin={login}
        />
      </div>
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

