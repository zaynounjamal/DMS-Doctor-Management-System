import React, { useState, useEffect } from 'react';
import { getMyAppointments, cancelAppointment } from './api';
import './BookAppointment.css'; // Reusing styles for consistency

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await getMyAppointments();
      setAppointments(data);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      await cancelAppointment(id);
      setMessage({ type: 'success', text: 'Appointment cancelled successfully' });
      loadAppointments(); // Refresh list
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const canCancel = (dateStr, timeStr) => {
    const appointmentDate = new Date(`${dateStr}T${timeStr}`);
    const now = new Date();
    const hoursDiff = (appointmentDate - now) / (1000 * 60 * 60);
    return hoursDiff > 12;
  };

  if (loading) return <div className="loading">Loading appointments...</div>;

  return (
    <div className="booking-container">
      <h2>My Appointments</h2>
      
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {appointments.length === 0 ? (
        <p>You have no appointments scheduled.</p>
      ) : (
        <div className="appointments-list">
          {appointments.map((apt) => (
            <div key={apt.id} className="appointment-card" style={{ 
              border: '1px solid #ddd', 
              padding: '15px', 
              marginBottom: '10px', 
              borderRadius: '8px',
              backgroundColor: apt.status === 'Cancelled' ? '#f8f9fa' : 'white'
            }}>
              <div className="apt-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>{apt.doctor.fullName}</h3>
                <span className={`status-badge ${apt.status.toLowerCase()}`} style={{
                  padding: '5px 10px',
                  borderRadius: '15px',
                  backgroundColor: apt.status === 'Scheduled' ? '#e3f2fd' : '#ffebee',
                  color: apt.status === 'Scheduled' ? '#1976d2' : '#c62828',
                  fontWeight: 'bold'
                }}>
                  {apt.status}
                </span>
              </div>
              
              <div className="apt-details" style={{ marginTop: '10px' }}>
                <p><strong>Specialty:</strong> {apt.doctor.specialization}</p>
                <p><strong>Date:</strong> {apt.appointmentDate}</p>
                <p><strong>Time:</strong> {apt.appointmentTime}</p>
                {apt.notes && <p><strong>Notes:</strong> {apt.notes}</p>}
              </div>

              {apt.status === 'Scheduled' && (
                <div className="apt-actions" style={{ marginTop: '15px' }}>
                  {canCancel(apt.appointmentDate, apt.appointmentTime) ? (
                    <button 
                      onClick={() => handleCancel(apt.id)}
                      className="cancel-btn"
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel Appointment
                    </button>
                  ) : (
                    <small style={{ color: '#666', fontStyle: 'italic' }}>
                      Cannot cancel (less than 12 hours away)
                    </small>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
