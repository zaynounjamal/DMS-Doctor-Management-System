import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import Sidebar from './Sidebar';
import UserProfileMenu from './UserProfileMenu';

const Header = ({ onLoginClick, user, onLogout }) => {
  const { theme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation items for DMS
  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Treatments', href: '/treatments' },
    { name: 'Book Appointment', href: '/book-appointment' },
    { name: 'My Appointments', href: '/my-appointments' },
    { name: 'Financial Summary', href: '/financial-summary' },
    { name: 'Edit Profile', href: '/edit-profile' },
    { name: 'Change Password', href: '/change-password' },
  ];

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-40 bg-primary-light dark:bg-primary-dark transition-all duration-300"
        style={{
          height: '56px',
        }}
      >
        <nav className="max-w-7xl mx-auto px-4 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Left Side: Hamburger Menu */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Open navigation menu"
                style={{ minWidth: '40px', minHeight: '40px' }}
              >
                <Menu size={24} className="text-white" />
              </button>
            </div>

            {/* Right Side: Sign Up Button or User Avatar */}
            <div className="flex items-center space-x-3">
              {user ? (
                <UserProfileMenu 
                  userProfile={user} 
                  onLogout={onLogout} 
                />
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

      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        navItems={navItems}
      />
    </>
  );
};

export default Header;
