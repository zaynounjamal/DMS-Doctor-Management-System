import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/layout/Header';
import LoginModal from './components/auth/LoginModal';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';
import EditProfile from './pages/EditProfile';
import ChangePassword from './pages/ChangePassword';
import FinancialSummary from './pages/FinancialSummary';
import StatsSection from './pages/StatsSection';
import TreatmentsPage from './pages/TreatmentsPage';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Restore user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    // Save user data and token to localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    alert(`Welcome ${userData.username}!`);
  };

  const handleLogout = () => {
    setUser(null);
    // Clear user data from localStorage
    localStorage.removeItem('user');
  };

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
          <Header 
            onLoginClick={() => setIsLoginModalOpen(true)}
            user={user}
            onLogout={handleLogout}
          />
          
          <main className="relative" style={{ paddingTop: '56px' }}>
            <Routes>
              <Route path="/" element={
                <>
                  <h1 className="text-3xl font-bold text-center mt-8">Welcome to DMS</h1>
                  <StatsSection />
                </>
              } />
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
            onClose={() => setIsLoginModalOpen(false)} 
            onLogin={handleLogin}
          />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
