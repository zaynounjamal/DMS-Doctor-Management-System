import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/layout/Header';
import LoginModal from './components/auth/LoginModal';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';
import EditProfile from './pages/EditProfile';
import ChangePassword from './pages/ChangePassword';
import FinancialSummary from './pages/FinancialSummary';
import StatsSection from './pages/StatsSection';
import TreatmentsPage from './pages/TreatmentsPage';
import HomePage from './pages/HomePage';
import './App.css';

const AppContent = () => {
  const { user, login, logout, isLoginModalOpen, openLoginModal, closeLoginModal } = useAuth();

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
            <Route path="/" element={<HomePage />} />
            <Route path="/treatments" element={<TreatmentsPage />} />
            <Route path="/book-appointment" element={<BookAppointment />} />
            <Route path="/my-appointments" element={user ? <MyAppointments /> : <Navigate to="/" />} />
            <Route path="/financial-summary" element={user ? <FinancialSummary /> : <Navigate to="/" />} />
            <Route path="/edit-profile" element={user ? <EditProfile /> : <Navigate to="/" />} />
            <Route path="/change-password" element={user ? <ChangePassword /> : <Navigate to="/" />} />
          </Routes>
        </main>
        
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

