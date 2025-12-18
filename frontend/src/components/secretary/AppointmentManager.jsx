import React, { useState, useEffect } from 'react';
import { getSecretaryAppointments, updateAppointmentStatus, markAsPaid, rescheduleAppointment } from '../../secretaryApi';
import { useToast } from '../../contexts/ToastContext';
import { Search, Filter, Calendar, Clock, CreditCard, ChevronDown, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AppointmentManager = ({ selectedDoctor, refreshTrigger }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('today');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rescheduleData, setRescheduleData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all'); // all, paid, unpaid
  const [statusFilter, setStatusFilter] = useState('all'); // all, scheduled, checked-in, cancelled

  useEffect(() => {
    fetchAppointments();
    
    // Auto-refresh every 30 seconds to catch new bookings
    const interval = setInterval(fetchAppointments, 30000);
    return () => clearInterval(interval);
  }, [activeTab, selectedDoctor, refreshTrigger]);

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

  const handlePaymentClick = (appt) => {
      setPaymentData({
          id: appt.id,
          price: appt.finalPrice ?? appt.price ?? 0,
          patientName: appt.patient.fullName,
          patientBalance: appt.patient.balance || 0
      });
  };

  const processPayment = async (method) => {
    if (!paymentData) return;
    try {
      await markAsPaid(paymentData.id, method);
      showToast('Payment successful', 'success');
      setPaymentData(null);
      fetchAppointments(); // Fixed: was loadAppointments which is undefined, used fetchAppointments
    } catch (error) {
        showToast(error.message, 'error');
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
    { id: 'past', label: 'Past' },
    { id: 'all', label: 'All' }
  ];

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-100 mb-6">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-4 text-sm font-bold min-w-[100px] transition-all whitespace-nowrap ${
                  isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {isActive && (
                  <motion.div 
                    layoutId="activeApptTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-50/50 p-6 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          
          <div className="flex flex-wrap gap-4">
            {/* Payment Filter */}
            <div className="relative flex-1 sm:flex-none sm:min-w-[160px]">
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full appearance-none pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
              <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            
            {/* Status Filter */}
            <div className="relative flex-1 sm:flex-none sm:min-w-[160px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="checked-in">Checked In</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 gap-3">
          <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-sm font-medium text-indigo-600">Updating appointments...</span>
        </div>
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
                               onClick={() => handlePaymentClick(appt)}
                               className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                             >
                               Pay
                             </button>
                         )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {appt.status === 'scheduled' && activeTab === 'today' && (
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





  

      {/* Payment Modal */}
      {paymentData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">Process Payment</h3>
            <p className="mb-4 text-gray-600">
                Patient: <span className="font-medium">{paymentData.patientName}</span><br/>
                Amount Due: <span className="font-bold text-green-600">${paymentData.price}</span>
            </p>
            
            <div className="space-y-3">
                <button
                    onClick={() => processPayment('Cash')}
                    className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
                >
                    Pay with Cash
                </button>
                <button
                    onClick={() => processPayment('Card')}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                >
                    Pay with Card
                </button>
                 <button
                    onClick={() => processPayment('Balance')}
                    className="w-full py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={false /* Front-end can't verify balance easily without refetch, let backend handle error */}
                >
                    Pay with Balance
                </button>
            </div>

            <button
               onClick={() => setPaymentData(null)}
               className="mt-4 w-full py-2 px-4 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
            >
               Cancel
            </button>
          </div>
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
