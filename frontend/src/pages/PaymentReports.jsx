import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPaymentHistory, getDoctors } from '../secretaryApi';
import { useToast } from '../contexts/ToastContext';
import { DollarSign, Calendar, Download, TrendingUp, Users, CreditCard, ChevronLeft } from 'lucide-react';

const PaymentReports = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [doctors, setDoctors] = useState([]);
    
    // Filters
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [startDate, setStartDate] = useState(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        loadDoctors();
    }, []);

    useEffect(() => {
        loadPayments();
    }, [startDate, endDate, selectedDoctor]);

    const loadDoctors = async () => {
        try {
            const doctorsList = await getDoctors();
            setDoctors(doctorsList);
        } catch (error) {
            showToast('Failed to load doctors', 'error');
        }
    };

    const loadPayments = async () => {
        setLoading(true);
        try {
            const result = await getPaymentHistory(
                startDate ? new Date(startDate).toISOString() : null,
                endDate ? new Date(endDate).toISOString() : null,
                selectedDoctor || null
            );
            setData(result);
        } catch (error) {
            showToast('Failed to load payment history', 'error');
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        if (!data || !data.payments || data.payments.length === 0) {
            showToast('No data to export', 'warning');
            return;
        }

        const headers = ['Date', 'Patient', 'Doctor', 'Amount', 'Payment Method'];
        const rows = data.payments.map(p => [
            new Date(p.paymentDate).toLocaleDateString(),
            p.appointment.patientName,
            p.appointment.doctorName,
            `$${p.amount.toFixed(2)}`,
            p.paymentMethod || 'N/A'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payment-report-${startDate}-to-${endDate}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        showToast('Report exported successfully!', 'success');
    };

    if (loading && !data) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Loading payment reports...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/secretary-dashboard')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ChevronLeft className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </button>
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Payment Reports</h1>
                            <p className="mt-1 text-sm text-gray-500">View and analyze payment history</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Doctor
                            </label>
                            <select
                                value={selectedDoctor}
                                onChange={(e) => setSelectedDoctor(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Doctors</option>
                                {doctors.map(doc => (
                                    <option key={doc.id} value={doc.id}>
                                        Dr. {doc.fullName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={exportToCSV}
                                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export CSV
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                {data && data.summary && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white shadow rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        ${data.summary.totalAmount.toFixed(2)}
                                    </p>
                                </div>
                                <DollarSign className="w-12 h-12 text-green-500" />
                            </div>
                        </div>
                        <div className="bg-white shadow rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Payments</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {data.summary.paymentCount}
                                    </p>
                                </div>
                                <CreditCard className="w-12 h-12 text-blue-500" />
                            </div>
                        </div>
                        <div className="bg-white shadow rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Average Payment</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        ${data.summary.averagePayment.toFixed(2)}
                                    </p>
                                </div>
                                <TrendingUp className="w-12 h-12 text-purple-500" />
                            </div>
                        </div>
                    </div>
                )}

                {/* By Doctor & By Method */}
                {data && data.summary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* By Doctor */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <Users className="w-5 h-5 mr-2" />
                                Revenue by Doctor
                            </h3>
                            <div className="space-y-3">
                                {data.summary.byDoctor.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center">
                                        <span className="text-sm text-gray-700">{item.doctor}</span>
                                        <div className="text-right">
                                            <span className="text-sm font-medium text-gray-900">
                                                ${item.total.toFixed(2)}
                                            </span>
                                            <span className="text-xs text-gray-500 ml-2">
                                                ({item.count} payments)
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* By Payment Method */}
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <CreditCard className="w-5 h-5 mr-2" />
                                By Payment Method
                            </h3>
                            <div className="space-y-3">
                                {data.summary.byMethod.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center">
                                        <span className="text-sm text-gray-700">{item.method}</span>
                                        <div className="text-right">
                                            <span className="text-sm font-medium text-gray-900">
                                                ${item.total.toFixed(2)}
                                            </span>
                                            <span className="text-xs text-gray-500 ml-2">
                                                ({item.count} payments)
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment List */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Payment History</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data && data.payments && data.payments.length > 0 ? (
                                    data.payments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(payment.paymentDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {payment.appointment.patientName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {payment.appointment.doctorName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                                ${payment.amount.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {payment.paymentMethod || 'N/A'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                            No payments found for the selected period
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentReports;
