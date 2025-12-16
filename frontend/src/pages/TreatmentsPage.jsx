import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTreatments } from '../api';
import BackButton from '../components/ui/BackButton';
import { IconFromEmoji } from '../lib/iconMapper';

const TreatmentsPage = () => {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTreatments();
  }, []);

  const loadTreatments = async () => {
    try {
      const data = await getTreatments();
      if (data && Array.isArray(data)) {
        setTreatments(data);
      } else {
        setTreatments([]);
      }
    } catch (error) {
      console.error('Failed to load treatments:', error);
      setTreatments([]);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  if (loading) {
    return (
      <section className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-secondary-light dark:bg-secondary-dark flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading treatments...</div>
      </section>
    );
  }

  return (
    <section className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-secondary-light dark:bg-secondary-dark">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
            <BackButton to="/" />
        </div>

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Our Treatments
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Comprehensive healthcare services tailored to meet all your medical needs
          </p>
        </motion.div>

        {/* Treatments Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {treatments.map((treatment, index) => (
            <motion.div
              key={treatment.id}
              variants={itemVariants}
              className="relative group h-full"
            >
              {/* Border container with gradient that travels around */}
              <div className="absolute -inset-[2px] rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: `conic-gradient(from var(--angle), 
                      hsl(262, 52%, 47%) 0deg, 
                      hsl(262, 65%, 60%) 30deg,
                      transparent 60deg,
                      transparent 300deg,
                      hsl(262, 65%, 60%) 330deg,
                      hsl(262, 52%, 47%) 360deg)`,
                  }}
                  animate={{
                    '--angle': ['0deg', '360deg'],
                  }}
                  transition={{
                    duration: 3 + (index % 3) * 0.4,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </div>

              {/* Glow effect layer */}
              <div className="absolute -inset-[6px] rounded-xl overflow-hidden opacity-0 group-hover:opacity-50 transition-opacity duration-500 blur-xl pointer-events-none">
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: `conic-gradient(from var(--angle), 
                      hsl(262, 52%, 47%) 0deg, 
                      hsl(262, 65%, 60%) 30deg,
                      transparent 60deg,
                      transparent 300deg,
                      hsl(262, 65%, 60%) 330deg,
                      hsl(262, 52%, 47%) 360deg)`,
                  }}
                  animate={{
                    '--angle': ['0deg', '360deg'],
                  }}
                  transition={{
                    duration: 3 + (index % 3) * 0.4,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </div>

              {/* Card content */}
              <motion.div
                whileHover={{
                  scale: 1.03,
                  y: -5,
                  transition: {
                    type: 'spring',
                    stiffness: 400,
                    damping: 17,
                  },
                }}
                className="relative bg-white dark:bg-gray-900 rounded-xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-muted-dark h-full flex flex-col items-center"
              >
                {/* Animated Icon */}
                <motion.div 
                  className="flex justify-center mb-4 text-accent-light dark:text-accent-dark"
                  initial={{ opacity: 0, scale: 0, rotate: -180 }}
                  whileInView={{ 
                    opacity: 1, 
                    scale: 1, 
                    rotate: 0,
                    transition: {
                      type: 'spring',
                      stiffness: 200,
                      damping: 15,
                      delay: index * 0.1,
                    }
                  }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    whileHover={{
                      scale: 1.2,
                      rotate: 5,
                      transition: {
                        duration: 0.3,
                        ease: 'easeInOut'
                      }
                    }}
                  >
                    <IconFromEmoji emoji={treatment.icon} className="w-16 h-16" />
                  </motion.div>
                </motion.div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 text-center">
                  {treatment.name}
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-300 text-center text-sm leading-relaxed mb-4 flex-grow">
                  {treatment.description}
                </p>
                

              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <div className="text-center mt-12 bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Book an appointment with one of our expert doctors today
          </p>
          <Link
            to="/book-appointment"
            className="inline-block px-8 py-4 bg-primary-light dark:bg-primary-dark text-white rounded-lg font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            Book Appointment
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TreatmentsPage;
