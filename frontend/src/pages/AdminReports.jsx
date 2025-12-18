import React, { useState, useEffect } from 'react';
import { getReports } from '../adminApi';
import { useToast } from '../contexts/ToastContext';
import { BarChart2, TrendingUp, Users, Activity, PieChart, Calendar, ArrowUpRight, ArrowDownRight, Sparkles, Filter, RefreshCw, Layers, Zap, HeartPulse, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

    if (loading) return (
        <div className="min-h-[400px] flex items-center justify-center">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <BarChart2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 w-6 h-6 animate-pulse" />
            </div>
        </div>
    );

    if (!data) return (
        <div className="p-10 text-center">
            <Activity className="w-16 h-16 text-gray-200 mx-auto mb-6" />
            <h3 className="text-xl font-black text-gray-900 uppercase">Operational Null</h3>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">No report data stream available at this time.</p>
        </div>
    );

    // Normalize data to handle both PascalCase and camelCase from backend
    const normalizedRevenue = (data.revenueByMonth || data.RevenueByMonth || []).map(d => ({
        month: d.month || d.Month || 'N/A',
        revenue: d.revenue || d.Revenue || 0
    }));

    const normalizedPatients = (data.patientsByMonth || data.PatientsByMonth || []).map(d => ({
        month: d.month || d.Month || 'N/A',
        count: d.count || d.Count || 0
    }));

    const normalizedDoctors = (data.doctorStats || data.DoctorStats || []).map(d => ({
        doctorName: d.doctorName || d.DoctorName || 'Unknown',
        count: d.count || d.Count || 0
    }));

    const maxRevenue = Math.max(...normalizedRevenue.map(d => d.revenue), 100);
    const maxPatients = Math.max(...normalizedPatients.map(d => d.count), 1);
    const maxAppointments = Math.max(...normalizedDoctors.map(d => d.count), 1);

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-10 pb-16 px-4 md:px-0">
            {/* Header Section */}
            <div className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-10 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/50 rounded-full blur-3xl -mr-48 -mt-48 z-0" />
                
                <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-4 mb-3">
                             <div className="p-3 bg-indigo-600 rounded-2xl md:rounded-3xl text-white shadow-xl shadow-indigo-100">
                                <Activity size={28} />
                             </div>
                             <h2 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">Intelligence Dashboard</h2>
                        </div>
                        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.4em] flex items-center gap-2">
                             <Zap className="w-4 h-4 text-amber-500" />
                             Advanced Analytics & Performance Metrics
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button 
                            onClick={loadReports}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-[24px] md:rounded-[32px] font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-gray-200"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                            Recalibrate Data
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Primary Analysis: Revenue */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[32px] md:rounded-[48px] shadow-sm p-6 md:p-10 border border-gray-100 relative overflow-hidden group"
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Fiscal Trajectory</h3>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">Revenue Matrix • Current Fiscal Year</p>
                        </div>
                    </div>
                    <div className="px-6 py-3 bg-gray-50 rounded-[20px] border border-gray-100 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                            <span className="text-[10px] font-black text-gray-400 uppercase">Gross Revenue</span>
                        </div>
                    </div>
                </div>

                <div className="h-[300px] flex items-end justify-between gap-2 md:gap-4 px-0 md:px-4 overflow-x-auto custom-scrollbar pb-4 md:pb-0">
                    {normalizedRevenue.map((item, index) => (
                        <div key={index} className="flex-1 min-w-[40px] flex flex-col items-center gap-6 group/bar relative">
                            <div className="w-full flex justify-center relative">
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(item.revenue / maxRevenue) * 240}px` }}
                                    transition={{ duration: 1, delay: index * 0.05, ease: "circOut" }}
                                    className="w-full max-w-[50px] bg-emerald-50 group-hover/bar:bg-emerald-100 rounded-2xl transition-all duration-500 relative flex justify-center"
                                >
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 bg-gray-900 text-white font-black text-[10px] py-2 px-3 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-all scale-75 group-hover/bar:scale-100 whitespace-nowrap shadow-xl z-20">
                                        ${item.revenue.toLocaleString()}
                                    </div>
                                    <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-b-2xl rounded-t-sm" />
                                </motion.div>
                            </div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover/bar:text-emerald-600 transition-colors">
                                {item.month?.substring(0, 3)}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
                {/* Secondary Analysis: Doctor Efficiency */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-[32px] md:rounded-[48px] shadow-sm p-6 md:p-10 border border-gray-100"
                >
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Staff Performance</h3>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-0.5">Appointment Density per Professional</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {normalizedDoctors.map((item, index) => (
                            <div key={index} className="space-y-3 group/row">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center font-black text-gray-400 text-sm group-hover/row:bg-indigo-600 group-hover/row:text-white transition-all">
                                            {item.doctorName?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-gray-900">{item.doctorName}</div>
                                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Medical Professional</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-black text-gray-900 leading-none">{item.count}</div>
                                        <div className="text-[9px] font-bold text-gray-400 uppercase mt-1">Sessions</div>
                                    </div>
                                </div>
                                <div className="h-4 bg-gray-50 rounded-full overflow-hidden p-1 shadow-inner">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(item.count / maxAppointments) * 100}%` }}
                                        transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full shadow-lg"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Tertiary Analysis: Intake Vector */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-[32px] md:rounded-[48px] shadow-sm p-6 md:p-10 border border-gray-100"
                >
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                            <Users size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Patient Acquisition</h3>
                            <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mt-0.5">Demographic Intake Growth Curve</p>
                        </div>
                    </div>

                    <div className="h-[250px] flex items-end justify-between gap-2 md:gap-3 px-0 md:px-2 overflow-x-auto pb-4 md:pb-0">
                        {normalizedPatients.map((item, index) => (
                            <div key={index} className="flex-1 min-w-[30px] flex flex-col items-center gap-4 group/pbar relative">
                                <div className="w-full flex justify-center relative">
                                    <motion.div 
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(item.count / maxPatients) * 180}px` }}
                                        transition={{ duration: 1.2, delay: 0.4 + (index * 0.05) }}
                                        className="w-full max-w-[24px] bg-purple-500/10 rounded-t-xl group-hover/pbar:bg-purple-500/20 transition-all flex items-end justify-center relative shadow-sm"
                                    >
                                        <div className="w-full bg-purple-500 rounded-t-xl" style={{ height: '30%' }} />
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white font-black text-[9px] py-1.5 px-2.5 rounded-lg opacity-0 group-hover/pbar:opacity-100 transition-all scale-75 group-hover/pbar:scale-100 z-20">
                                            {item.count}
                                        </div>
                                    </motion.div>
                                </div>
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    {item.month?.substring(0, 3)}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-12 p-6 bg-purple-50 rounded-[28px] md:rounded-[32px] border border-purple-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-purple-600 shadow-sm">
                                <Sparkles size={18} />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-purple-700 uppercase leading-none">Intelligence Insight</div>
                                <div className="text-[11px] font-bold text-purple-600/80 mt-1 uppercase">Growth is steady across all intake vectors.</div>
                            </div>
                        </div>
                        <ChevronRight className="text-purple-300 hidden sm:block" />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminReports;
