import React from 'react';
import { FileText, Calendar, Pencil } from 'lucide-react';

const MedicalNotesList = ({ notes, onEdit }) => {
  if (!notes || notes.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        background: '#000000',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '1px solid rgba(155, 89, 182, 0.2)',
        boxShadow: '0 8px 32px rgba(155, 89, 182, 0.2)',
        color: '#ccc'
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
            background: '#000000',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid rgba(155, 89, 182, 0.2)',
            boxShadow: '0 8px 32px rgba(155, 89, 182, 0.2)',
            padding: '24px',
            borderLeft: '4px solid #667eea',
            transition: 'box-shadow 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>
                Dr. {note.doctorName}
              </div>
              <div style={{ fontSize: '12px', color: '#ccc', marginTop: '4px' }}>
                {new Date(note.createdAt).toLocaleString()}
                {note.isEdited && (
                  <span style={{ marginLeft: '8px', color: '#f59e0b' }}>
                    (Edited {new Date(note.updatedAt).toLocaleString()})
                  </span>
                )}
              </div>
              {note.appointmentDate && (
                <div style={{ fontSize: '12px', color: '#ccc', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                  backgroundColor: '#667eea',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5568d3'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#667eea'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Pencil size={12} color="#fff" />
                  Edit
                </div>
              </button>
            )}
          </div>

          {/* Note Content */}
          <div style={{
            fontSize: '14px',
            color: '#fff',
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
