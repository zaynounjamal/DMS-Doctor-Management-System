import React, { useState, useEffect } from 'react';
import { getTreatments } from './api';

const TreatmentsPage = () => {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTreatments();
  }, []);

  const loadTreatments = async () => {
    try {
      const data = await getTreatments();
      setTreatments(data);
    } catch (error) {
      console.error('Failed to load treatments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading treatments...</div>;

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ 
            fontSize: '42px', 
            marginBottom: '15px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}>
            Our <span style={{ color: '#764ba2' }}>Treatments</span>
          </h1>
          <p style={{ fontSize: '18px', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
            Comprehensive dental care tailored to your needs
          </p>
        </div>

        {/* Treatment Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px'
        }}>
          {treatments.map((treatment) => (
            <div
              key={treatment.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '15px',
                padding: '30px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer',
                border: '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = '#667eea';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              {/* Icon */}
              <div style={{
                fontSize: '48px',
                marginBottom: '15px',
                textAlign: 'center'
              }}>
                {treatment.icon || '🦷'}
              </div>

              {/* Title */}
              <h3 style={{
                fontSize: '22px',
                fontWeight: 'bold',
                marginBottom: '12px',
                color: '#333',
                textAlign: 'center'
              }}>
                {treatment.name}
              </h3>

              {/* Description */}
              <p style={{
                fontSize: '14px',
                color: '#666',
                lineHeight: '1.6',
                textAlign: 'center'
              }}>
                {treatment.description}
              </p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div style={{
          textAlign: 'center',
          marginTop: '60px',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '15px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '28px', marginBottom: '15px', color: '#333' }}>
            Ready to Get Started?
          </h2>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '25px' }}>
            Book an appointment with one of our expert doctors today
          </p>
          <a
            href="/book-appointment"
            style={{
              display: 'inline-block',
              padding: '15px 40px',
              backgroundColor: '#667eea',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'background-color 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#764ba2'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#667eea'}
          >
            Book Appointment
          </a>
        </div>
      </div>
    </div>
  );
};

export default TreatmentsPage;
