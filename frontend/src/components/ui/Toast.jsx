import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  light: {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  },
  dark: {
    success: 'bg-green-900/30 text-green-300 border-green-800',
    error: 'bg-red-900/30 text-red-300 border-red-800',
    info: 'bg-blue-900/30 text-blue-300 border-blue-800',
    warning: 'bg-yellow-900/30 text-yellow-300 border-yellow-800',
  },
};

const Toast = ({ id, type = 'info', message, onClose, duration = 4000 }) => {
  const { theme } = useTheme();
  const Icon = icons[type];
  const colorClass = theme === 'light' ? colors.light[type] : colors.dark[type];

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm
        max-w-sm w-full pointer-events-auto
        ${colorClass}
      `}
      role="alert"
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 text-sm font-medium leading-relaxed">
        {message}
      </div>
      <button
        onClick={() => onClose(id)}
        className="p-1 -mr-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

export default Toast;
