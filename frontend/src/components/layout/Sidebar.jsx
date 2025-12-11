import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose, navItems }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const handleNavClick = (href) => {
    onClose();
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[45] bg-black/30 dark:bg-black/50 backdrop-blur-sm"
          />

          {/* Sidebar - Full Screen */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`fixed inset-0 z-[50] backdrop-blur-xl ${
              theme === 'light'
                ? 'bg-primary-light/60 text-white'
                : 'bg-primary-dark/60 text-white'
            }`}
          >
            {/* Close Button - Top Right */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.2 }}
              onClick={onClose}
              className="absolute top-6 right-6 p-3 rounded-full hover:bg-white/20 transition-all duration-300 hover:scale-110 hover:rotate-90 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Close menu"
            >
              <X size={28} className="text-white" />
            </motion.button>

            {/* Navigation Items - Centered */}
            <nav className="flex items-center justify-center h-full">
              <ul className="space-y-6">
                {navItems.map((item, index) => (
                  <motion.li
                    key={item.name}
                    variants={itemVariants}
                    className="relative"
                  >
                    <motion.button
                      onClick={() => handleNavClick(item.href)}
                      className="block px-8 py-4 text-2xl font-semibold text-white/90 rounded-xl relative overflow-hidden group cursor-pointer"
                      whileHover={{
                        scale: 1.08,
                        x: 15,
                        rotateY: 5,
                      }}
                      whileTap={{ scale: 0.95 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 17,
                      }}
                    >
                      {/* Pulsing background on hover */}
                      <motion.div
                        className={`absolute inset-0 rounded-xl ${
                          theme === 'light'
                            ? 'bg-white/15'
                            : 'bg-white/15'
                        }`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileHover={{
                          scale: 1,
                          opacity: 1,
                        }}
                        transition={{
                          duration: 0.4,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                      />
                      
                      {/* Ripple/pulse effect */}
                      <motion.div
                        className={`absolute inset-0 rounded-xl ${
                          theme === 'light'
                            ? 'bg-white/20'
                            : 'bg-white/20'
                        }`}
                        initial={{ scale: 0.5, opacity: 0 }}
                        whileHover={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0.8, 0.3],
                        }}
                        transition={{
                          duration: 1.5,
                          ease: 'easeInOut',
                          repeat: Infinity,
                          repeatType: 'reverse',
                        }}
                      />
                      
                      {/* Enhanced glow effect on hover */}
                      <motion.div
                        className={`absolute -inset-2 rounded-xl ${
                          theme === 'light'
                            ? 'bg-white/30'
                            : 'bg-white/30'
                        } blur-2xl`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileHover={{
                          opacity: [0.5, 1, 0.7],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 1.2,
                          ease: 'easeInOut',
                          repeat: Infinity,
                          repeatType: 'reverse',
                        }}
                      />

                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        initial={{ x: '-100%', skewX: -20 }}
                        whileHover={{
                          x: ['200%', '200%'],
                        }}
                        transition={{
                          duration: 1.5,
                          ease: 'easeInOut',
                          repeat: Infinity,
                          repeatDelay: 2,
                        }}
                      />

                      {/* Animated text with bounce effect */}
                      <motion.span
                        className="relative z-10 block"
                        whileHover={{
                          color: '#ffffff',
                          letterSpacing: '2px',
                          textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
                        }}
                        transition={{
                          duration: 0.3,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                      >
                        {item.name.split('').map((char, i) => (
                          <motion.span
                            key={i}
                            className="inline-block"
                            whileHover={{
                              y: [0, -5, 0],
                              rotate: [0, 5, -5, 0],
                            }}
                            transition={{
                              duration: 0.5,
                              delay: i * 0.03,
                              ease: 'easeInOut',
                            }}
                          >
                            {char === ' ' ? '\u00A0' : char}
                          </motion.span>
                        ))}
                      </motion.span>

                      {/* Animated underline with gradient */}
                      <motion.div
                        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-white via-white/80 to-white rounded-full"
                        initial={{ scaleX: 0, width: '0%' }}
                        whileHover={{
                          scaleX: 1,
                          width: '100%',
                        }}
                        transition={{
                          duration: 0.4,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                        style={{ originX: 0 }}
                      />

                      {/* Left border accent */}
                      <motion.div
                        className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-l-xl"
                        initial={{ scaleY: 0 }}
                        whileHover={{
                          scaleY: 1,
                        }}
                        transition={{
                          duration: 0.3,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                        style={{ originY: 0 }}
                      />

                      {/* Shadow effect */}
                      <motion.div
                        className="absolute inset-0 rounded-xl shadow-2xl"
                        initial={{ opacity: 0, boxShadow: '0 0 0px rgba(255, 255, 255, 0)' }}
                        whileHover={{
                          opacity: 1,
                          boxShadow: '0 10px 40px rgba(255, 255, 255, 0.3)',
                        }}
                        transition={{
                          duration: 0.3,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                      />
                    </motion.button>
                  </motion.li>
                ))}
              </ul>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
