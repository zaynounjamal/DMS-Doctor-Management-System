import React from 'react'
import { Calendar as UiCalendar } from '../ui/calendar'

// Props:
// - selectedDate: Date | null
// - onChange: (Date) => void
// - displayedDates: string[] (ISO dates that are available) - CHANGED from schedule logic to explicit available dates list from DMS API
// - disabled: boolean
const AppointmentCalendar = ({ selectedDate, onChange, availableDates = [], disabled }) => {
  const todayStr = new Date().toISOString().slice(0,10)

  const isPastDay = (date) => date.toISOString().slice(0,10) < todayStr

  // In DMS, we get a list of available dates.
  const isAvailableDay = (date) => {
    const day = date.toISOString().slice(0,10)
    return availableDates.includes(day)
  }

  const handleSelect = (date) => {
    if (!date) return
    const dayStr = date.toISOString().slice(0,10)
    if (dayStr < todayStr || disabled) return
    // Only allow selecting available days
    if (availableDates.length > 0 && !isAvailableDay(date)) return
    
    onChange(date)
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-muted-dark bg-white dark:bg-secondary-dark shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-muted-dark flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Select Date</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Choose an available day to view time slots</p>
        </div>
      </div>

      {/* Calendar Body */}
      <div className="p-3 sm:p-4">
        <div className="rounded-lg shadow-sm bg-white dark:bg-secondary-dark p-2 sm:p-3 flex justify-center">
          <UiCalendar
            mode="single"
            selected={selectedDate || undefined}
            onSelect={handleSelect}
            className="rounded-lg border shadow-sm mx-auto"
            captionLayout="buttons"
            disabled={(date) => isPastDay(date) || !!disabled || (availableDates.length > 0 && !availableDates.includes(date.toISOString().slice(0,10)))}
            modifiers={{ 
                available: isAvailableDay 
            }}
            modifiersClassNames={{
              available: 'bg-green-200 text-green-900 font-bold',
            }}
          />
        </div>

        {/* Legend */}
        <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-green-200"></span> Available</span>
          <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-primary-light"></span> Selected</span>
          <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-gray-300"></span> Unavailable/Past</span>
        </div>
      </div>
    </div>
  )
}

export default AppointmentCalendar
