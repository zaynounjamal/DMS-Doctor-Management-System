import React from 'react';

const MedicalNotesList = ({ notes, onEdit }) => {
  if (!notes || notes.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        color: '#999'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
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
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #667eea',
            transition: 'box-shadow 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                Dr. {note.doctorName}
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                {new Date(note.createdAt).toLocaleString()}
                {note.isEdited && (
                  <span style={{ marginLeft: '8px', color: '#f59e0b' }}>
                    (Edited {new Date(note.updatedAt).toLocaleString()})
                  </span>
                )}
              </div>
              {note.appointmentDate && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  📅 Appointment: {new Date(note.appointmentDate).toLocaleDateString()} at {note.appointmentTime}
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
                ✏️ Edit
              </button>
            )}
          </div>

          {/* Note Content */}
          <div style={{
            fontSize: '14px',
            color: '#333',
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
