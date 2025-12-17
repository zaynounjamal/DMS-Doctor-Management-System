import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Sparkles, Stethoscope, Heart, Activity, Shield, Star, Pill, Syringe, Scissors, Thermometer, Eye, Brain, FlaskConical, Target } from 'lucide-react';
import StatsSection from './StatsSection';
import TreatmentsPreview from './TreatmentsPreview';
import heroImage from '../imgs/herosectionimage.jpg';
import { getPublicSettings } from '../api';
import { useAuth } from '../contexts/AuthContext';
import PatientChatWidget from '../components/chat/PatientChatWidget';
import AIChatWidget from '../components/chat/AIChatWidget';

const HomePage = () => {
  const { user } = useAuth();
  const heroSectionRef = React.useRef(null);
  const [branding, setBranding] = useState({
      heroTitle: 'Your Health, Our Priority.',
      heroSubtitle: 'Experience world-class healthcare services with our expert team of doctors. Book your appointment today and take the first step towards better health.',
      heroImage: heroImage
  });

  useEffect(() => {
    const fetchSettings = async () => {
        try {
            const data = await getPublicSettings();
            setBranding({
                heroTitle: data.HeroTitle || 'Your Health, Our Priority.',
                heroSubtitle: data.HeroSubtitle || 'Experience world-class healthcare services with our expert team of doctors. Book your appointment today and take the first step towards better health.',
                heroImage: data.HeroImageUrl || heroImage
            });
        } catch (error) {
            console.error('Failed to load branding settings', error);
        }
    };
    fetchSettings();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section ref={heroSectionRef} className="min-h-[600px] relative flex items-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Floating Icons Background */}
        <div className="absolute inset-0 z-[1] pointer-events-none">
          {[
            { Icon: Stethoscope, x: '10%', y: '20%', size: 60, colorClass: 'text-primary-light dark:text-primary-dark', delay: 0 },
            { Icon: Heart, x: '85%', y: '15%', size: 50, colorClass: 'text-accent-light dark:text-accent-dark', delay: 0.2 },
            { Icon: Activity, x: '15%', y: '70%', size: 55, colorClass: 'text-accent-light dark:text-accent-dark', delay: 0.4 },
            { Icon: Shield, x: '80%', y: '65%', size: 45, colorClass: 'text-primary-light dark:text-primary-dark', delay: 0.6 },
            { Icon: Star, x: '50%', y: '10%', size: 40, colorClass: 'text-accent-light dark:text-accent-dark', delay: 0.8 },
            { Icon: Stethoscope, x: '70%', y: '80%', size: 50, colorClass: 'text-primary-light dark:text-primary-dark', delay: 1.0 },
            { Icon: Heart, x: '25%', y: '40%', size: 45, colorClass: 'text-accent-light dark:text-accent-dark', delay: 1.2 },
            { Icon: Activity, x: '90%', y: '50%', size: 55, colorClass: 'text-primary-light dark:text-primary-dark', delay: 1.4 },
            { Icon: Pill, x: '5%', y: '50%', size: 45, colorClass: 'text-primary-light dark:text-primary-dark', delay: 1.6 },
            { Icon: Syringe, x: '95%', y: '30%', size: 40, colorClass: 'text-accent-light dark:text-accent-dark', delay: 1.8 },
            { Icon: Scissors, x: '30%', y: '15%', size: 50, colorClass: 'text-accent-light dark:text-accent-dark', delay: 2.0 },
            { Icon: Thermometer, x: '60%', y: '25%', size: 45, colorClass: 'text-primary-light dark:text-primary-dark', delay: 2.2 },
            { Icon: Eye, x: '20%', y: '85%', size: 50, colorClass: 'text-accent-light dark:text-accent-dark', delay: 2.4 },
            { Icon: Brain, x: '75%', y: '45%', size: 55, colorClass: 'text-primary-light dark:text-primary-dark', delay: 2.6 },
            { Icon: FlaskConical, x: '40%', y: '60%', size: 50, colorClass: 'text-accent-light dark:text-accent-dark', delay: 2.8 },
            { Icon: Target, x: '55%', y: '75%', size: 45, colorClass: 'text-primary-light dark:text-primary-dark', delay: 3.0 },
            { Icon: Pill, x: '90%', y: '70%', size: 40, colorClass: 'text-accent-light dark:text-accent-dark', delay: 3.2 },
            { Icon: Shield, x: '35%', y: '55%', size: 50, colorClass: 'text-primary-light dark:text-primary-dark', delay: 3.4 },
            { Icon: Star, x: '65%', y: '5%', size: 45, colorClass: 'text-accent-light dark:text-accent-dark', delay: 3.6 },
            { Icon: Heart, x: '8%', y: '75%', size: 50, colorClass: 'text-primary-light dark:text-primary-dark', delay: 3.8 },
          ].map((iconData, index) => (
            <motion.div
              key={index}
              className={`absolute ${iconData.colorClass} opacity-20 dark:opacity-15`}
              style={{
                left: iconData.x,
                top: iconData.y,
                width: `${iconData.size}px`,
                height: `${iconData.size}px`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 4 + index * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: iconData.delay,
              }}
            >
              <iconData.Icon className="w-full h-full" />
            </motion.div>
          ))}
        </div>

        {/* Background Image for Mobile - Using img tag for better compatibility */}
        <div className="lg:hidden absolute inset-0 z-0 overflow-hidden">
          <img 
            src={branding.heroImage} 
            alt="Hero Background" 
            className="absolute inset-0 w-full h-full object-cover"
            style={{ minHeight: '600px' }}
          />
          <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/75 backdrop-blur-sm" />
        </div>
        
        {/* Gradient background for desktop fallback */}
        <div className="hidden lg:block absolute inset-0 bg-gradient-to-br from-secondary-light dark:from-secondary-dark to-white dark:to-gray-900 z-0" />
        
        <div className="max-w-7xl mx-auto w-full py-16 relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            {/* Left Column - Text Content */}
            <motion.div variants={itemVariants} className="space-y-6 relative z-10">
              {/* Badge */}
              <motion.div
                variants={itemVariants}
                className="inline-flex items-center px-4 py-2 rounded-full bg-accent-light/10 dark:bg-accent-dark/20 text-accent-light dark:text-accent-dark text-sm font-medium backdrop-blur-sm"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                <span>Trusted Healthcare Platform</span>
              </motion.div>

              {/* Main Heading */}
              {/* Main Heading */}
              <motion.h1
                variants={itemVariants}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
              >
                <span className="text-gray-900 dark:text-white">
                  {branding.heroTitle}
                </span>
              </motion.h1>

              {/* Subheading */}
              <motion.p
                variants={itemVariants}
                className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl"
              >
                {branding.heroSubtitle}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <Link
                  to="/book-appointment"
                  className="group inline-flex items-center justify-center px-8 py-4 bg-primary-light dark:bg-primary-dark text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Appointment
                </Link>
                <Link
                  to="/treatments"
                  className="group inline-flex items-center justify-center px-8 py-4 border-2 border-accent-light dark:border-accent-dark text-accent-light dark:text-accent-dark rounded-lg font-semibold text-lg bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm hover:bg-accent-light dark:hover:bg-accent-dark hover:text-white transition-all duration-300"
                >
                  View Services
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Column - Hero Image (Desktop) */}
            <motion.div
              variants={itemVariants}
              className="hidden lg:block relative"
            >
              <div className="relative rounded-2xl shadow-2xl overflow-hidden">
                <img 
                  src={branding.heroImage} 
                  alt="Healthcare professionals" 
                  className="w-full h-full object-cover aspect-square rounded-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <StatsSection />

      {/* Treatments Preview Section */}
      <TreatmentsPreview />

      <AIChatWidget bottomOffsetPx={user?.role?.toLowerCase() === 'patient' ? 96 : 20} />
      {user?.role?.toLowerCase() === 'patient' && <PatientChatWidget />}
    </div>
  );
};

export default HomePage;

