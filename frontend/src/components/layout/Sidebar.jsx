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

const Sidebar = ({ isOpen, onClose, navItems, variant = 'mobile', role = 'patient' }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isMobile = variant === 'mobile';
  const isDoctor = role === 'doctor';

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
                ? isDoctor ? 'fixed top-16 left-0 bottom-0 z-30 w-64 shadow-2xl' : 'fixed top-0 left-0 bottom-0 right-0 z-50 w-full h-full' 
                : 'relative w-full h-full' 
            } ${
              isDoctor
                ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100'
                : theme === 'light'
                  ? 'bg-primary-light/80 backdrop-blur-xl border-primary-light/30 text-white'
                  : 'bg-primary-dark/80 backdrop-blur-xl border-primary-dark/30 text-white'
            } border-r`}
          >
            {/* Close Button - Visible on Mobile */}
            {isMobile && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.2 }}
                onClick={onClose}
                className={`absolute top-4 right-4 p-2 rounded-full transition-all z-50 ${
                  isDoctor
                    ? 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                    : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm shadow-lg text-white'
                }`}
                aria-label="Close menu"
              >
                <X size={isDoctor ? 20 : 24} />
              </motion.button>
            )}

            {/* Navigation Items */}
            <nav className={`h-full overflow-y-auto ${isDoctor ? 'py-6 px-3' : 'flex items-center justify-center px-6 py-8'}`}>
              <ul className={isDoctor ? 'space-y-1' : 'space-y-6 w-full max-w-md'}>
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
                        className={`w-full transition-all duration-200 group relative overflow-hidden ${
                          isDoctor
                            ? `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
                                isActive 
                                  ? 'bg-primary-light/10 text-primary-light border-l-4 border-primary-light' 
                                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary-light'
                              }`
                            : `flex flex-col items-center justify-center gap-3 px-8 py-6 text-lg font-semibold rounded-2xl ${
                                 isActive 
                                   ? 'bg-white/30 text-white backdrop-blur-sm shadow-2xl scale-105' 
                                   : 'text-white/80 hover:bg-white/20 hover:text-white hover:shadow-xl'
                              }`
                        }`}
                        whileHover={isDoctor ? { x: 4 } : { scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                         {isActive && !isDoctor && (
                            <motion.div
                                layoutId="activeNavIndicator"
                                className="absolute inset-0 bg-white/10 rounded-2xl"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            />
                         )}
                         <Icon size={isDoctor ? 18 : 32} className={`transition-opacity relative z-10 ${isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} />
                         <span className="relative z-10">{item.name}</span>
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
