import React from 'react';

const AppointmentCard = ({ appointment, onMarkAsDone, onViewNotes, showActions = true }) => {
  const getStatusColor = (status, isCompleted) => {
    if (isCompleted) return '#10b981'; // green
    if (status === 'cancelled') return '#ef4444'; // red
    return '#f59e0b'; // orange for scheduled
  };

  const getPaymentStatusColor = (status) => {
    return status === 'paid' ? '#10b981' : '#ef4444';
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: `2px solid ${appointment.isCompleted ? '#10b98120' : '#f59e0b20'}`,
      transition: 'all 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
            {appointment.patient?.fullName || 'Unknown Patient'}
          </h3>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
            📞 {appointment.patient?.phone || 'N/A'}
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            backgroundColor: `${getStatusColor(appointment.status, appointment.isCompleted)}20`,
            color: getStatusColor(appointment.status, appointment.isCompleted)
          }}>
            {appointment.isCompleted ? '✓ Completed' : appointment.status}
          </div>
        </div>
      </div>

      {/* Time and Date */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>📅</span>
          <span style={{ fontSize: '14px', color: '#666' }}>
            {new Date(appointment.appointmentDate).toLocaleDateString()}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>🕐</span>
          <span style={{ fontSize: '14px', color: '#666' }}>
            {appointment.appointmentTime}
          </span>
        </div>
        {appointment.medicalNotesCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>📝</span>
            <span style={{ fontSize: '14px', color: '#666' }}>
              {appointment.medicalNotesCount} note{appointment.medicalNotesCount > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Price and Payment */}
      {appointment.finalPrice && (
        <div style={{ display: 'flex', gap: '20px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>💰</span>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
              ${appointment.finalPrice.toFixed(2)}
            </span>
          </div>
          <div style={{
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold',
            backgroundColor: `${getPaymentStatusColor(appointment.paymentStatus)}20`,
            color: getPaymentStatusColor(appointment.paymentStatus)
          }}>
            {appointment.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Unpaid'}
          </div>
        </div>
      )}

      {/* Patient Notes */}
      {appointment.notes && (
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '12px',
          borderLeft: '3px solid #667eea'
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: 'bold' }}>
            Patient Notes:
          </div>
          <div style={{ fontSize: '14px', color: '#333' }}>
            {appointment.notes}
          </div>
        </div>
      )}

      {/* Completion Notes */}
      {appointment.completionNotes && (
        <div style={{
          backgroundColor: '#f0fdf4',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '12px',
          borderLeft: '3px solid #10b981'
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: 'bold' }}>
            Completion Notes:
          </div>
          <div style={{ fontSize: '14px', color: '#333' }}>
            {appointment.completionNotes}
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
          {!appointment.isCompleted && (
            <button
              onClick={() => onMarkAsDone(appointment)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
            >
              ✓ Mark as Done
            </button>
          )}
          
          <button
            onClick={() => onViewNotes(appointment)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5568d3'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#667eea'}
          >
            📝 View Notes
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;
