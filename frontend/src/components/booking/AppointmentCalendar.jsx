import React from 'react'
import { Calendar as UiCalendar } from '../ui/calendar'

// Props:
// - selectedDate: Date | null
// - onChange: (Date) => void
// - displayedDates: string[] (ISO dates that are available) - CHANGED from schedule logic to explicit available dates list from DMS API
// - disabled: boolean
const AppointmentCalendar = ({ selectedDate, onChange, availableDates = [], disabled }) => {

  // Helper to compare dates in local time (ignoring time zone shifts from ISOString)
  const toLocalISOString = (date) => {
    const offset = date.getTimezoneOffset() * 60000; // offset in milliseconds
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 10);
  };

  const todayStr = toLocalISOString(new Date());

  const isPastDay = (date) => toLocalISOString(date) < todayStr;

  // In DMS, we get a list of available dates.
  const isAvailableDay = (date) => {
    const day = toLocalISOString(date);
    // DEBUG LOG
    // console.log(`Checking ${day}... Available: ${availableDates.includes(day)}`);
    return availableDates.includes(day);
  }

  const handleSelect = (date) => {
    if (!date) return
    const dayStr = toLocalISOString(date);
    
    if (dayStr < todayStr || disabled) return
    // Only allow selecting available days. If availableDates is empty, nothing matches.
    if (!availableDates.includes(dayStr)) return
    
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
            disabled={(date) => isPastDay(date) || !!disabled || !isAvailableDay(date)}
            modifiers={{ 
                available: isAvailableDay 
            }}
            modifiersClassNames={{
              available: 'bg-green-100 text-green-700 font-bold border-1 border-green-200', // Changed color slightly to be safer
            }}
          />
        </div>

        {/* Legend */}
        <div className="mt-3 text-xs text-gray-600 dark:text-gray-400 flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-green-100 border border-green-200"></span> Available</span>
          <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-primary-light dark:bg-primary-dark"></span> Selected</span>
          <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-gray-100"></span> Unavailable</span>
        </div>
      </div>
    </div>
  )
}

export default AppointmentCalendar
