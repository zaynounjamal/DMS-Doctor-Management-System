import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`
            w-full max-w-md rounded-xl p-6 shadow-2xl border
            ${theme === 'light' ? 'bg-white border-gray-100' : 'bg-gray-800 border-gray-700'}
          `}
        >
          <div className="flex items-start gap-4">
            <div className={`
              p-3 rounded-full flex-shrink-0
              ${type === 'danger' 
                ? (theme === 'light' ? 'bg-red-100 text-red-600' : 'bg-red-900/30 text-red-400')
                : (theme === 'light' ? 'bg-blue-100 text-blue-600' : 'bg-blue-900/30 text-blue-400')
              }
            `}>
              <AlertTriangle size={24} />
            </div>
            
            <div className="flex-1">
              <h3 className={`text-lg font-semibold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                {title}
              </h3>
              <p className={`text-sm leading-relaxed mb-6 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                {message}
              </p>
              
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={onCancel}
                  className={`
                    px-4 py-2 text-sm font-medium rounded-lg transition-colors
                    ${theme === 'light' 
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    }
                  `}
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className={`
                    px-4 py-2 text-sm font-medium rounded-lg shadow-sm transition-colors
                    ${type === 'danger'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                    }
                  `}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmationModal;
