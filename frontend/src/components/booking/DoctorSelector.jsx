import React from 'react'

const DoctorSelector = ({ doctors, value, onChange, loading, error }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Doctor</label>
      <select
        className="w-full px-4 py-3 border rounded-lg bg-white dark:bg-secondary-dark text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-light dark:focus:ring-accent-dark border-gray-300 dark:border-muted-dark"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
      >
        <option value="" disabled>{loading ? 'Loading...' : 'Choose a doctor'}</option>
        {doctors.map((d) => (
          <option key={d.id} value={d.id}>{d.fullName || d.name} {d.specialization ? `- ${d.specialization}` : ''}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>}
    </div>
  )
}

export default DoctorSelector
