import React, { useState, useEffect, useRef } from 'react';
import { motion, useSpring } from 'framer-motion';
import { Smile, Stethoscope, Calendar, Star } from 'lucide-react';
import { getPublicStats } from '../api';

// Counting animation component - optimized to prevent layout shifts
const CountUp = React.memo(({ end, duration = 2, delay = 0 }) => {
  const [count, setCount] = useState(0);
  const countSpring = useSpring(0, { 
    stiffness: 50, 
    damping: 30,
    restDelta: 0.1
  });

  useEffect(() => {
    // Reset count when component mounts
    setCount(0);
    countSpring.set(0);
    
    const timer = setTimeout(() => {
      countSpring.set(end);
    }, delay * 1000);

    const unsubscribe = countSpring.on('change', (latest) => {
      const newCount = Math.round(latest);
      // Only update if count actually changed to prevent unnecessary re-renders
      setCount(prev => prev !== newCount ? newCount : prev);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [end, delay, countSpring]);

  // Use fixed width to prevent layout shift and scroll jumping
  const displayValue = count.toLocaleString();
  const endValue = end.toLocaleString();
  const maxWidth = Math.max(displayValue.length, endValue.length);
  
  return (
    <span 
      style={{ 
        display: 'inline-block', 
        minWidth: `${maxWidth}ch`, 
        textAlign: 'center',
        fontVariantNumeric: 'tabular-nums', // Prevents number width changes
        contain: 'layout style paint' // Performance optimization
      }}
    >
      {displayValue}
    </span>
  );
});

const StatsSection = () => {
  const [stats, setStats] = useState({
    happyPatients: 0,
    expertDoctors: 0,
    totalAppointments: 0,
    yearsOfExperience: 0
  });
  const [loading, setLoading] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const statsGridRef = useRef(null);
  const animationTriggeredRef = useRef(false);
  
  // Use IntersectionObserver for scroll detection
  useEffect(() => {
    if (!statsGridRef.current || loading) return;

    let timeoutId;
    let rafId;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Use requestAnimationFrame to prevent scroll jumps
          rafId = requestAnimationFrame(() => {
            if (entry.isIntersecting) {
              // Prevent rapid toggling - only trigger if not already triggered
              if (!animationTriggeredRef.current) {
                timeoutId = setTimeout(() => {
                  setIsInView(true);
                  animationTriggeredRef.current = true;
                }, 200);
              }
            } else {
              // Reset when scrolled out of view to allow animation restart
              if (animationTriggeredRef.current) {
                setIsInView(false);
                animationTriggeredRef.current = false;
              }
            }
          });
        });
      },
      { 
        threshold: 0.3, // Higher threshold - needs more of section visible
        rootMargin: '300px 0px -150px 0px' // Trigger when section is 300px into viewport
      }
    );

    observer.observe(statsGridRef.current);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);
      if (statsGridRef.current) {
        observer.unobserve(statsGridRef.current);
      }
    };
  }, [loading]);

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

  if (loading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-secondary-light dark:from-secondary-dark to-white dark:to-gray-900">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-gray-600 dark:text-gray-400">Loading statistics...</div>
        </div>
      </section>
    );
  }

  const statsCards = [
    { icon: Smile, value: stats.happyPatients, label: 'Happy Patients', color: 'text-accent-light dark:text-accent-dark', bgColor: 'from-accent-light/10 to-accent-light/20 dark:from-accent-dark/20 dark:to-accent-dark/30' },
    { icon: Stethoscope, value: stats.expertDoctors, label: 'Expert Doctors', color: 'text-primary-light dark:text-primary-dark', bgColor: 'from-primary-light/10 to-primary-light/20 dark:from-primary-dark/20 dark:to-primary-dark/30' },
    { icon: Calendar, value: stats.totalAppointments, label: 'Appointments Completed', color: 'text-accent-light dark:text-accent-dark', bgColor: 'from-accent-light/10 to-accent-light/20 dark:from-accent-dark/20 dark:to-accent-dark/30' },
    { icon: Star, value: stats.yearsOfExperience, label: 'Years of Excellence', color: 'text-primary-light dark:text-primary-dark', bgColor: 'from-primary-light/10 to-primary-light/20 dark:from-primary-dark/20 dark:to-primary-dark/30' },
  ];

  return (
    <section className="pt-32 pb-16 px-4 sm:px-6 sm:pt-16 lg:px-8 bg-gradient-to-br from-secondary-light dark:from-secondary-dark to-white dark:to-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Join our growing community of satisfied patients and healthcare professionals
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div 
          ref={statsGridRef}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {statsCards.map((stat, index) => {
            const iconDelay = index * 0.25;
            const iconDuration = 1.2;
            const cardDelay = iconDelay + iconDuration;
            
            // Calculate starting position from hero section
            // Hero section is above, so icons come from top
            // For mobile: simpler calculation - icons come from different horizontal positions
            const heroPositions = [
              { x: -200, y: -400 }, // Left side of hero
              { x: 200, y: -400 },  // Right side of hero
              { x: -150, y: -450 }, // Left-center
              { x: 150, y: -450 },  // Right-center
            ];
            const startPos = heroPositions[index % heroPositions.length];
            
            return (
              <div key={index} className="relative" style={{ minHeight: '280px' }}>
                {/* Flying Icon Layer - Above everything */}
                <motion.div
                  className="absolute inset-0 flex items-start justify-center pt-8 pointer-events-none z-20"
                  style={{ willChange: 'transform, opacity' }}
                  initial={{
                    x: startPos.x,
                    y: startPos.y,
                    scale: 0.3,
                    opacity: 0,
                    rotate: index % 2 === 0 ? -180 : 180,
                  }}
                  animate={isInView ? {
                    x: 0,
                    y: 0,
                    scale: 1,
                    opacity: 1,
                    rotate: 0,
                  } : {
                    x: startPos.x,
                    y: startPos.y,
                    scale: 0.3,
                    opacity: 0,
                    rotate: index % 2 === 0 ? -180 : 180,
                  }}
                  transition={isInView ? {
                    duration: iconDuration,
                    ease: [0.34, 1.56, 0.64, 1],
                    delay: iconDelay,
                    type: 'tween',
                  } : {
                    duration: 0,
                  }}
                >
                  <stat.icon className={`w-12 h-12 ${stat.color}`} />
                </motion.div>

                {/* Card - Appears after icon lands */}
                <motion.div
                  style={{ willChange: 'transform, opacity' }}
                  initial={{ opacity: 0, scale: 0.8, y: 30 }}
                  animate={isInView ? {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                  } : {
                    opacity: 0,
                    scale: 0.8,
                    y: 30,
                  }}
                  transition={isInView ? {
                    duration: 0.6,
                    ease: [0.4, 0, 0.2, 1],
                    delay: cardDelay,
                    type: 'tween',
                  } : {
                    duration: 0,
                  }}
                  whileHover={{
                    scale: 1.05,
                    y: -8,
                    transition: {
                      type: 'spring',
                      stiffness: 400,
                      damping: 17,
                    },
                  }}
                  className="bg-white dark:bg-secondary-dark rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-muted-dark text-center h-full relative z-10"
                >
                  {/* Icon placeholder space */}
                  <div className="h-20 mb-4"></div>
                  
                  {/* Value with counting animation */}
                  <motion.div 
                    className={`text-3xl sm:text-4xl font-bold mb-2 ${stat.color}`}
                    style={{ minHeight: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? {
                      opacity: 1,
                      y: 0,
                    } : {
                      opacity: 0,
                      y: 10,
                    }}
                    transition={isInView ? {
                      delay: cardDelay + 0.3,
                      duration: 0.5,
                    } : {}}
                  >
                    {isInView && <CountUp key={`count-${index}-${isInView}`} end={stat.value} duration={1.5} delay={cardDelay + 0.3} />}
                    <span>+</span>
                  </motion.div>
                  
                  {/* Label */}
                  <motion.div 
                    className="text-sm text-gray-600 dark:text-gray-300"
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? {
                      opacity: 1,
                      y: 0,
                    } : {
                      opacity: 0,
                      y: 10,
                    }}
                    transition={isInView ? {
                      delay: cardDelay + 0.5,
                      duration: 0.5,
                    } : {}}
                  >
                    {stat.label}
                  </motion.div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;