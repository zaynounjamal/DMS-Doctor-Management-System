import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = '#667eea' }) => {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderRadius: '16px',
      border: '1px solid rgba(147, 51, 234, 0.1)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      padding: '24px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden'
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(147, 51, 234, 0.1), 0 8px 10px -6px rgba(147, 51, 234, 0.1)';
        e.currentTarget.style.borderColor = `rgba(147, 51, 234, 0.4)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)';
        e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.1)';
      }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '100px',
        height: '100px',
        background: `linear-gradient(135deg, ${color}15, ${color}05)`,
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
          color: '#4b5563',
          marginBottom: '8px',
          fontWeight: '600',
          letterSpacing: '0.025em'
        }}>
          {title}
        </div>

        {/* Value */}
        <div style={{
          fontSize: '32px',
          fontWeight: '800',
          color: '#111827',
          marginBottom: '4px'
        }}>
          {value}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
