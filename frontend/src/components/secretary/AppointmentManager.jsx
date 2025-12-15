import React, { useState, useEffect } from 'react';
import { getSecretaryAppointments, updateAppointmentStatus, markAsPaid, rescheduleAppointment } from '../../secretaryApi';
import { useToast } from '../../contexts/ToastContext';
import { Search, Filter } from 'lucide-react';

const AppointmentManager = ({ selectedDoctor }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('today');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rescheduleData, setRescheduleData] = useState(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all'); // all, paid, unpaid
  const [statusFilter, setStatusFilter] = useState('all'); // all, scheduled, checked-in, cancelled

  useEffect(() => {
    fetchAppointments();
  }, [activeTab, selectedDoctor]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await getSecretaryAppointments(activeTab, null, selectedDoctor || null);
      setAppointments(data);
    } catch (error) {
      console.error(error);
      showToast('Failed to load appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateAppointmentStatus(id, status);
      showToast(`Appointment ${status === 'cancelled' ? 'cancelled' : 'updated'} successfully`, 'success');
      fetchAppointments();
    } catch (error) {
      showToast(error.message || 'Failed to update status', 'error');
    }
  };

  const handlePayment = async (id) => {
    if (!window.confirm('Mark this appointment as PAID? Cannot be undone.')) return;
    try {
      await markAsPaid(id);
      showToast('Payment marked successfully!', 'success');
      fetchAppointments();
    } catch (error) {
      showToast(error.message || 'Failed to mark as paid', 'error');
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      await rescheduleAppointment(rescheduleData.id, rescheduleData.date, rescheduleData.time);
      setRescheduleData(null);
      showToast('Appointment rescheduled successfully!', 'success');
      fetchAppointments();
    } catch (error) {
      showToast(error.message || 'Failed to reschedule', 'error');
    }
  };

  // Filter appointments based on search and filters
  const filteredAppointments = appointments.filter(appt => {
    const matchesSearch = searchQuery === '' || 
      appt.patient.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.patient.phone.includes(searchQuery);
    
    const matchesPayment = paymentFilter === 'all' || appt.paymentStatus === paymentFilter;
    const matchesStatus = statusFilter === 'all' || appt.status === statusFilter;
    
    return matchesSearch && matchesPayment && matchesStatus;
  });

  const tabs = [
    { id: 'today', label: 'Today' },
    { id: 'tomorrow', label: 'Tomorrow' },
    { id: 'future', label: 'Future' },
    { id: 'past', label: 'Past' }
  ];

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by patient name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid Only</option>
            <option value="unpaid">Unpaid Only</option>
          </select>
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="checked-in">Checked In</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <div className="text-sm text-gray-600">
          Showing {filteredAppointments.length} of {appointments.length} appointments
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium transition-colors duration-200 ${
              activeTab === tab.id 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading appointments...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time/Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    {searchQuery || paymentFilter !== 'all' || statusFilter !== 'all' 
                      ? 'No appointments match your filters.'
                      : `No appointments found for ${activeTab}.`}
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{appt.appointmentTime}</div>
                      <div className="text-sm text-gray-500">{appt.appointmentDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{appt.patient.fullName}</div>
                      <div className="text-sm text-gray-500">{appt.patient.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${appt.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
                          appt.status === 'checked-in' ? 'bg-green-100 text-green-800' :
                          appt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                         <span className={`text-sm font-medium ${appt.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                            {appt.paymentStatus === 'paid' ? 'PAID' : 'UNPAID'}
                         </span>
                         <span className="text-xs text-gray-500">
                           (${appt.finalPrice ?? appt.price ?? '?'})
                         </span>
                         {appt.paymentStatus !== 'paid' && appt.status !== 'cancelled' && (
                           <button 
                             onClick={() => handlePayment(appt.id)}
                             className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                           >
                             Pay
                           </button>
                         )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {appt.status === 'scheduled' && (
                        <button
                          onClick={() => handleStatusChange(appt.id, 'checked-in')}
                          className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded"
                        >
                          Check In
                        </button>
                      )}
                      
                      {appt.status !== 'cancelled' && appt.status !== 'done' && (
                        <>
                            <button
                                onClick={() => setRescheduleData({ id: appt.id, date: appt.appointmentDate, time: appt.appointmentTime })}
                                className="text-indigo-600 hover:text-indigo-900"
                            >
                                Reschedule
                            </button>
                            <button
                                onClick={() => handleStatusChange(appt.id, 'cancelled')}
                                className="text-red-600 hover:text-red-900"
                            >
                                Cancel
                            </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">Reschedule Appointment</h3>
            <form onSubmit={handleRescheduleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Time</label>
                <input
                  type="time"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                  value={rescheduleData.time}
                  onChange={(e) => setRescheduleData({...rescheduleData, time: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRescheduleData(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManager;
