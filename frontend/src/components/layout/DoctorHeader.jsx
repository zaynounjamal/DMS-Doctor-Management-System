import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Stethoscope, ChevronDown, User, LogOut, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import ConfirmationModal from '../ui/ConfirmationModal';
import { useLanguage } from '../../contexts/LanguageContext';

const DoctorHeader = ({ onToggleSidebar, user, onLogout }) => {
  const { theme, toggleTheme } = useTheme();
  const { lang, toggle } = useLanguage();
  const [showLogo, setShowLogo] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Show logo in header when hero logo has shrunk (around 350-400px scroll)
      setShowLogo(scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial scroll position
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b shadow-md ${
        theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-800'
      }`}
      style={{
        height: '64px',
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 h-full relative">
        <div className="flex items-center justify-between h-full">
          {/* Left Side: Logo and Hamburger Menu */}
          <div className="flex items-center space-x-3">
            {/* Logo with rounded border - appears when scrolling */}
            <AnimatePresence>
              {showLogo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, width: 0, marginRight: 0 }}
                  animate={{ opacity: 1, scale: 1, width: '40px', marginRight: '12px' }}
                  exit={{ opacity: 0, scale: 0.8, width: 0, marginRight: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="h-10 w-10 flex items-center justify-center rounded-lg border-2 border-white/30 bg-white/10 backdrop-blur-sm flex-shrink-0"
                >
                  <Stethoscope 
                    className="w-6 h-6 text-purple-600 dark:text-purple-400"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            {/* Hamburger menu - always in same position */}
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 flex-shrink-0"
              aria-label="Open navigation menu"
              style={{ minWidth: '40px', minHeight: '40px' }}
            >
              <Menu size={24} className="text-gray-700 dark:text-gray-200" />
            </button>
          </div>

          {/* Right Side: Profile Button */}
          <div className="flex items-center space-x-3">
             <button
               type="button"
               onClick={toggleTheme}
               className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
               title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
               aria-label="Toggle theme"
             >
               {theme === 'dark' ? (
                 <Sun className="w-5 h-5 text-yellow-500" />
               ) : (
                 <Moon className="w-5 h-5 text-purple-600" />
               )}
             </button>
             <button
               type="button"
               onClick={toggle}
               className="px-3 h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
               title="Language"
               aria-label="Language"
             >
               {lang === 'ar' ? 'AR' : 'EN'}
             </button>
             <div className="relative">
                <button 
                  onClick={() => setShowProfile((p) => !p)} 
                  className="flex items-center gap-2 p-2 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                      {user?.name?.charAt(0) || 'D'}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{user?.name || 'Doctor'}</p>
                  </div>
                  <ChevronDown size={16} className="text-gray-500" />
                </button>
                {showProfile && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-2xl border overflow-hidden animate-fade-in bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-3 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
                      <User size={18} />
                      <span>Edit Profile</span>
                    </Link>
                    <button 
                      onClick={() => setIsLogoutModalOpen(true)} 
                      className="w-full flex items-center gap-3 px-4 py-3 border-t border-gray-100 dark:border-gray-700 transition-all hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
          </div>
        </div>
      </nav>

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        title="Confirm Logout"
        message="Are you sure you want to log out? You will need to sign in again to access your dashboard."
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          onLogout();
        }}
        onCancel={() => setIsLogoutModalOpen(false)}
        confirmText="Logout"
        type="danger"
      />
    </header>
  );
};

export default DoctorHeader;
