
import React, { useState, useEffect } from 'react';
import { getAdminDashboardStats } from '../adminApi';
import { useToast } from '../contexts/ToastContext';
import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';

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

    if (loading) return <div className="p-8">Loading stats...</div>;
    if (!stats) return <div className="p-8">No stats available.</div>;

    const StatCard = ({ title, value, subtext, icon: Icon, color }) => (
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
                {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Revenue" 
                    value={`$${stats.totalRevenue.toLocaleString()}`} 
                    subtext={`$${stats.revenueToday} today`}
                    icon={DollarSign} 
                    color="bg-green-500" 
                />
                <StatCard 
                    title="Appointments" 
                    value={stats.totalAppointments} 
                    subtext={`${stats.appointmentsToday} today`}
                    icon={Calendar} 
                    color="bg-blue-500" 
                />
                <StatCard 
                    title="Total Patients" 
                    value={stats.totalPatients} 
                    subtext={`${stats.newPatientsMonth} new this month`}
                    icon={Users} 
                    color="bg-purple-500" 
                />
                <StatCard 
                    title="Revenue (Month)" 
                    value={`$${stats.revenueMonth.toLocaleString()}`} 
                    subtext="Current month"
                    icon={TrendingUp} 
                    color="bg-orange-500" 
                />
            </div>

            {/* Visual Charts Could Go Here */}
        </div>
    );
};

export default AdminDashboard;
