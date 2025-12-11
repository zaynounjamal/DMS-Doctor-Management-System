import React, { useState, useEffect } from 'react';
import { getPublicStats } from '../api';

const StatsSection = () => {
  const [stats, setStats] = useState({
    happyPatients: 0,
    expertDoctors: 0,
    totalAppointments: 0,
    yearsOfExperience: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getPublicStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div style={{
      padding: '60px 20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ 
          fontSize: '36px', 
          marginBottom: '20px',
          fontWeight: 'bold'
        }}>
          Trusted by Thousands
        </h2>
        <p style={{ 
          fontSize: '18px', 
          marginBottom: '50px',
          opacity: 0.9
        }}>
          Join our growing community of satisfied patients and healthcare professionals
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '30px',
          marginTop: '40px'
        }}>
          {/* Happy Patients */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            padding: '40px 20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'transform 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>😊</div>
            <div style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '10px' }}>
              {stats.happyPatients.toLocaleString()}+
            </div>
            <div style={{ fontSize: '18px', opacity: 0.9 }}>Happy Patients</div>
          </div>

          {/* Expert Doctors */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            padding: '40px 20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'transform 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>👨‍⚕️</div>
            <div style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '10px' }}>
              {stats.expertDoctors.toLocaleString()}+
            </div>
            <div style={{ fontSize: '18px', opacity: 0.9 }}>Expert Doctors</div>
          </div>

          {/* Total Appointments */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            padding: '40px 20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'transform 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>📅</div>
            <div style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '10px' }}>
              {stats.totalAppointments.toLocaleString()}+
            </div>
            <div style={{ fontSize: '18px', opacity: 0.9 }}>Appointments Completed</div>
          </div>

          {/* Years of Experience */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '15px',
            padding: '40px 20px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'transform 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>⭐</div>
            <div style={{ fontSize: '42px', fontWeight: 'bold', marginBottom: '10px' }}>
              {stats.yearsOfExperience}+
            </div>
            <div style={{ fontSize: '18px', opacity: 0.9 }}>Years of Excellence</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
