import React from 'react';
import { Phone, Calendar, Clock, FileText, DollarSign, CheckCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const AppointmentCard = ({ appointment, onMarkAsDone, onViewNotes, showActions = true }) => {
  const { theme } = useTheme();

  const getStatusColor = (status, isCompleted) => {
    if (isCompleted) return '#10b981'; // green
    if (status === 'cancelled') return '#ef4444'; // red
    return '#f59e0b'; // orange for scheduled
  };

  const getPaymentStatusColor = (status) => {
    return status === 'paid' ? '#10b981' : '#ef4444';
  };

  const statusColors = {
    completed: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
    cancelled: 'text-red-500 bg-red-50 dark:bg-red-900/20',
    scheduled: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
  };

  const getStatusClass = (status, isCompleted) => {
    if (isCompleted) return statusColors.completed;
    if (status === 'cancelled') return statusColors.cancelled;
    return statusColors.scheduled;
  };

  const paymentColors = {
    paid: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40',
    unpaid: 'text-red-600 bg-red-100 dark:bg-red-900/40'
  };

  return (
    <div className={`
      relative p-6 rounded-xl border transition-all duration-300 group
      ${theme === 'dark' 
        ? 'bg-gray-800 border-gray-700 hover:border-gray-600 hover:bg-gray-750' 
        : 'bg-white border-gray-100 hover:border-purple-200 hover:shadow-lg'
      }
      ${appointment.isCompleted ? 'opacity-75 hover:opacity-100' : ''}
    `}>
      {/* Status Bar */}
      <div className={`
        absolute left-0 top-6 bottom-6 w-1 rounded-r
        ${appointment.isCompleted ? 'bg-emerald-500' : (appointment.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-500')}
      `} />

      {/* Header */}
      <div className="flex justify-between items-start mb-4 pl-4">
        <div>
          <h3 className={`text-lg font-bold mb-1 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
            {appointment.patient?.fullName || 'Unknown Patient'}
          </h3>
          <div className={`text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <Phone size={16} className="flex-shrink-0" />
            {appointment.patient?.phone || 'N/A'}
          </div>
        </div>
        
        <div className={`
          px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5
          ${getStatusClass(appointment.status, appointment.isCompleted)}
        `}>
          {appointment.isCompleted ? (
            <>
              <CheckCircle size={12} />
              Completed
            </>
          ) : (
            appointment.status
          )}
        </div>
      </div>

      {/* Time and Date */}
      <div className="flex flex-wrap gap-4 mb-4 pl-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="flex-shrink-0" />
          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {new Date(appointment.appointmentDate).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="flex-shrink-0" />
          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            {appointment.appointmentTime}
          </span>
        </div>
        {appointment.medicalNotesCount > 0 && (
          <div className="flex items-center gap-2">
            <FileText size={16} className="flex-shrink-0" />
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {appointment.medicalNotesCount} note{appointment.medicalNotesCount > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Price and Payment */}
      {appointment.finalPrice && (
        <div className="flex flex-wrap gap-4 mb-4 pl-4 items-center">
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="flex-shrink-0" />
            <span className={`text-base font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
              ${appointment.finalPrice.toFixed(2)}
            </span>
          </div>
          <div className={`
            px-2.5 py-0.5 rounded-md text-xs font-bold uppercase
            ${appointment.paymentStatus === 'paid' ? paymentColors.paid : paymentColors.unpaid}
          `}>
            {appointment.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
          </div>
        </div>
      )}

      {/* Patient Notes */}
      {appointment.notes && (
        <div className={`
          ml-4 p-3 rounded-lg border-l-4 mb-3 text-sm
          ${theme === 'dark' ? 'bg-gray-900 border-indigo-500 text-gray-300' : 'bg-indigo-50 border-indigo-500 text-gray-700'}
        `}>
          <div className="font-bold text-xs uppercase mb-1 opacity-70">Patient Notes</div>
          {appointment.notes}
        </div>
      )}

      {/* Completion Notes */}
      {appointment.completionNotes && (
        <div className={`
          ml-4 p-3 rounded-lg border-l-4 mb-3 text-sm
          ${theme === 'dark' ? 'bg-gray-900 border-emerald-500 text-gray-300' : 'bg-emerald-50 border-emerald-500 text-gray-700'}
        `}>
          <div className="font-bold text-xs uppercase mb-1 opacity-70">Completion Notes</div>
          {appointment.completionNotes}
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex gap-3 mt-4 pt-4 border-t pl-4 border-gray-100 dark:border-gray-700">
          {!appointment.isCompleted && (
            <button
              onClick={() => onMarkAsDone(appointment)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-bold transition-colors shadow-sm active:transform active:scale-95 flex items-center gap-2"
            >
              <CheckCircle size={16} />
              Mark as Done
            </button>
          )}
          
          <button
            onClick={() => onViewNotes(appointment)}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-bold transition-colors shadow-sm active:transform active:scale-95 flex items-center gap-2"
          >
            <FileText size={16} />
            View Notes
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;
