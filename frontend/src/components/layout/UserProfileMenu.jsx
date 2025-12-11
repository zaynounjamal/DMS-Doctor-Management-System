import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, LogOut } from 'lucide-react';

const UserProfileMenu = ({ userProfile, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getUserInitials = () => {
    if (userProfile?.initials) return userProfile.initials;
    if (userProfile?.username) {
      return userProfile.username
        .slice(0, 2)
        .toUpperCase();
    }
    if (userProfile?.fullName) {
      return userProfile.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white font-bold hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="User profile"
        aria-expanded={isOpen}
      >
        {userProfile?.avatar ? (
          <img
            src={userProfile.avatar}
            alt={userProfile.fullName || userProfile.username || 'User'}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span className="text-sm">{getUserInitials()}</span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-secondary-dark rounded-lg shadow-xl border border-gray-200 dark:border-muted-dark z-[60] overflow-hidden"
          >
            <div className="p-2">
              {(userProfile?.fullName || userProfile?.username) && (
                <div className="px-3 py-2 border-b border-gray-200 dark:border-muted-dark">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {userProfile.fullName || userProfile.username}
                  </p>
                  {userProfile.username && userProfile.fullName && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      @{userProfile.username}
                    </p>
                  )}
                </div>
              )}
              <a
                href="#profile"
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-muted-light dark:hover:bg-muted-dark rounded transition-colors"
              >
                <User size={16} />
                <span>Profile</span>
              </a>
              <a
                href="#settings"
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-muted-light dark:hover:bg-muted-dark rounded transition-colors"
              >
                <Settings size={16} />
                <span>Settings</span>
              </a>
              <button
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfileMenu;
