import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = '#667eea' }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'pointer',
      border: `2px solid transparent`,
      position: 'relative',
      overflow: 'hidden'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
      e.currentTarget.style.borderColor = color;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      e.currentTarget.style.borderColor = 'transparent';
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '100px',
        height: '100px',
        background: `linear-gradient(135deg, ${color}20, ${color}10)`,
        borderRadius: '50%',
        zIndex: 0
      }}></div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Icon */}
        {Icon && (
          <div style={{
            marginBottom: '12px',
            color: color
          }}>
            {typeof Icon === 'string' ? (
              <span style={{ fontSize: '32px' }}>{Icon}</span>
            ) : React.isValidElement(Icon) ? (
              Icon
            ) : (
              <Icon size={32} />
            )}
          </div>
        )}

        {/* Title */}
        <div style={{
          fontSize: '14px',
          color: '#666',
          marginBottom: '8px',
          fontWeight: '500'
        }}>
          {title}
        </div>

        {/* Value */}
        <div style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '4px'
        }}>
          {value}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div style={{
            fontSize: '12px',
            color: '#999'
          }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
