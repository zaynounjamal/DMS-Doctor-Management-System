import React from 'react';
import { FileText, Calendar, Pencil } from 'lucide-react';

const MedicalNotesList = ({ notes, onEdit }) => {
  if (!notes || notes.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '1px solid rgba(147, 51, 234, 0.1)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        color: '#6b7280'
      }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
          <FileText size={48} color="#9333ea" />
        </div>
        <p>No medical notes yet</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {notes.map((note) => (
        <div
          key={note.id}
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid rgba(147, 51, 234, 0.1)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            padding: '24px',
            borderLeft: '4px solid #9333ea',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(147, 51, 234, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.1)';
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>
                Dr. {note.doctorName}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                {new Date(note.createdAt).toLocaleString()}
                {note.isEdited && (
                  <span style={{ marginLeft: '8px', color: '#f59e0b' }}>
                    (Edited {new Date(note.updatedAt).toLocaleString()})
                  </span>
                )}
              </div>
              {note.appointmentDate && (
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} color="#9333ea" />
                  Appointment: {new Date(note.appointmentDate).toLocaleDateString()} at {note.appointmentTime}
                </div>
              )}
            </div>
            {onEdit && (
              <button
                onClick={() => onEdit(note)}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(147, 51, 234, 0.1)',
                  color: '#9333ea',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(147, 51, 234, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(147, 51, 234, 0.1)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Pencil size={12} color="#9333ea" />
                  Edit
                </div>
              </button>
            )}
          </div>

          {/* Note Content */}
          <div style={{
            fontSize: '14px',
            color: '#374151',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap'
          }}>
            {note.note}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MedicalNotesList;
