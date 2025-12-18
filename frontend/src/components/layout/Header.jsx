import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Stethoscope } from 'lucide-react';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import Sidebar from './Sidebar';

import { getPublicSettings } from '../../api';

const Header = ({ onLoginClick, user, onLogout }) => {
  const { theme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
         try {
             const data = await getPublicSettings();
             if (data.LogoUrl) setLogoUrl(data.LogoUrl);
         } catch(e) {
             console.error("Failed to load logo", e);
         }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);
      // Show logo in header when hero logo has shrunk (around 350-400px scroll)
      setShowLogo(scrollY > 350);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial scroll position
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  // Navigation items based on user role
  const getNavItems = () => {
    if (user?.role?.toLowerCase() === 'doctor') {
      return [
        { name: 'Dashboard', href: '/doctor/dashboard' },
        { name: 'Appointments', href: '/doctor/appointments' },
        { name: 'Calendar', href: '/doctor/calendar' },
        { name: 'Patients', href: '/doctor/patients' },
        { name: 'Profit Analytics', href: '/doctor/profit' },
        { name: 'Off Days', href: '/doctor/offdays' },
      ];
    }
    
    // Patient navigation
    return [
      { name: 'Home', href: '/' },
      { name: 'Treatments', href: '/treatments' },
      { name: 'Book Appointment', href: '/book-appointment' },
    ];
  };

  const navItems = getNavItems();


  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-primary-light/90 dark:bg-primary-dark/90 backdrop-blur-sm' 
            : 'bg-primary-light dark:bg-primary-dark'
        }`}
        style={{
          height: '56px',
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
                    className="h-10 w-10 flex items-center justify-center rounded-lg border-2 border-white/30 bg-white/10 backdrop-blur-sm flex-shrink-0 overflow-hidden"
                  >
                    {logoUrl ? (
                         logoUrl.startsWith('icon:') ? (
                             React.createElement(Icons[logoUrl.split(':')[1]] || Stethoscope, { className: "w-6 h-6 text-white" })
                         ) : (
                             <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                         )
                    ) : (
                        <Stethoscope 
                          className="w-6 h-6 text-white"
                        />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Hamburger menu - always in same position */}
              <button
                onClick={() => setIsSidebarOpen(prev => !prev)}
                className="p-2 rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 flex-shrink-0"
                aria-label="Open navigation menu"
                style={{ minWidth: '40px', minHeight: '40px' }}
              >
                <Menu size={24} className="text-white" />
              </button>
            </div>

            {/* Right Side: Profile Button or Sign Up */}
            <div className="flex items-center space-x-3">
              {user ? (
                <Link
                  to="/profile"
                  className="flex items-center justify-center px-4 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white font-bold hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                  aria-label="Profile"
                >
                  <span className="text-sm">Profile</span>
                </Link>
              ) : (
                <button
                  onClick={onLoginClick}
                  className="flex items-center justify-center px-4 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white font-bold hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                  aria-label="Sign Up"
                >
                  <span className="text-sm">Sign Up</span>
                </button>
              )}
            </div>
          </div>
        </nav>
      </header>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        navItems={navItems}
        user={user}
        onLogout={onLogout}
        role="patient"
      />
    </>
  );
};

export default Header;
