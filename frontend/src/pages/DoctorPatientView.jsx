import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MedicalNotesList from '../components/MedicalNotesList';
import { getPatientDetails, getPatientNotes } from '../doctorApi';

const DoctorPatientView = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      const [details, patientNotes] = await Promise.all([
        getPatientDetails(patientId),
        getPatientNotes(patientId)
      ]);
      setPatient(details.patient);
      setAppointments(details.appointments);
      setFinancialSummary(details.financialSummary);
      setNotes(patientNotes);
    } catch (error) {
      console.error('Failed to load patient:', error);
      alert('Failed to load patient details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading patient details...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h2>Patient not found</h2>
        <button onClick={() => navigate('/doctor/patients')}>Back to Patients</button>
      </div>
    );
  }

  const tabs = [
    { id: 'info', label: 'Basic Info', icon: '👤' },
    { id: 'financial', label: 'Financial', icon: '💰' },
    { id: 'appointments', label: 'Appointments', icon: '📅' },
    { id: 'notes', label: 'Medical Notes', icon: '📝' }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <button
          onClick={() => navigate('/doctor/patients')}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            border: 'none',
            backgroundColor: '#f3f4f6',
            color: '#666',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '16px'
          }}
        >
          ← Back to Patients
        </button>
        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#333' }}>
          {patient.fullName}
        </h1>
        <p style={{ margin: '8px 0 0 0', fontSize: '16px', color: '#666' }}>
          Patient Details
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '2px solid #e5e7eb',
        overflowX: 'auto'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 'bold',
              border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid #667eea' : '3px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === tab.id ? '#667eea' : '#666',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Basic Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Phone</div>
              <div style={{ fontSize: '16px', color: '#333' }}>{patient.phone || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Gender</div>
              <div style={{ fontSize: '16px', color: '#333' }}>{patient.gender || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Birth Date</div>
              <div style={{ fontSize: '16px', color: '#333' }}>
                {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'financial' && financialSummary && (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              borderLeft: '4px solid #10b981'
            }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total Paid</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>
                ${financialSummary.totalPaid.toFixed(2)}
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                {financialSummary.paidCount} appointment{financialSummary.paidCount !== 1 ? 's' : ''}
              </div>
            </div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              borderLeft: '4px solid #ef4444'
            }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total Unpaid</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444' }}>
                ${financialSummary.totalUnpaid.toFixed(2)}
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                {financialSummary.unpaidCount} appointment{financialSummary.unpaidCount !== 1 ? 's' : ''}
              </div>
            </div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              borderLeft: '4px solid #667eea'
            }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>
                ${financialSummary.total.toFixed(2)}
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                All appointments
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
            Appointment History ({appointments.length})
          </h2>
          {appointments.length === 0 ? (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '40px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
              <p style={{ color: '#666' }}>No appointments yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    borderLeft: `4px solid ${apt.isCompleted ? '#10b981' : '#f59e0b'}`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                        {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.appointmentTime}
                      </div>
                      <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                        Status: {apt.isCompleted ? '✓ Completed' : apt.status}
                      </div>
                    </div>
                    {apt.finalPrice && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                          ${apt.finalPrice.toFixed(2)}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: apt.paymentStatus === 'paid' ? '#10b981' : '#ef4444'
                        }}>
                          {apt.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Unpaid'}
                        </div>
                      </div>
                    )}
                  </div>
                  {apt.completionNotes && (
                    <div style={{
                      backgroundColor: '#f9fafb',
                      padding: '12px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#666',
                      marginTop: '8px'
                    }}>
                      {apt.completionNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
            Medical Notes ({notes.length})
          </h2>
          <MedicalNotesList notes={notes} />
        </div>
      )}
    </div>
  );
};

export default DoctorPatientView;
