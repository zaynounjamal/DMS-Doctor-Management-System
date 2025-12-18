import React, { useState, useEffect } from 'react';
import { getPaymentHistory } from '../../secretaryApi';
import { useToast } from '../../contexts/ToastContext';
import { Search, Calendar, Filter, Download, TrendingUp, CreditCard, User, Clock } from 'lucide-react';

const PaymentHistory = ({ selectedDoctor }) => {
    const { showToast } = useToast();
    const [payments, setPayments] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPayments();
    }, [startDate, endDate, selectedDoctor]);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const data = await getPaymentHistory(startDate, endDate, selectedDoctor || null);
            setPayments(data.payments || []);
            setSummary(data.summary || {});
        } catch (error) {
            console.error(error);
            showToast('Failed to load payment history', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredPayments = payments.filter(payment => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            payment.appointment.patientName.toLowerCase().includes(term) ||
            payment.appointment.doctorName.toLowerCase().includes(term) ||
            payment.amount.toString().includes(term)
        );
    });

    return (
        <div className="space-y-6">
            {/* Header / Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                            <h3 className="text-2xl font-bold text-gray-900">${summary?.totalAmount?.toLocaleString() ?? 0}</h3>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Transactions</p>
                            <h3 className="text-2xl font-bold text-gray-900">{summary?.paymentCount ?? 0}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                            <Filter size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Average Transaction</p>
                            <h3 className="text-2xl font-bold text-gray-900">${Math.round(summary?.averagePayment ?? 0)}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                         <input 
                            type="text" 
                            placeholder="Search patient, doctor..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                         />
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-100">
                        <Calendar size={16} className="text-gray-400 ml-2" />
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none p-1"
                        />
                        <span className="text-gray-300">-</span>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none p-1"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex justify-center">
                                            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No payments found for this period.
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-gray-900">
                                                <Calendar size={14} className="text-gray-400" />
                                                {new Date(payment.paymentDate).toLocaleDateString()}
                                                <span className="text-gray-300">|</span>
                                                <Clock size={14} className="text-gray-400" />
                                                {new Date(payment.paymentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">
                                                    {payment.appointment.patientName.charAt(0)}
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">{payment.appointment.patientName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            Dr. {payment.appointment.doctorName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                ${payment.paymentMethod === 'Cash' ? 'bg-green-100 text-green-800' : 
                                                  payment.paymentMethod === 'Card' ? 'bg-blue-100 text-blue-800' : 
                                                  'bg-purple-100 text-purple-800'}`}>
                                                {payment.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                                            ${payment.amount.toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PaymentHistory;
