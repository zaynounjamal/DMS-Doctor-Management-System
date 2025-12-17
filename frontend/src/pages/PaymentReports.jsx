import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPaymentHistory, getDoctors } from '../secretaryApi';
import { useToast } from '../contexts/ToastContext';
import { DollarSign, Calendar, Download, TrendingUp, Users, CreditCard, ChevronLeft, FileText, RefreshCw } from 'lucide-react';

// Import PDF libraries - using try-catch to handle import errors gracefully
let jsPDF = null;
let autoTable = null;
let pdfLibsLoaded = false;

const loadPDFLibs = async () => {
    if (!pdfLibsLoaded) {
        try {
            jsPDF = (await import('jspdf')).default;
            // jspdf-autotable v5+ exports a function; in some bundlers it does not reliably patch doc.autoTable
            const autoTableModule = await import('jspdf-autotable');
            autoTable = autoTableModule.default || autoTableModule.autoTable || autoTableModule;
            pdfLibsLoaded = true;
        } catch (error) {
            console.error('Failed to load PDF libraries:', error);
            throw new Error('PDF export is not available. Please refresh the page.');
        }
    }
    return jsPDF;
};

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, endDate, selectedDoctor]);

    const loadDoctors = async () => {
        try {
            const doctorsList = await getDoctors();
            setDoctors(doctorsList);
        } catch (error) {
            console.error('Failed to load doctors:', error);
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
            console.error('Failed to load payment history:', error);
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
            p.appointment?.patientName || 'N/A',
            p.appointment?.doctorName || 'N/A',
            `$${p.amount.toFixed(2)}`,
            p.paymentMethod || 'N/A'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payment-report-${startDate}-to-${endDate}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showToast('CSV report exported successfully!', 'success');
    };

    const exportToPDF = async () => {
        if (!data || !data.payments || data.payments.length === 0) {
            showToast('No data to export', 'warning');
            return;
        }

        try {
            // Dynamically import PDF libraries
            const PDF = await loadPDFLibs();
            const doc = new PDF();
            
            // Title
            doc.setFontSize(18);
            doc.text('Payment Report', 14, 22);
            
            // Date range
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(
                `Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`,
                14,
                30
            );
            
            if (selectedDoctor) {
                const doctorName = doctors.find(d => d.id === parseInt(selectedDoctor))?.fullName || 'Selected Doctor';
                doc.text(`Doctor: Dr. ${doctorName}`, 14, 36);
            }
            
            // Summary section
            if (data.summary) {
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);
                doc.text('Summary', 14, 48);
                
                doc.setFontSize(10);
                doc.text(`Total Revenue: $${data.summary.totalAmount.toFixed(2)}`, 14, 56);
                doc.text(`Total Payments: ${data.summary.paymentCount}`, 14, 62);
                doc.text(`Average Payment: $${data.summary.averagePayment.toFixed(2)}`, 14, 68);
            }
            
            // Table data
            const tableData = data.payments.map(p => [
                new Date(p.paymentDate).toLocaleDateString(),
                p.appointment?.patientName || 'N/A',
                p.appointment?.doctorName || 'N/A',
                `$${p.amount.toFixed(2)}`,
                p.paymentMethod || 'N/A'
            ]);
            
            // Add table
            autoTable(doc, {
                startY: data.summary ? 75 : 40,
                head: [['Date', 'Patient', 'Doctor', 'Amount', 'Payment Method']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [59, 130, 246] },
                styles: { fontSize: 9 },
                margin: { top: 10 }
            });
            
            // Add summary by doctor if available
            if (data.summary && data.summary.byDoctor && data.summary.byDoctor.length > 0) {
                const finalY = (doc.lastAutoTable?.finalY || (data.summary ? 75 : 40)) + 10;
                doc.setFontSize(12);
                doc.text('Revenue by Doctor', 14, finalY);
                
                const doctorData = data.summary.byDoctor.map(d => [
                    d.doctor,
                    `$${d.total.toFixed(2)}`,
                    `${d.count} payments`
                ]);
                
                autoTable(doc, {
                    startY: finalY + 5,
                    head: [['Doctor', 'Total Revenue', 'Count']],
                    body: doctorData,
                    theme: 'striped',
                    headStyles: { fillColor: [16, 185, 129] },
                    styles: { fontSize: 9 }
                });
            }
            
            // Add summary by payment method if available
            if (data.summary && data.summary.byMethod && data.summary.byMethod.length > 0) {
                const finalY = (doc.lastAutoTable?.finalY || (data.summary ? 75 : 40)) + 10;
                doc.setFontSize(12);
                doc.text('Revenue by Payment Method', 14, finalY);
                
                const methodData = data.summary.byMethod.map(m => [
                    m.method,
                    `$${m.total.toFixed(2)}`,
                    `${m.count} payments`
                ]);
                
                autoTable(doc, {
                    startY: finalY + 5,
                    head: [['Payment Method', 'Total Revenue', 'Count']],
                    body: methodData,
                    theme: 'striped',
                    headStyles: { fillColor: [139, 92, 246] },
                    styles: { fontSize: 9 }
                });
            }
            
            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);
                doc.text(
                    `Generated on ${new Date().toLocaleString()}`,
                    doc.internal.pageSize.getWidth() / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'center' }
                );
                doc.text(
                    `Page ${i} of ${pageCount}`,
                    doc.internal.pageSize.getWidth() - 14,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'right' }
                );
            }
            
            // Save PDF
            const fileName = `payment-report-${startDate}-to-${endDate}.pdf`;
            doc.save(fileName);
            showToast('PDF report exported successfully!', 'success');
        } catch (error) {
            console.error('Failed to export PDF:', error);
            showToast('Failed to export PDF', 'error');
        }
    };

    const resetFilters = () => {
        setStartDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
        setEndDate(new Date().toISOString().split('T')[0]);
        setSelectedDoctor('');
    };

    if (loading && !data) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-gray-500 dark:text-gray-400">Loading payment reports...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/secretary-dashboard')}
                        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </button>
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment Reports</h1>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">View and analyze payment history</p>
                        </div>
                        <button
                            onClick={loadPayments}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Doctor
                            </label>
                            <select
                                value={selectedDoctor}
                                onChange={(e) => setSelectedDoctor(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">All Doctors</option>
                                {doctors.map(doc => (
                                    <option key={doc.id} value={doc.id}>
                                        Dr. {doc.fullName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <button
                                onClick={resetFilters}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={exportToCSV}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center transition-colors"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                        </button>
                        <button
                            onClick={exportToPDF}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center transition-colors"
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Export PDF
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                {data && data.summary && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        ${data.summary.totalAmount.toFixed(2)}
                                    </p>
                                </div>
                                <DollarSign className="w-12 h-12 text-green-500" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Payments</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {data.summary.paymentCount}
                                    </p>
                                </div>
                                <CreditCard className="w-12 h-12 text-blue-500" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Payment</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
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
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                                <Users className="w-5 h-5 mr-2" />
                                Revenue by Doctor
                            </h3>
                            <div className="space-y-3">
                                {data.summary.byDoctor && data.summary.byDoctor.length > 0 ? (
                                    data.summary.byDoctor.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{item.doctor}</span>
                                            <div className="text-right">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    ${item.total.toFixed(2)}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                                    ({item.count} payments)
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No data available</p>
                                )}
                            </div>
                        </div>

                        {/* By Payment Method */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                                <CreditCard className="w-5 h-5 mr-2" />
                                By Payment Method
                            </h3>
                            <div className="space-y-3">
                                {data.summary.byMethod && data.summary.byMethod.length > 0 ? (
                                    data.summary.byMethod.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{item.method}</span>
                                            <div className="text-right">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    ${item.total.toFixed(2)}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                                    ({item.count} payments)
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No data available</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment List */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Payment History</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Patient</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Doctor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Method</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {data && data.payments && data.payments.length > 0 ? (
                                    data.payments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {new Date(payment.paymentDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                {payment.appointment?.patientName || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {payment.appointment?.doctorName || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                                                ${payment.amount.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {payment.paymentMethod || 'N/A'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                            {loading ? 'Loading...' : 'No payments found for the selected period'}
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
