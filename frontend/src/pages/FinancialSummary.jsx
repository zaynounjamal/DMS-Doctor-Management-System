import React, { useState, useEffect } from 'react';
import { getFinancialSummary } from '../api';
import { DollarSign, CreditCard, AlertTriangle, CheckCircle, Wallet, Calendar, User } from 'lucide-react';
import BackButton from '../components/ui/BackButton';

const FinancialSummary = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadFinancialSummary();
  }, []);

  const loadFinancialSummary = async () => {
    try {
      const result = await getFinancialSummary();
      setData(result);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light"></div>
       </div>
     );
  }

  if (!data) return (
     <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center">
           <h2 className="text-xl font-semibold text-gray-900 dark:text-white">No data available</h2>
           <p className="text-gray-500 dark:text-gray-400">Unable to load financial summary.</p>
        </div>
     </div>
  );

  const { summary, appointments } = data;

  const StatCard = ({ title, amount, icon: Icon, colorClass, bgClass, borderClass }) => (
     <div className={`p-6 rounded-2xl border ${bgClass} ${borderClass} shadow-sm flex items-center gap-4 transition-transform hover:scale-105 duration-300`}>
        <div className={`p-3 rounded-xl ${colorClass.replace('text-', 'bg-')}/10 flex items-center justify-center`}>
           <Icon className={`w-8 h-8 ${colorClass}`} />
        </div>
        <div>
           <p className={`text-sm font-medium ${colorClass} opacity-80 uppercase tracking-wide`}>{title}</p>
           <h3 className={`text-3xl font-bold ${colorClass}`}>${amount.toFixed(2)}</h3>
        </div>
     </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
         <BackButton to="/profile" />
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Summary</h1>
               <p className="text-gray-500 dark:text-gray-400 mt-1">Overview of your payments and outstanding balances.</p>
            </div>
         </div>

        {message && (
          <div className={`p-4 rounded-xl border flex items-center gap-3 ${
            message.type === 'error' 
              ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800' 
              : 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800'
          }`}>
             <p>{message.text}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <StatCard 
              title="Total Paid" 
              amount={summary.totalPaid} 
              icon={CheckCircle} 
              colorClass="text-green-600"
              bgClass="bg-white dark:bg-gray-800"
              borderClass="border-green-100 dark:border-green-900/30"
           />
           <StatCard 
              title="Total Unpaid" 
              amount={summary.totalUnpaid} 
              icon={AlertTriangle} 
              colorClass="text-red-600"
              bgClass="bg-white dark:bg-gray-800"
              borderClass="border-red-100 dark:border-red-900/30"
           />
           <StatCard 
              title="Remaining Balance" 
              amount={summary.remainingBalance} 
              icon={Wallet} 
              colorClass="text-orange-600"
              bgClass="bg-white dark:bg-gray-800"
              borderClass="border-orange-100 dark:border-orange-900/30"
           />
           <StatCard 
              title="Wallet Balance" 
              amount={summary.overpaidAmount} 
              icon={DollarSign} 
              colorClass="text-cyan-600"
              bgClass="bg-white dark:bg-gray-800"
              borderClass="border-cyan-100 dark:border-cyan-900/30"
           />
        </div>

        {/* Transactions / History Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
             <h3 className="text-lg font-bold text-gray-900 dark:text-white">Appointment History & Payments</h3>
          </div>
          
          {appointments.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
               <p>No transactions found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold tracking-wider">
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Doctor</th>
                    <th className="px-6 py-4">Specialty</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Price</th>
                    <th className="px-6 py-4 text-center">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                         <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="font-medium">{apt.appointmentDate}</span>
                            <span className="text-gray-400 text-xs ml-1">{apt.appointmentTime}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                         <div className="flex items-center gap-2">
                             <User size={14} className="text-gray-400" />
                             <span className="font-medium text-gray-900 dark:text-white">{apt.doctor.fullName}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{apt.doctor.specialty}</td>
                      <td className="px-6 py-4 text-sm">
                         <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            apt.status === 'Scheduled' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            apt.status === 'Cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                         }`}>
                           {apt.status}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-gray-900 dark:text-white">
                        {apt.price ? `$${apt.price.toFixed(2)}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                         <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold gap-1.5 ${
                            apt.paymentStatus === 'paid' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                         }`}>
                           {apt.paymentStatus === 'paid' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                           {apt.paymentStatus.toUpperCase()}
                         </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialSummary;
