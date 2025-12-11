import React, { useState, useEffect } from 'react';
import { getFinancialSummary } from '../api';
import '../BookAppointment.css';

const FinancialSummary = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadFinancialSummary();
  }, []);

  const loadFinancialSummary = async () => {
    try {
      const result = await getFinancialSummary();
      setData(result);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading financial summary...</div>;

  if (!data) return <div>No data available</div>;

  const { summary, appointments } = data;

  return (
    <div className="booking-container">
      <h2>Financial Summary</h2>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        {/* Total Paid */}
        <div style={{
          padding: '20px',
          borderRadius: '10px',
          backgroundColor: '#d4edda',
          border: '2px solid #28a745',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#155724' }}>Total Paid</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#155724' }}>
            ${summary.totalPaid.toFixed(2)}
          </p>
        </div>

        {/* Total Unpaid */}
        <div style={{
          padding: '20px',
          borderRadius: '10px',
          backgroundColor: '#f8d7da',
          border: '2px solid #dc3545',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#721c24' }}>Total Unpaid</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#721c24' }}>
            ${summary.totalUnpaid.toFixed(2)}
          </p>
        </div>

        {/* Remaining Balance */}
        <div style={{
          padding: '20px',
          borderRadius: '10px',
          backgroundColor: '#fff3cd',
          border: '2px solid #ffc107',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>Remaining Balance</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#856404' }}>
            ${summary.remainingBalance.toFixed(2)}
          </p>
        </div>

        {/* Overpaid Amount */}
        <div style={{
          padding: '20px',
          borderRadius: '10px',
          backgroundColor: '#d1ecf1',
          border: '2px solid #17a2b8',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#0c5460' }}>Overpaid</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#0c5460' }}>
            ${summary.overpaidAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Appointment History Table */}
      <h3>Appointment History</h3>
      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            backgroundColor: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Time</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Doctor</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Specialty</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Price</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Payment</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '12px' }}>{apt.appointmentDate}</td>
                  <td style={{ padding: '12px' }}>{apt.appointmentTime}</td>
                  <td style={{ padding: '12px' }}>{apt.doctor.fullName}</td>
                  <td style={{ padding: '12px' }}>{apt.doctor.specialty}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: apt.status === 'Scheduled' ? '#e3f2fd' : '#ffebee',
                      color: apt.status === 'Scheduled' ? '#1976d2' : '#c62828'
                    }}>
                      {apt.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {apt.price ? `$${apt.price.toFixed(2)}` : 'N/A'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: apt.paymentStatus === 'paid' ? '#d4edda' : '#f8d7da',
                      color: apt.paymentStatus === 'paid' ? '#155724' : '#721c24'
                    }}>
                      {apt.paymentStatus.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FinancialSummary;
