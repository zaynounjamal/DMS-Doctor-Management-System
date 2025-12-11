import React, { useMemo } from 'react'

const AppointmentForm = ({ doctor, date, time, onSubmit, loading, error }) => {
  const dateTimeLabel = useMemo(() => {
    if (!date || !time) return ''
    // Date object handling
    const d = new Date(date)
    const ds = d.toLocaleDateString()
    return `${ds} ${time.displayTime}`
  }, [date, time])

  const isValid = doctor && date && time

  return (
    <div className="w-full">
      <div className="rounded-xl border border-gray-200 dark:border-muted-dark bg-white dark:bg-secondary-dark shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-muted-dark">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Summary</h3>
        </div>
        <div className="px-4 py-4 space-y-3">
          <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <li><span className="font-medium text-gray-600 dark:text-gray-400">Doctor:</span> {doctor?.fullName || doctor?.name || '-'} {doctor?.specialization ? `(${doctor.specialization})` : ''}</li>
            <li><span className="font-medium text-gray-600 dark:text-gray-400">Date:</span> {date ? new Date(date).toLocaleDateString() : '-'}</li>
            <li><span className="font-medium text-gray-600 dark:text-gray-400">Time:</span> {time?.displayTime || '-'}</li>
          </ul>
          {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">{error}</div>}
          <button
            disabled={!isValid || loading}
            onClick={onSubmit}
            className={`w-full px-4 py-3 rounded-lg font-semibold text-white ${isValid ? 'bg-primary-light dark:bg-primary-dark hover:opacity-90' : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'}`}
          >
            {loading ? 'Booking...' : 'Book Appointment'}
          </button>
          {isValid && dateTimeLabel && (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              You will receive a confirmation once your appointment is booked.
            </div>
          )}
        </div>
      </div>
    </div>
  )}

export default AppointmentForm
