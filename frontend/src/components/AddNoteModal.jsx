import React, { useState } from 'react';

const AddNoteModal = ({ appointment, existingNote = null, onClose, onSubmit }) => {
  const [note, setNote] = useState(existingNote?.note || '');
  const [loading, setLoading] = useState(false);

  const isEditing = !!existingNote;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!note.trim()) {
      alert('Please enter a note');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(note);
      onClose();
    } catch (error) {
      alert(`Failed to ${isEditing ? 'edit' : 'add'} note: ` + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
            {isEditing ? 'Edit Medical Note' : 'Add Medical Note'}
          </h2>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>
            For {appointment?.patient?.fullName} - {new Date(appointment?.appointmentDate).toLocaleDateString()}
          </p>
          {isEditing && existingNote?.isEdited && (
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#f59e0b' }}>
              ⚠️ This note has been edited before
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Note */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '8px'
            }}>
              Medical Note <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
              rows={8}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              placeholder="Enter medical notes for this appointment..."
            />
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>
              📝 Notes can be edited but not deleted
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 'bold',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: '#666',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#f9fafb')}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#667eea',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#5568d3')}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#667eea'}
            >
              {loading ? 'Saving...' : (isEditing ? '💾 Update Note' : '📝 Add Note')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNoteModal;
