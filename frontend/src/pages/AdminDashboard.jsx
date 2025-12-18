import React, { useState, useEffect } from 'react';
import { getAdminDashboardStats } from '../adminApi';
import { useToast } from '../contexts/ToastContext';
import { Users, Calendar, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Activity, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await getAdminDashboardStats();
            setStats(data);
        } catch (error) {
            showToast('Failed to load dashboard stats', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!stats) return <div className="p-8 text-center text-gray-500 font-bold">No dashboard data available at the moment.</div>;

    const StatCard = ({ title, value, subtext, icon: Icon, color, trend, delay }) => (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all group"
        >
            <div className="flex items-start justify-between">
                <div className={`p-4 rounded-2xl ${color} shadow-lg shadow-current/10 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
            <div className="mt-6">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none mb-2">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</h3>
                </div>
                {subtext && (
                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 text-xs font-bold text-gray-500">
                        <Clock size={14} />
                        {subtext}
                    </div>
                )}
            </div>
        </motion.div>
    );

    return (
        <div className="max-w-[1600px] mx-auto space-y-10 pb-12">
            <header>
                <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-4xl font-extrabold text-gray-900 tracking-tight"
                >
                    Dashboard <span className="text-blue-600">Overview</span>
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-500 mt-2 font-medium"
                >
                    Welcome back! Here's what's happening in your clinic today.
                </motion.p>
            </header>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard 
                    title="Total Revenue" 
                    value={`$${stats.totalRevenue.toLocaleString()}`} 
                    subtext={`$${stats.revenueToday} collected today`}
                    icon={DollarSign} 
                    color="bg-emerald-500"
                    trend={12}
                    delay={0.1}
                />
                <StatCard 
                    title="Daily Appts" 
                    value={stats.totalAppointments} 
                    subtext={`${stats.appointmentsToday} scheduled today`}
                    icon={Calendar} 
                    color="bg-blue-600"
                    trend={5}
                    delay={0.2}
                />
                <StatCard 
                    title="Total Patients" 
                    value={stats.totalPatients} 
                    subtext={`${stats.newPatientsMonth} new registrations`}
                    icon={Users} 
                    color="bg-indigo-600"
                    trend={8}
                    delay={0.3}
                />
                <StatCard 
                    title="Monthly Growth" 
                    value={`$${stats.revenueMonth.toLocaleString()}`} 
                    subtext="Revenue for current month"
                    icon={TrendingUp} 
                    color="bg-orange-500"
                    trend={-2}
                    delay={0.4}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col justify-center items-center min-h-[300px] text-center"
                >
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6">
                        <Activity size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Analytics Visualizer</h3>
                    <p className="text-gray-500 max-w-sm font-medium">Detailed charts and trend analysis are currently being optimized and will be available shortly.</p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100"
                >
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-4">Quick Insights</h3>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                                    <ArrowUpRight size={20} />
                                </div>
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-wider opacity-70">Peak Hours</div>
                                    <div className="font-bold">10:00 AM - 1:00 PM</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <div className="text-xs font-bold uppercase tracking-wider opacity-70">Patient Satisfaction</div>
                                    <div className="font-bold">98.4% Exceptional</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;
