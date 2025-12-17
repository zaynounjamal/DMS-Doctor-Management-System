import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, BarChart3, Users, XCircle, ArrowRight } from 'lucide-react';
import StatCard from '../components/StatCard';
import AppointmentCard from '../components/AppointmentCard';
import MarkAsDoneModal from '../components/MarkAsDoneModal';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { getDoctorDashboard, getTodayAppointments, completeAppointment } from '../doctorApi';
import DoctorWaitingRoom from '../components/doctor/DoctorWaitingRoom';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { error: toastError } = useToast();
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
      if (error.message.includes('401') || error.message.includes('403')) {
        toastError("Session expired. Please log in again.");
        navigate('/');
      } else {
        toastError(`Failed to load dashboard data: ${error.message}`);
      }
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
    <div className={`p-6 max-w-[1400px] mx-auto ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-purple-600 dark:text-purple-400">
          Doctor Dashboard
        </h1>
        <p className={`text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Welcome back! Here's your overview for today.
        </p>
      </div>

      {/* Waiting Room - Priority View */}
      <div className="mb-8">
        <DoctorWaitingRoom />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Today's Appointments"
          value={stats?.todayAppointments || 0}
          subtitle={`${stats?.completedToday || 0} completed, ${stats?.pendingToday || 0} pending`}
          icon={Calendar}
          color="#667eea"
        />
        <StatCard
          title="Actual Profit Today"
          value={`$${(stats?.actualProfitToday || 0).toFixed(2)}`}
          subtitle="Completed & Paid"
          icon={DollarSign}
          color="#10b981"
        />
        <StatCard
          title="Expected Profit Today"
          value={`$${(stats?.expectedProfitToday || 0).toFixed(2)}`}
          subtitle="All Completed"
          icon={BarChart3}
          color="#f59e0b"
        />
        <StatCard
          title="Total Patients"
          value={stats?.totalPatients || 0}
          subtitle="Lifetime"
          icon={Users}
          color="#8b5cf6"
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 text-purple-600 dark:text-purple-400">
          Quick Actions
        </h2>
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => navigate('/doctor/appointments')}
            className="px-6 py-3 text-sm font-bold rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-colors shadow-sm active:scale-95 transform duration-100 flex items-center gap-2"
          >
            <Calendar size={18} />
            View All Appointments
          </button>
          <button
            onClick={() => navigate('/doctor/patients')}
            className="px-6 py-3 text-sm font-bold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors shadow-sm active:scale-95 transform duration-100 flex items-center gap-2"
          >
            <Users size={18} />
            View Patients
          </button>
          <button
            onClick={() => navigate('/doctor/profit')}
            className="px-6 py-3 text-sm font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-sm active:scale-95 transform duration-100 flex items-center gap-2"
          >
            <BarChart3 size={18} />
            Profit Analytics
          </button>
          <button
            onClick={() => navigate('/doctor/offdays')}
            className="px-6 py-3 text-sm font-bold rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors shadow-sm active:scale-95 transform duration-100 flex items-center gap-2"
          >
            <XCircle size={18} />
            Manage Off Days
          </button>
        </div>
      </div>

      {/* Today's Appointments */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: theme === 'dark' ? '#fff' : '#333', margin: 0 }}>
            Today's Appointments ({todayAppointments.length})
          </h2>
          {todayAppointments.length > 0 && (
            <button
              onClick={() => navigate('/doctor/appointments')}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 'bold',
                border: '2px solid #9333ea',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#9333ea',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#9333ea';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = '#9333ea';
              }}
            >
              View All <ArrowRight size={16} style={{ display: 'inline', marginLeft: '4px' }} />
            </button>
          )}
        </div>

        {todayAppointments.length === 0 ? (
          <div style={{
            background: '#000000',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid rgba(155, 89, 182, 0.2)',
            boxShadow: '0 8px 32px rgba(155, 89, 182, 0.2)',
            padding: '60px 20px',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
              <Calendar size={64} style={{ color: '#9333ea' }} />
            </div>
            <h3 style={{ fontSize: '20px', color: '#fff', marginBottom: '8px' }}>No appointments today</h3>
            <p style={{ fontSize: '14px', color: '#ccc' }}>Enjoy your free time!</p>
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
