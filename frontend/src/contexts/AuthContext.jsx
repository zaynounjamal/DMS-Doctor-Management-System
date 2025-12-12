import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore user from localStorage on mount and verify with backend
  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          
          // Verify with backend - call getProfile to check if token is still valid
          try {
             await getProfile();
             // Token is valid, user stays logged in
          } catch (err) {
             console.error("Token invalid or expired", err);
             // Token is invalid - logout user
             setUser(null);
             localStorage.removeItem('user');
             localStorage.removeItem('token'); // Also clear token if stored separately
          }
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login: handleLogin, 
      logout: handleLogout, 
      isLoginModalOpen, 
      openLoginModal, 
      closeLoginModal,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
