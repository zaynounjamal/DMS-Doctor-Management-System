import React from 'react'

const TimeSelector = ({ timeSlots = [], value, onChange, disabled }) => {
  // DMS returns timeSlots as array of objects: { time: "09:00:00", displayTime: "09:00 AM", isAvailable: true }
  
  if (timeSlots.length === 0) return null

  return (
    <div>
      <h3 className="font-semibold mb-2">Select Time</h3>
      <div className="rounded-lg border border-gray-200 dark:border-muted-dark overflow-hidden">
        <ul className="divide-y divide-gray-200 dark:divide-muted-dark max-h-80 overflow-auto">
          {timeSlots.map((slot, index) => {
            const isBooked = !slot.isAvailable
            const isSelected = value?.time === slot.time
            
            return (
              <li key={index} className="bg-white dark:bg-secondary-dark">
                <button
                  type="button"
                  disabled={disabled || isBooked}
                  onClick={() => onChange(slot)}
                  className={`w-full text-left px-4 py-3 transition flex items-center justify-between ${
                    isBooked
                      ? 'opacity-60 cursor-not-allowed text-gray-400'
                      : 'hover:bg-slate-50 dark:hover:bg-gray-800'
                  } ${
                    isSelected
                      ? 'bg-primary-light/10 dark:bg-primary-dark/20 text-primary-light dark:text-primary-dark'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  <span className="font-medium">{slot.displayTime}</span>
                  <span
                    className={`text-xs rounded-full px-2 py-0.5 border ${
                      isBooked
                        ? 'border-red-300 text-red-600 bg-red-50 dark:bg-red-900/20'
                        : isSelected
                        ? 'border-primary-light text-primary-light dark:border-primary-dark dark:text-primary-dark bg-transparent'
                        : 'border-gray-300 text-gray-500'
                    }`}
                  >
                    {isBooked ? 'Reserved' : isSelected ? 'Selected' : 'Available'}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default TimeSelector
