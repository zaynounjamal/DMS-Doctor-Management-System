import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState(null);

  // Restore user from localStorage on mount and verify with backend
  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          
          // Verify with backend - call getProfile to check if token is still valid
          // AND get the most up-to-date user info (like profile photo)
          try {
             const profileResponse = await getProfile();
             
             // The backend returns { profile: { ... } }
             // We need to merge this fresh data with our existing token/user data
             const freshUser = {
               ...userData,
               ...profileResponse.profile, // Overwrite with fresh db data
               token: userData.token // Keep the token
             };

             setUser(freshUser);
             localStorage.setItem('user', JSON.stringify(freshUser));
          } catch (err) {
             console.error("Token invalid or expired", err);
             // Token is invalid - logout user
             setUser(null);
             localStorage.removeItem('user');
             localStorage.removeItem('token'); 
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

  const openLoginModal = (path) => {
    setRedirectPath(path || null);
    setIsLoginModalOpen(true);
  };
  const closeLoginModal = () => setIsLoginModalOpen(false);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login: handleLogin, 
      logout: handleLogout, 
      isLoginModalOpen, 
      openLoginModal, 
      closeLoginModal,
      loading,
      redirectPath,
      setRedirectPath
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
