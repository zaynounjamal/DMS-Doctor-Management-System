import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTreatments } from '../api';
import { ArrowRight } from 'lucide-react';
import { IconFromEmoji } from '../lib/iconMapper';

const TreatmentsPreview = () => {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTreatments();
  }, []);

  const loadTreatments = async () => {
    try {
      const data = await getTreatments();
      if (data && Array.isArray(data)) {
        setTreatments(data.slice(0, 6));
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary-light dark:bg-secondary-dark">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-gray-600 dark:text-gray-400">Loading treatments...</div>
        </div>
      </section>
    );
  }

  if (!treatments || treatments.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary-light dark:bg-secondary-dark">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Our Services
          </h2>
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
              className="relative group"
            >
              {/* Border container with gradient that travels around */}
              <div className="absolute -inset-[2px] rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
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
              <div className="absolute -inset-[6px] rounded-xl overflow-hidden opacity-0 group-hover:opacity-50 transition-opacity duration-500 blur-xl">
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
                className="relative bg-white dark:bg-gray-900 rounded-xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-muted-dark h-full cursor-pointer"
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
                  viewport={{ once: true, margin: '-50px' }}
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
                    <IconFromEmoji emoji={treatment.icon} className="w-12 h-12" />
                  </motion.div>
                </motion.div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 text-center">
                  {treatment.name}
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-300 text-center text-sm leading-relaxed">
                  {treatment.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="text-center"
        >
          <Link
            to="/treatments"
            className="inline-flex items-center text-accent-light dark:text-accent-dark hover:text-primary-light dark:hover:text-primary-dark font-semibold text-lg transition-colors duration-300 group"
          >
            View All Services
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default TreatmentsPreview;