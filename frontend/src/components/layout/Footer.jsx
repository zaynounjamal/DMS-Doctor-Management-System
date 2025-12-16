
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Heart, Stethoscope } from 'lucide-react';
import * as Icons from 'lucide-react';
import { getPublicSettings } from '../../adminApi';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const [settings, setSettings] = useState({});

  useEffect(() => {
    getPublicSettings().then(setSettings).catch(console.error);
  }, []);

  // Hide footer on doctor dashboard pages
  if (location.pathname.startsWith('/doctor')) {
    return null;
  }

  const {
      ClinicName = 'DMS Health',
      Address = '123 Medical Center Dr, Health City, HC 90210',
      Phone: PhoneNum = '+1 (555) 123-4567',
      Email = 'contact@dmshealth.com',
      FacebookUrl = '#',
      TwitterUrl = '#',
      InstagramUrl = '#'
  } = settings;

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="h-10 w-10 flex items-center justify-center rounded-lg border-2 border-primary-light/30 bg-primary-light/10 overflow-hidden">
                  {settings.LogoUrl ? (
                      settings.LogoUrl.startsWith('icon:') ? (
                          React.createElement(Icons[settings.LogoUrl.split(':')[1]] || Stethoscope, { className: "w-6 h-6 text-primary-light" })
                      ) : (
                          <img src={settings.LogoUrl} alt="Logo" className="w-full h-full object-cover" />
                      )
                  ) : (
                      <Stethoscope className="w-6 h-6 text-primary-light" />
                  )}
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-light to-primary-dark bg-clip-text text-transparent">
                {ClinicName}
              </span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs">
              Providing world-class healthcare management solutions. Your health is our priority, and your smile is our passion.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <SocialLink icon={Facebook} href={FacebookUrl} label="Facebook" />
              <SocialLink icon={Twitter} href={TwitterUrl} label="Twitter" />
              <SocialLink icon={Instagram} href={InstagramUrl} label="Instagram" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <FooterLink to="/" label="Home" />
              <FooterLink to="/treatments" label="Our Treatments" />
              <FooterLink to="/book-appointment" label="Book Appointment" />
              <FooterLink to="/profile" label="Patient Portal" />
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-500 dark:text-gray-400 text-sm">
                <MapPin className="w-5 h-5 text-primary-light shrink-0 mt-0.5" />
                <span>{Address}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-500 dark:text-gray-400 text-sm">
                <Phone className="w-5 h-5 text-primary-light shrink-0" />
                <span>{PhoneNum}</span>
              </li>
              <li className="flex items-center gap-3 text-gray-500 dark:text-gray-400 text-sm">
                <Mail className="w-5 h-5 text-primary-light shrink-0" />
                <span>{Email}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center md:text-left">
            © {currentYear} {ClinicName}. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-400 dark:text-gray-500">
            <a href="#" className="hover:text-primary-light transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-light transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};


// Helper Components
const SocialLink = ({ icon: Icon, href, label }) => (
  <a 
    href={href} 
    aria-label={label}
    className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-primary-light hover:text-white dark:hover:bg-primary-light dark:hover:text-white transition-all duration-300"
  >
    <Icon size={18} />
  </a>
);

const FooterLink = ({ to, label }) => (
  <li>
    <Link 
      to={to} 
      className="text-gray-500 dark:text-gray-400 hover:text-primary-light dark:hover:text-primary-light text-sm transition-colors flex items-center gap-2 group"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-primary-light/50 group-hover:bg-primary-light transition-colors" />
      {label}
    </Link>
  </li>
);

export default Footer;
