import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
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
          <Route path="/" element={<h1>Welcome to DMS</h1>} />
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <Signup onLogin={handleLogin} /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
