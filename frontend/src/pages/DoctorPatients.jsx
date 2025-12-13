import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctorPatients } from '../doctorApi';

const DoctorPatients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await getDoctorPatients();
      setPatients(data);
    } catch (error) {
      console.error('Failed to load patients:', error);
      alert('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p =>
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading patients...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#333' }}>
          My Patients
        </h1>
        <p style={{ margin: '8px 0 0 0', fontSize: '16px', color: '#666' }}>
          {patients.length} total patient{patients.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '12px 16px',
            fontSize: '14px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            outline: 'none'
          }}
        />
      </div>

      {/* Patients Grid */}
      {filteredPatients.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '60px 20px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>👥</div>
          <h3 style={{ fontSize: '20px', color: '#333', marginBottom: '8px' }}>
            {searchTerm ? 'No patients found' : 'No patients yet'}
          </h3>
          <p style={{ fontSize: '14px', color: '#666' }}>
            {searchTerm ? 'Try a different search term' : 'Your patients will appear here'}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px'
        }}>
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => navigate(`/doctor/patients/${patient.id}`)}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#667eea20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  👤
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                    {patient.fullName}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {patient.gender || 'N/A'}
                  </div>
                </div>
              </div>
              
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                📞 {patient.phone || 'N/A'}
              </div>
              
              {patient.lastVisit && (
                <div style={{ fontSize: '12px', color: '#999' }}>
                  Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                </div>
              )}
              
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                Total visits: {patient.totalVisits || 0}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorPatients;
