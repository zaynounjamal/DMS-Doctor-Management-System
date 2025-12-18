import React, { useState, useEffect } from 'react';
import { getAdminDashboardStats } from '../adminApi';
import { useToast } from '../contexts/ToastContext';
import { Users, Calendar, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Activity, Clock, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';

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
            const raw = data || {};
            const getNum = (v) => {
                const n = Number(v);
                return Number.isFinite(n) ? n : 0;
            };
            const getTrend = (v) => {
                if (v === null || v === undefined || v === '') return undefined;
                const n = Number(v);
                return Number.isFinite(n) ? n : undefined;
            };

            const trends = raw.trends ?? raw.Trends ?? {};

            setStats({
                totalRevenue: getNum(raw.totalRevenue ?? raw.TotalRevenue),
                revenueToday: getNum(raw.revenueToday ?? raw.RevenueToday),
                totalAppointments: getNum(raw.totalAppointments ?? raw.TotalAppointments),
                appointmentsToday: getNum(raw.appointmentsToday ?? raw.AppointmentsToday),
                totalPatients: getNum(raw.totalPatients ?? raw.TotalPatients),
                newPatientsMonth: getNum(raw.newPatientsMonth ?? raw.NewPatientsMonth),
                revenueMonth: getNum(raw.revenueMonth ?? raw.RevenueMonth),
                trendTotalRevenue: getTrend(trends.totalRevenue ?? trends.TotalRevenue ?? raw.trendTotalRevenue ?? raw.TrendTotalRevenue),
                trendTotalAppointments: getTrend(trends.totalAppointments ?? trends.TotalAppointments ?? raw.trendTotalAppointments ?? raw.TrendTotalAppointments),
                trendTotalPatients: getTrend(trends.totalPatients ?? trends.TotalPatients ?? raw.trendTotalPatients ?? raw.TrendTotalPatients),
                trendRevenueMonth: getTrend(trends.revenueMonth ?? trends.RevenueMonth ?? raw.trendRevenueMonth ?? raw.TrendRevenueMonth),
                peakHours: raw.peakHours ?? raw.PeakHours,
                patientSatisfaction: raw.patientSatisfaction ?? raw.PatientSatisfaction,
            });
        } catch (error) {
            showToast('Failed to load dashboard stats', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="relative min-h-screen">
                <AnimatedBackground />
                <div className="relative z-10 flex items-center justify-center min-h-[400px]">
                    <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                </div>
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
                {trend !== undefined && trend !== null && (() => {
                    const abs = Math.abs(Number(trend));
                    const formatted = Number.isFinite(abs)
                        ? abs.toFixed(1).replace(/\.0$/, '')
                        : '0';

                    const isUp = trend > 0;
                    const isDown = trend < 0;
                    const isFlat = trend === 0;

                    const badgeClass = isUp
                        ? 'bg-green-50 text-green-600'
                        : isDown
                            ? 'bg-red-50 text-red-600'
                            : 'bg-gray-50 text-gray-600';

                    return (
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${badgeClass}`}>
                            {isUp ? <ArrowUpRight size={14} /> : isDown ? <ArrowDownRight size={14} /> : <Minus size={14} />}
                            {formatted}%
                        </div>
                    );
                })()}
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
        <div className="relative min-h-screen">
            <AnimatedBackground />
            <div className="relative z-10 max-w-[1600px] mx-auto space-y-10 pb-12">
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
                    subtext={`$${stats.revenueToday.toLocaleString()} collected today`}
                    icon={DollarSign} 
                    color="bg-emerald-500"
                    trend={stats.trendTotalRevenue}
                    delay={0.1}
                />
                <StatCard 
                    title="Daily Appts" 
                    value={stats.totalAppointments.toLocaleString()} 
                    subtext={`${stats.appointmentsToday.toLocaleString()} scheduled today`}
                    icon={Calendar} 
                    color="bg-blue-600"
                    trend={stats.trendTotalAppointments}
                    delay={0.2}
                />
                <StatCard 
                    title="Total Patients" 
                    value={stats.totalPatients.toLocaleString()} 
                    subtext={`${stats.newPatientsMonth.toLocaleString()} new registrations`}
                    icon={Users} 
                    color="bg-indigo-600"
                    trend={stats.trendTotalPatients}
                    delay={0.3}
                />
                <StatCard 
                    title="Monthly Growth" 
                    value={`$${stats.revenueMonth.toLocaleString()}`} 
                    subtext="Revenue for current month"
                    icon={TrendingUp} 
                    color="bg-orange-500"
                    trend={stats.trendRevenueMonth}
                    delay={0.4}
                />
            </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
