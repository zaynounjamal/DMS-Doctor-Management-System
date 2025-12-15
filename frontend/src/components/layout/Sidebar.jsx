import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { X, LayoutDashboard, Calendar, Users, DollarSign, Coffee, Home, Activity, FileText } from 'lucide-react';

const iconMap = {
  'Dashboard': LayoutDashboard,
  'Appointments': Calendar,
  'Calendar': Calendar,
  'Patients': Users,
  'Profit Analytics': DollarSign,
  'Off Days': Coffee,
  'Home': Home,
  'Treatments': Activity,
  'Book Appointment': FileText
};

const Sidebar = ({ isOpen, onClose, navItems, variant = 'mobile' }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isMobile = variant === 'mobile';

  const handleNavClick = (href) => {
    if (isMobile) onClose();
    navigate(href);
  };

  const containerVariants = {
    hidden: { x: '-100%' },
    visible: {
      x: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
    exit: {
      x: '-100%',
      transition: {
        duration: 0.25,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Mobile Only */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 z-20 bg-black/30 dark:bg-black/50 backdrop-blur-sm md:hidden"
            />
          )}

          {/* Sidebar - Drawer */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`${
              isMobile 
                ? 'fixed top-16 left-0 bottom-0 z-30 shadow-2xl border-r w-64' 
                : 'relative w-full h-full' 
            } ${
              theme === 'light'
                ? 'bg-white/95 border-gray-200 text-gray-800'
                : 'bg-gray-900/95 border-gray-800 text-white'
            }`}
          >
            {/* Close Button - Mobile Only */}
            {isMobile && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.2 }}
                onClick={onClose}
                className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all md:hidden"
                aria-label="Close menu"
              >
                <X size={20} className="text-gray-500" />
              </motion.button>
            )}

            {/* Navigation Items */}
            <nav className="h-full overflow-y-auto py-6 px-3">
              <ul className="space-y-1">
                {navItems.map((item, index) => {
                  const Icon = iconMap[item.name] || FileText;
                  const isActive = location.pathname === item.href;
                  return (
                    <motion.li
                      key={item.name}
                      variants={itemVariants}
                      className="relative"
                    >
                      <motion.button
                        onClick={() => handleNavClick(item.href)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group relative overflow-hidden ${
                               theme === 'light' 
                                 ? (isActive ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')
                                 : (isActive ? 'bg-purple-900/40 text-purple-300' : 'text-gray-400 hover:bg-gray-800 hover:text-white')
                        }`}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                         {isActive && (
                            <motion.div
                                layoutId="activeNavIndicator"
                                className={`absolute left-0 top-0 bottom-0 w-1 ${theme === 'light' ? 'bg-purple-600' : 'bg-purple-400'}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            />
                         )}
                         <Icon size={18} className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} />
                         <span>{item.name}</span>
                      </motion.button>
                    </motion.li>
                  );
                })}
              </ul>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
