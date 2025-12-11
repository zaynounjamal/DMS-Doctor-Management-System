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
          
          // Verify with backend
          try {
             // We just fire this to check validity, if it fails (401), we clear user
             // But getProfile might return 401 if token expired
             // api.js getProfile headers use localStorage token.
             // If we want to be strict, we wait for this.
             await getProfile();
          } catch (err) {
             console.error("Token invalid or expired", err);
             // Optional: logout if strict verification required on every load
             // handleLogout(); 
             // For now, we trust localStorage until an API call fails or component checks specifically
          }
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('user');
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
