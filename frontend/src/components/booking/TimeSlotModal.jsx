import React, { useEffect } from 'react'
import { X } from 'lucide-react'

const TimeSlotModal = ({ isOpen, onClose, timeSlots = [], value, onChange, disabled, loading }) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleSlotClick = (slot) => {
    onChange(slot)
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md bg-white dark:bg-secondary-dark rounded-2xl shadow-2xl max-h-[85vh] flex flex-col animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-muted-dark">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Select Time Slot
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light dark:border-primary-dark"></div>
            </div>
          ) : timeSlots.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No available time slots for this date
            </div>
          ) : (
            <div className="space-y-2">
              {timeSlots.map((slot, index) => {
                const isBooked = !slot.isAvailable
                const isSelected = value?.time === slot.time
                
                return (
                  <button
                    key={index}
                    type="button"
                    disabled={disabled || isBooked}
                    onClick={() => handleSlotClick(slot)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center justify-between ${
                      isBooked
                        ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
                        : 'hover:bg-slate-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                    } ${
                      isSelected
                        ? 'bg-primary-light/10 dark:bg-primary-dark/20 border-primary-light dark:border-primary-dark'
                        : ''
                    }`}
                  >
                    <span className={`font-medium ${
                      isBooked 
                        ? 'text-gray-400 dark:text-gray-500' 
                        : isSelected
                        ? 'text-primary-light dark:text-primary-dark'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {slot.displayTime}
                    </span>
                    <span
                      className={`text-xs rounded-full px-3 py-1 font-medium ${
                        isBooked
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          : isSelected
                          ? 'bg-primary-light/20 text-primary-light dark:bg-primary-dark/30 dark:text-primary-dark'
                          : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                      }`}
                    >
                      {isBooked ? 'Reserved' : isSelected ? 'Selected' : 'Available'}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-6 py-3 border-t border-gray-200 dark:border-muted-dark bg-gray-50 dark:bg-gray-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Click a time slot to select, or press ESC to close
          </p>
        </div>
      </div>
    </div>
  )
}

export default TimeSlotModal
