import React, { useState, useEffect } from 'react';
import { getProfitAnalytics, getDoctorStatistics } from '../doctorApi';
import StatCard from '../components/StatCard';

const DoctorProfitAnalytics = () => {
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
      alert('Failed to load profit analytics');
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
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#333' }}>
          Profit Analytics
        </h1>
        <p style={{ margin: '8px 0 0 0', fontSize: '16px', color: '#666' }}>
          Track your earnings and performance metrics
        </p>
      </div>

      {/* Period Selector */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '32px',
        flexWrap: 'wrap'
      }}>
        {periods.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 'bold',
              border: period === p.id ? 'none' : '2px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: period === p.id ? '#667eea' : 'white',
              color: period === p.id ? 'white' : '#666',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (period !== p.id) {
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }
            }}
            onMouseLeave={(e) => {
              if (period !== p.id) {
                e.currentTarget.style.backgroundColor = 'white';
              }
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Profit Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <StatCard
          title="Actual Profit"
          value={`$${(profitData?.actualProfit || 0).toFixed(2)}`}
          subtitle="Completed & Paid"
          icon="💰"
          color="#10b981"
        />
        <StatCard
          title="Expected Profit"
          value={`$${(profitData?.expectedProfit || 0).toFixed(2)}`}
          subtitle="All Completed"
          icon="📊"
          color="#667eea"
        />
        <StatCard
          title="Unpaid Amount"
          value={`$${(profitData?.unpaidAmount || 0).toFixed(2)}`}
          subtitle={`${profitData?.unpaidAppointments || 0} appointments`}
          icon="⏳"
          color="#ef4444"
        />
        <StatCard
          title="Completed Appointments"
          value={profitData?.completedAppointments || 0}
          subtitle={`${profitData?.paidAppointments || 0} paid`}
          icon="✓"
          color="#8b5cf6"
        />
      </div>

      {/* Statistics */}
      {stats && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '32px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
            Performance Metrics
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Total Appointments</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{stats.totalAppointments}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Completed</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{stats.completedAppointments}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Cancelled</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>{stats.cancelledAppointments}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Unique Patients</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>{stats.uniquePatients}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Avg. Appointment Value</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                ${(stats.averageAppointmentValue || 0).toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Completion Rate</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>
                {(stats.completionRate || 0).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Chart Data */}
      {profitData?.dailyData && profitData.dailyData.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
            Daily Breakdown
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', color: '#666' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: '#666' }}>Actual Profit</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: '#666' }}>Expected Profit</th>
                </tr>
              </thead>
              <tbody>
                {profitData.dailyData.map((day, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#333' }}>
                      {new Date(day.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold', color: '#10b981' }}>
                      ${day.actualProfit.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: 'bold', color: '#667eea' }}>
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
