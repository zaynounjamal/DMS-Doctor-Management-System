import React, { useState } from 'react'
import { Button } from '../ui/button'

const NoteSection = ({ value, onChange }) => {
  const [opened, setOpened] = useState(false)
  return (
    <div className="w-full">
      <div className="rounded-xl border border-gray-200 dark:border-muted-dark bg-white dark:bg-secondary-dark shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Additional Note</h3>
          <Button size="sm" variant="ghost" onClick={() => setOpened((v) => !v)}>
            {opened ? 'Hide' : 'Add Note'}
          </Button>
        </div>
        
        {opened && (
          <div className="px-4 pb-4 animate-in slide-in-from-top-1">
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              rows={4}
              placeholder="Provide any helpful context for the doctor (e.g., symptoms, duration, allergies)."
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default NoteSection
