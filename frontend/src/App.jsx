import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import BookAppointment from './BookAppointment';
import MyAppointments from './MyAppointments';
import EditProfile from './EditProfile';
import ChangePassword from './ChangePassword';
import FinancialSummary from './FinancialSummary';
import StatsSection from './StatsSection';
import TreatmentsPage from './TreatmentsPage';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

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
    <Router>
      <div className="app-container">
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/treatments">Treatments</Link></li>
            <li><Link to="/book-appointment">Book Appointment</Link></li>
            <li><Link to="/my-appointments">My Appointments</Link></li>
            <li><Link to="/financial-summary">Financial Summary</Link></li>
            <li><Link to="/edit-profile">Edit Profile</Link></li>
            <li><Link to="/change-password">Change Password</Link></li>
            {!user ? (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/signup">Signup</Link></li>
              </>
            ) : (
              <li><button onClick={handleLogout}>Logout</button></li>
            )}
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={
            <>
              <h1>Welcome to DMS</h1>
              <StatsSection />
            </>
          } />
          <Route path="/treatments" element={<TreatmentsPage />} />
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <Signup onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/book-appointment" element={<BookAppointment />} />
          <Route path="/my-appointments" element={user ? <MyAppointments /> : <Navigate to="/login" />} />
          <Route path="/financial-summary" element={user ? <FinancialSummary /> : <Navigate to="/login" />} />
          <Route path="/edit-profile" element={user ? <EditProfile /> : <Navigate to="/login" />} />
          <Route path="/change-password" element={user ? <ChangePassword /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
