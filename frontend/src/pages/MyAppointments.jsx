import React, { useState, useEffect } from 'react';
import { getMyAppointments, cancelAppointment } from '../api';
import { Calendar, Clock, MapPin, AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';
import BackButton from '../components/ui/BackButton';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [cancelModal, setCancelModal] = useState({ show: false, id: null });

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await getMyAppointments();
      // Sort appointments: Scheduled first, then by date descending
      const sortedData = data.sort((a, b) => {
        if (a.status === 'Scheduled' && b.status !== 'Scheduled') return -1;
        if (a.status !== 'Scheduled' && b.status === 'Scheduled') return 1;
        return new Date(b.appointmentDate) - new Date(a.appointmentDate);
      });
      setAppointments(sortedData);
    } catch (error) {
      showMessage('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    // Auto-dismiss success messages
    if (type === 'success') {
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const initiateCancel = (id) => {
    setCancelModal({ show: true, id });
  };

  const confirmCancel = async () => {
    const { id } = cancelModal;
    setCancelModal({ show: false, id: null });
    
    try {
      await cancelAppointment(id);
      showMessage('success', 'Appointment cancelled successfully');
      loadAppointments(); // Refresh list
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  const canCancel = (dateStr, timeStr) => {
    const appointmentDate = new Date(`${dateStr}T${timeStr}`);
    const now = new Date();
    const hoursDiff = (appointmentDate - now) / (1000 * 60 * 60);
    return hoursDiff > 12;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <BackButton to="/profile" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Appointments</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your upcoming visits and history.</p>
          </div>
          {/* Stats Summary could go here */}
        </div>

        {/* Message Toast/Alert */}
        {message && (
          <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
            message.type === 'error' 
              ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400' 
              : 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
          }`}>
            {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            <p className="font-medium">{message.text}</p>
            <button onClick={() => setMessage(null)} className="ml-auto hover:opacity-70"><XCircle size={18} /></button>
          </div>
        )}

        {appointments.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400">
               <Calendar size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Appointments Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">You haven't booked any appointments. Find a doctor to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.map((apt) => {
               const statusColors = {
                 Scheduled: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
                 Cancelled: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
                 Completed: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
               };
               const statusStyle = statusColors[apt.status] || 'bg-gray-50 text-gray-700 border-gray-200';
               const isCancellable = apt.status === 'Scheduled' && canCancel(apt.appointmentDate, apt.appointmentTime);

               return (
                <div key={apt.id} className={`group relative bg-white dark:bg-gray-800 rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg ${apt.status === 'Cancelled' ? 'opacity-75 border-gray-100 dark:border-gray-700 bg-gray-50/50' : 'border-gray-100 dark:border-gray-700'}`}>
                  
                  {/* Status Badge */}
                  <div className="flex justify-between items-start mb-4">
                     <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${statusStyle}`}>
                       {apt.status}
                     </span>
                     <span className="text-sm font-medium text-gray-400 flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(apt.appointmentDate).toLocaleDateString()}
                     </span>
                  </div>

                  {/* Doctor Info */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary-light transition-colors">{apt.doctor.fullName}</h3>
                    <p className="text-primary-light dark:text-primary-dark font-medium text-sm">{apt.doctor.specialization}</p>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-6">
                     <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Clock size={16} className="text-gray-400" />
                        <span>{apt.appointmentTime}</span>
                     </div>
                     {apt.notes && (
                       <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                          <Info size={16} className="text-gray-400 shrink-0 mt-0.5" />
                          <p className="line-clamp-2">{apt.notes}</p>
                       </div>
                     )}
                  </div>

                  {/* Actions */}
                  {apt.status === 'Scheduled' && (
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                      {isCancellable ? (
                        <button 
                          onClick={() => initiateCancel(apt.id)}
                          className="w-full py-2.5 px-4 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
                        >
                          Cancel Appointment
                        </button>
                      ) : (
                        <p className="text-xs text-center text-gray-400 italic">
                          Cannot cancel (less than 12h)
                        </p>
                      )}
                    </div>
                  )}
                </div>
               );
            })}
          </div>
        )}
      </div>

      {/* Custom Confirmation Modal */}
      {cancelModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4 text-red-600 dark:text-red-400">
               <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                 <AlertCircle size={24} />
               </div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-white">Cancel Appointment?</h3>
            </div>
            
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setCancelModal({ show: false, id: null })}
                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                No, Keep it
              </button>
              <button 
                onClick={confirmCancel}
                className="px-5 py-2.5 rounded-xl bg-red-600 dark:bg-red-700 text-white font-medium hover:bg-red-700 dark:hover:bg-red-600 shadow-lg shadow-red-600/20 transition-all hover:scale-105"
              >
                Yes, Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
