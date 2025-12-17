import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { getProfitAnalytics, getDoctorStatistics } from '../doctorApi';
import StatCard from '../components/StatCard';

const DoctorProfitAnalytics = () => {
  const { theme } = useTheme();
  const { error: toastError } = useToast();
  const [period, setPeriod] = useState('month');
  const [profitData, setProfitData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profit, statistics] = await Promise.all([
        getProfitAnalytics(period),
        getDoctorStatistics(period)
      ]);
      setProfitData(profit);
      setStats(statistics);
    } catch (error) {
      console.error('Failed to load profit data:', error);
      toastError('Failed to load profit analytics');
    } finally {
      setLoading(false);
    }
  };

  const periods = [
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'week', label: 'Last Week' },
    { id: 'month', label: 'Last Month' },
    { id: 'year', label: 'Last Year' }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className={`p-8 max-w-[1400px] mx-auto ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-purple-600 dark:text-purple-400">
          Profit Analytics
        </h1>
        <p className={`text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Track your earnings and performance metrics
        </p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {periods.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`
              px-5 py-2.5 text-sm font-bold rounded-lg transition-all duration-200
              ${period === p.id
                ? 'bg-purple-600 text-white shadow-md'
                : (theme === 'dark' ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50')
              }
            `}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Profit Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Actual Profit"
          value={`$${(profitData?.actualProfit || 0).toFixed(2)}`}
          subtitle="Completed & Paid"
          icon={DollarSign}
          color="#10b981"
        />
        <StatCard
          title="Expected Profit"
          value={`$${(profitData?.expectedProfit || 0).toFixed(2)}`}
          subtitle="All Completed"
          icon={TrendingUp}
          color="#667eea"
        />
        <StatCard
          title="Unpaid Amount"
          value={`$${(profitData?.unpaidAmount || 0).toFixed(2)}`}
          subtitle={`${profitData?.unpaidAppointments || 0} appointments`}
          icon={Clock}
          color="#ef4444"
        />
        <StatCard
          title="Completed Appointments"
          value={profitData?.completedAppointments || 0}
          subtitle={`${profitData?.paidAppointments || 0} paid`}
          icon={CheckCircle}
          color="#8b5cf6"
        />
      </div>

      {/* Statistics */}
      {stats && (
        <div style={{
          background: '#000000',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: '1px solid rgba(155, 89, 182, 0.2)',
          boxShadow: '0 8px 32px rgba(155, 89, 182, 0.2)',
          padding: '24px'
        }}>
          <h2 className="text-xl font-bold mb-6 text-white">
            Performance Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider mb-1 text-gray-400">Total Appointments</div>
              <div className="text-2xl font-bold text-white">{stats.totalAppointments}</div>
            </div>
            <div>
              <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Completed</div>
              <div className="text-2xl font-bold text-emerald-500">{stats.completedAppointments}</div>
            </div>
            <div>
              <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Cancelled</div>
              <div className="text-2xl font-bold text-red-500">{stats.cancelledAppointments}</div>
            </div>
            <div>
              <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Unique Patients</div>
              <div className="text-2xl font-bold text-indigo-500">{stats.uniquePatients}</div>
            </div>
            <div>
              <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Avg. Value</div>
              <div className="text-2xl font-bold text-amber-500">
                ${(stats.averageAppointmentValue || 0).toFixed(2)}
              </div>
            </div>
            <div>
              <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Completion Rate</div>
              <div className="text-2xl font-bold text-purple-500">
                {(stats.completionRate || 0).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Chart Data */}
      {profitData?.dailyData && profitData.dailyData.length > 0 && (
        <div style={{
          background: '#000000',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: '1px solid rgba(155, 89, 182, 0.2)',
          boxShadow: '0 8px 32px rgba(155, 89, 182, 0.2)',
          padding: '24px',
          overflow: 'hidden'
        }}>
          <h2 className="text-xl font-bold marginBottom-6 mb-6 text-white">
            Daily Breakdown
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="p-4 font-semibold text-sm text-gray-400">Date</th>
                  <th className="p-4 font-semibold text-sm text-right text-gray-400">Actual Profit</th>
                  <th className="p-4 font-semibold text-sm text-right text-gray-400">Expected Profit</th>
                </tr>
              </thead>
              <tbody>
                {profitData.dailyData.map((day, index) => (
                  <tr key={index} className="border-b border-gray-800 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-gray-200">
                      {new Date(day.date).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right font-mono font-medium text-emerald-500">
                      ${day.actualProfit.toFixed(2)}
                    </td>
                    <td className="p-4 text-right font-mono font-medium text-purple-500">
                      ${day.expectedProfit.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorProfitAnalytics;
