import React from 'react';
import { Calendar, ArrowRight, Sparkles, Stethoscope, Heart, Activity, Shield, Star, Smile, Pill, Syringe, Menu, Sun, Moon, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const LiveThemePreview = ({ formData }) => {
  const getColor = (key, fallback) => formData[key] || fallback;

  const primaryLight = getColor('ThemePrimaryLight', 'hsl(262, 52%, 47%)');
  const accentLight = getColor('ThemeAccentLight', 'hsl(199, 89%, 48%)');
  const secondaryLight = getColor('ThemeSecondaryLight', 'hsl(220, 25%, 95%)');

  const heroTitle = formData.HeroTitle || 'Your Health, Our Priority.';
  const heroSubtitle = formData.HeroSubtitle || 'Experience world-class healthcare services with our expert team of doctors.';

  const floatingIcons = [
    { Icon: Stethoscope, x: '10%', y: '20%', size: 30 },
    { Icon: Heart, x: '85%', y: '15%', size: 25 },
    { Icon: Activity, x: '15%', y: '70%', size: 28 },
    { Icon: Shield, x: '80%', y: '65%', size: 22 },
    { Icon: Star, x: '50%', y: '10%', size: 20 },
    { Icon: Pill, x: '70%', y: '80%', size: 25 },
    { Icon: Syringe, x: '25%', y: '40%', size: 22 },
  ];

  const statsCards = [
    { icon: Smile, value: 5000, label: 'Happy Patients', color: accentLight },
    { icon: Stethoscope, value: 50, label: 'Expert Doctors', color: primaryLight },
    { icon: Calendar, value: 10000, label: 'Appointments', color: accentLight },
    { icon: Star, value: 15, label: 'Years Excellence', color: primaryLight },
  ];

  const treatments = [
    { name: 'General Checkup', icon: '🩺', description: 'Comprehensive health examination' },
    { name: 'Dental Care', icon: '🦷', description: 'Professional dental services' },
    { name: 'Cardiology', icon: '❤️', description: 'Heart health specialists' },
    { name: 'Pediatrics', icon: '👶', description: 'Child healthcare services' },
    { name: 'Orthopedics', icon: '🦴', description: 'Bone and joint treatment' },
    { name: 'Dermatology', icon: '✨', description: 'Skin care specialists' },
  ];

  const clinicName = formData.ClinicName || 'DMS Health';
  const address = formData.Address || '123 Medical Center Dr, Health City';
  const phone = formData.Phone || '+1 (555) 123-4567';
  const email = formData.Email || 'contact@dmshealth.com';

  return (
    <div className="w-full bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg max-h-[800px] overflow-y-auto">
      {/* Preview Label */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-2 text-center sticky top-0 z-50">
        <div className="text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          Live Theme Preview
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Navbar */}
      <div 
        className="px-4 py-3 flex items-center justify-between border-b"
        style={{ backgroundColor: primaryLight }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: accentLight }}
          >
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-sm">{clinicName}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-white text-xs px-3 py-1.5 hover:bg-white/10 rounded-lg transition-colors">
            Home
          </button>
          <button className="text-white text-xs px-3 py-1.5 hover:bg-white/10 rounded-lg transition-colors">
            Treatments
          </button>
          <button className="text-white text-xs px-3 py-1.5 hover:bg-white/10 rounded-lg transition-colors">
            Book
          </button>
          <button 
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: 'white' }}
          >
            <Sun className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white">
            <Menu className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <div className="absolute inset-0 z-[1] pointer-events-none">
          {floatingIcons.map((iconData, index) => (
            <motion.div
              key={index}
              className="absolute opacity-20"
              style={{
                left: iconData.x,
                top: iconData.y,
                width: `${iconData.size}px`,
                height: `${iconData.size}px`,
                color: index % 2 === 0 ? primaryLight : accentLight
              }}
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 3 + index * 0.3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <iconData.Icon className="w-full h-full" />
            </motion.div>
          ))}
        </div>

        <div 
          className="absolute inset-0 z-0"
          style={{ background: `linear-gradient(135deg, ${secondaryLight} 0%, white 100%)` }}
        />

        <div className="relative z-10 h-full flex items-center px-6">
          <div className="max-w-xl space-y-3">
            <div 
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm"
              style={{ 
                backgroundColor: `${accentLight}1A`,
                color: accentLight
              }}
            >
              <Sparkles className="w-3 h-3 mr-1.5" />
              <span>Trusted Healthcare Platform</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-gray-900">
              {heroTitle}
            </h1>

            <p className="text-sm text-gray-700 leading-relaxed">
              {heroSubtitle}
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                className="inline-flex items-center justify-center px-4 py-2 text-white rounded-lg font-semibold text-xs shadow-lg"
                style={{ backgroundColor: primaryLight }}
              >
                <Calendar className="w-3 h-3 mr-1.5" />
                Book Appointment
              </button>
              <button
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold text-xs bg-white/50 backdrop-blur-sm border-2"
                style={{ 
                  borderColor: accentLight,
                  color: accentLight
                }}
              >
                View Services
                <ArrowRight className="w-3 h-3 ml-1.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div 
        className="py-8 px-4"
        style={{ background: `linear-gradient(135deg, ${secondaryLight} 0%, white 100%)` }}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Trusted by Thousands</h2>
          <p className="text-sm text-gray-600">Join our growing community</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 shadow-md text-center border border-gray-200"
            >
              <div className="flex justify-center mb-2">
                <stat.icon className="w-8 h-8" style={{ color: stat.color }} />
              </div>
              <div className="text-2xl font-bold mb-1" style={{ color: stat.color }}>
                {stat.value.toLocaleString()}+
              </div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Treatments Section */}
      <div 
        className="py-8 px-4"
        style={{ backgroundColor: secondaryLight }}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Services</h2>
          <p className="text-sm text-gray-600">Comprehensive healthcare services</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {treatments.map((treatment, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 shadow-md text-center border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-2">{treatment.icon}</div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                {treatment.name}
              </h3>
              <p className="text-xs text-gray-600">{treatment.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            className="inline-flex items-center font-semibold text-sm"
            style={{ color: accentLight }}
          >
            View All Services
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div 
        className="py-6 px-4 border-t"
        style={{ backgroundColor: `${primaryLight}0D` }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Brand Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center border-2"
                style={{ 
                  borderColor: `${primaryLight}30`,
                  backgroundColor: `${primaryLight}10`
                }}
              >
                <Stethoscope className="w-4 h-4" style={{ color: primaryLight }} />
              </div>
              <span 
                className="text-sm font-bold"
                style={{ color: primaryLight }}
              >
                {clinicName}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Providing world-class healthcare management solutions.
            </p>
            <div className="flex items-center gap-2">
              <button 
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                style={{ color: primaryLight }}
              >
                <Facebook className="w-4 h-4" />
              </button>
              <button 
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                style={{ color: primaryLight }}
              >
                <Twitter className="w-4 h-4" />
              </button>
              <button 
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                style={{ color: primaryLight }}
              >
                <Instagram className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Quick Links</h3>
            <ul className="space-y-1 text-xs text-gray-600">
              <li className="hover:text-gray-900 cursor-pointer">Home</li>
              <li className="hover:text-gray-900 cursor-pointer">Our Treatments</li>
              <li className="hover:text-gray-900 cursor-pointer">Book Appointment</li>
              <li className="hover:text-gray-900 cursor-pointer">Patient Portal</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-xs text-gray-600">
                <MapPin className="w-3 h-3 mt-0.5" style={{ color: primaryLight }} />
                <span>{address}</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-gray-600">
                <Phone className="w-3 h-3" style={{ color: primaryLight }} />
                <span>{phone}</span>
              </li>
              <li className="flex items-center gap-2 text-xs text-gray-600">
                <Mail className="w-3 h-3" style={{ color: primaryLight }} />
                <span>{email}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} {clinicName}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveThemePreview;
