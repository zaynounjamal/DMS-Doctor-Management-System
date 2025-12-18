import React, { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const getParticleColor = (isDark) => {
  if (typeof window === 'undefined') {
    return isDark ? 'rgba(167, 139, 250, 0.7)' : 'rgba(109, 40, 217, 0.7)';
  }

  try {
    const root = document.documentElement;
    const triplet = getComputedStyle(root)
      .getPropertyValue(isDark ? '--primary-dark' : '--primary-light')
      .trim();

    if (!triplet) {
      return isDark ? 'rgba(167, 139, 250, 0.7)' : 'rgba(109, 40, 217, 0.7)';
    }

    return `rgb(${triplet} / 0.7)`;
  } catch {
    return isDark ? 'rgba(167, 139, 250, 0.7)' : 'rgba(109, 40, 217, 0.7)';
  }
};

export default function AnimatedBackground() {
  const { theme } = useTheme();
  // Ensure theme is defined, default to light if not
  const isDark = theme === 'dark';
  const particleColor = getParticleColor(isDark);
  
  const particles = useMemo(() => {
    return Array.from({ length: 150 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 4 + 3, // 3-7px
      opacity: Math.random() * 0.3 + 0.6, // 0.6-0.9
      duration: Math.random() * 20 + 15, // 15-35s
      delay: Math.random() * 5, // 0-5s
    }));
  }, [isDark]); // Re-generate if desired, or just keep static. Using dependency only if we want to reset.

  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden" 
      style={{ 
        zIndex: 0, 
        width: '100vw', 
        height: '100vh'
      }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes float-dot {
          0%, 100% {
            transform: translate(0, 0);
            opacity: var(--opacity);
          }
          25% {
            transform: translate(20px, -30px);
            opacity: calc(var(--opacity) * 0.8);
          }
          50% {
            transform: translate(-15px, -50px);
            opacity: calc(var(--opacity) * 0.6);
          }
          75% {
            transform: translate(30px, -20px);
            opacity: calc(var(--opacity) * 0.9);
          }
        }
      `}</style>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.left,
            top: particle.top,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: particleColor,
            opacity: particle.opacity,
            '--opacity': particle.opacity,
            animation: `float-dot ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
