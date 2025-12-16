
import React, { useState, useEffect } from 'react';
import { getReports } from '../adminApi';
import { useToast } from '../contexts/ToastContext';
import { BarChart2, TrendingUp, Users, Activity } from 'lucide-react';

const AdminReports = () => {
    const { showToast } = useToast();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        setLoading(true);
        try {
            const reportData = await getReports();
            setData(reportData);
        } catch (error) {
            showToast('Failed to load reports', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading reports...</div>;
    if (!data) return <div className="p-8">No report data available.</div>;

    const maxRevenue = Math.max(...data.revenueByMonth.map(d => d.revenue), 100);
    const maxPatients = Math.max(...data.patientsByMonth.map(d => d.count), 1);
    const maxAppointments = Math.max(...data.doctorStats.map(d => d.count), 1);

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Activity className="text-indigo-600" />
                Advanced Reports
            </h2>
            
            {/* Revenue Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="text-emerald-500" />
                    <h3 className="text-lg font-bold text-gray-900">Monthly Revenue (Current Year)</h3>
                </div>
                <div className="h-48 flex items-end gap-2">
                    {data.revenueByMonth.map((item, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                            <div className="relative w-full flex justify-center">
                                <div 
                                    className="w-full bg-emerald-500/10 group-hover:bg-emerald-500/20 rounded-t-lg transition-all duration-500 relative"
                                    style={{ height: `${(item.revenue / maxRevenue) * 160}px` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        ${item.revenue.toLocaleString()}
                                    </div>
                                </div>
                                <div 
                                    className="absolute bottom-0 w-2/3 bg-emerald-500 rounded-t-sm"
                                    style={{ height: `${(item.revenue / maxRevenue) * 160}px` }}
                                ></div>
                            </div>
                            <div className="text-xs font-medium text-gray-500 rotate-0 truncate w-full text-center">
                                {item.month.substring(0, 3)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Doctor Performance */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-2 mb-6">
                        <Activity className="text-blue-500" />
                        <h3 className="text-lg font-bold text-gray-900">Appointments by Doctor</h3>
                    </div>
                    <div className="space-y-4">
                        {data.doctorStats.map((item, index) => (
                            <div key={index} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-gray-700">{item.doctorName}</span>
                                    <span className="text-gray-500">{item.count} appts</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-500 rounded-full"
                                        style={{ width: `${(item.count / maxAppointments) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Patient Growth */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center gap-2 mb-6">
                        <Users className="text-purple-500" />
                        <h3 className="text-lg font-bold text-gray-900">New Patients Growth</h3>
                    </div>
                    <div className="h-48 flex items-end gap-2">
                        {data.patientsByMonth.map((item, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                                <div className="relative w-full flex justify-center">
                                    <div 
                                        className="w-2/3 bg-purple-500 rounded-t-sm group-hover:bg-purple-600 transition-colors"
                                        style={{ height: `${(item.count / maxPatients) * 150}px` }}
                                    ></div>
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {item.count}
                                    </div>
                                </div>
                                <div className="text-xs font-medium text-gray-500">
                                    {item.month.substring(0, 3)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
