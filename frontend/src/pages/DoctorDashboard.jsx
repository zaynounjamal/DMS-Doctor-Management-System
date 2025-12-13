import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import AppointmentCard from '../components/AppointmentCard';
import MarkAsDoneModal from '../components/MarkAsDoneModal';
import { getDoctorDashboard, getTodayAppointments, completeAppointment } from '../doctorApi';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showMarkAsDoneModal, setShowMarkAsDoneModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardData, appointments] = await Promise.all([
        getDoctorDashboard(),
        getTodayAppointments()
      ]);
      setStats(dashboardData);
      setTodayAppointments(appointments);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      alert('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsDone = (appointment) => {
    setSelectedAppointment(appointment);
    setShowMarkAsDoneModal(true);
  };

  const handleSubmitCompletion = async (finalPrice, completionNotes) => {
    try {
      await completeAppointment(selectedAppointment.id, finalPrice, completionNotes);
      await loadDashboardData(); // Reload data
      setShowMarkAsDoneModal(false);
    } catch (error) {
      throw error;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#333' }}>
          Doctor Dashboard
        </h1>
        <p style={{ margin: '8px 0 0 0', fontSize: '16px', color: '#666' }}>
          Welcome back! Here's your overview for today.
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <StatCard
          title="Today's Appointments"
          value={stats?.todayAppointments || 0}
          subtitle={`${stats?.completedToday || 0} completed, ${stats?.pendingToday || 0} pending`}
          icon="📅"
          color="#667eea"
        />
        <StatCard
          title="Actual Profit Today"
          value={`$${(stats?.actualProfitToday || 0).toFixed(2)}`}
          subtitle="Completed & Paid"
          icon="💰"
          color="#10b981"
        />
        <StatCard
          title="Expected Profit Today"
          value={`$${(stats?.expectedProfitToday || 0).toFixed(2)}`}
          subtitle="All Completed"
          icon="📊"
          color="#f59e0b"
        />
        <StatCard
          title="Total Patients"
          value={stats?.totalPatients || 0}
          subtitle="Lifetime"
          icon="👥"
          color="#8b5cf6"
        />
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333', marginBottom: '16px' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/doctor/appointments')}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: '#667eea',
              color: 'white',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5568d3'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#667eea'}
          >
            📅 View All Appointments
          </button>
          <button
            onClick={() => navigate('/doctor/patients')}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: '#10b981',
              color: 'white',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
          >
            👥 View Patients
          </button>
          <button
            onClick={() => navigate('/doctor/profit')}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: '#f59e0b',
              color: 'white',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
          >
            📊 Profit Analytics
          </button>
        </div>
      </div>

      {/* Today's Appointments */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333', margin: 0 }}>
            Today's Appointments ({todayAppointments.length})
          </h2>
          {todayAppointments.length > 0 && (
            <button
              onClick={() => navigate('/doctor/appointments')}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 'bold',
                border: '2px solid #667eea',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#667eea',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#667eea';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = '#667eea';
              }}
            >
              View All →
            </button>
          )}
        </div>

        {todayAppointments.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '60px 20px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📅</div>
            <h3 style={{ fontSize: '20px', color: '#333', marginBottom: '8px' }}>No appointments today</h3>
            <p style={{ fontSize: '14px', color: '#666' }}>Enjoy your free time!</p>
          </div>
        ) : (
          <div>
            {todayAppointments.slice(0, 5).map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onMarkAsDone={handleMarkAsDone}
                onViewNotes={(apt) => navigate(`/doctor/appointments?appointmentId=${apt.id}`)}
              />
            ))}
            {todayAppointments.length > 5 && (
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button
                  onClick={() => navigate('/doctor/appointments')}
                  style={{
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    color: '#666',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  View {todayAppointments.length - 5} more appointments
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mark as Done Modal */}
      {showMarkAsDoneModal && (
        <MarkAsDoneModal
          appointment={selectedAppointment}
          onClose={() => setShowMarkAsDoneModal(false)}
          onSubmit={handleSubmitCompletion}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
