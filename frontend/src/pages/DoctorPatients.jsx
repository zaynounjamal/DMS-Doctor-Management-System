import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Calendar, User, Search, Users } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { getDoctorPatients } from '../doctorApi';

const DoctorPatients = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { error: toastError } = useToast();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await getDoctorPatients();
      
      // Normalize API data to match UI component props
      const normalizedData = (data || []).map(p => ({
        ...p,
        id: p.id || p.Id,
        fullName: p.fullName || p.FullName,
        email: p.email || p.Email || 'N/A',
        phoneNumber: p.phoneNumber || p.Phone || p.phone,
        dateOfBirth: p.dateOfBirth || p.BirthDate || p.birthDate,
        gender: p.gender || p.Gender
      }));

      setPatients(normalizedData);
    } catch (error) {
      console.error('Failed to load patients:', error);
      toastError('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p =>
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading patients...</div>
      </div>
    );
  }

  return (
    <div className={`p-8 max-w-[1200px] mx-auto ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-purple-600 dark:text-purple-400">My Patients</h1>
        <p className={`text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage and view your patient records
        </p>
      </div>

      <div className="relative w-full max-w-2xl mx-auto mb-10">
        <input
          type="text"
          placeholder="Search patients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-6 pr-12 py-4 rounded-xl outline-none transition-all"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '2px solid rgba(147, 51, 234, 0.2)',
            color: '#111827',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            fontSize: '1.1rem'
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(147, 51, 234, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.5)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.2)';
          }}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-600">
          <Search size={24} />
        </div>
      </div>

      {/* Patients Grid */}
      {filteredPatients.length === 0 ? (
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: '1px solid rgba(147, 51, 234, 0.1)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          padding: '60px 20px',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
            <Users size={64} className="text-gray-400" />
          </div>
          <h3 style={{ fontSize: '20px', color: '#111827', marginBottom: '8px', fontWeight: 'bold' }}>
            {searchTerm ? 'No patients found' : 'No patients yet'}
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            {searchTerm ? 'Try a different search term' : 'Your patients will appear here'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => navigate(`/doctor/patients/${patient.id}`)}
              className="relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(147, 51, 234, 0.1)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.4)';
                e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(147, 51, 234, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.1)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
              }}
            >
              <div className={`
              absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-indigo-500
              opacity-0 group-hover:opacity-100 transition-opacity
            `} />

              <div className="p-6 flex items-start gap-4">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0
                  bg-purple-50 text-purple-600 border border-purple-100
                `}>
                  {patient.fullName.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate mb-1 text-gray-900">
                    {patient.fullName}
                  </h3>
                  <div className="space-y-1">
                    <p className="text-sm flex items-center gap-2 text-gray-600">
                      <Phone size={16} className="flex-shrink-0" color="#9333ea" />
                      {patient.phoneNumber || 'N/A'}
                    </p>
                    <p className="text-sm flex items-center gap-2 text-gray-600">
                      <Calendar size={16} className="flex-shrink-0" color="#9333ea" />
                      {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="text-sm flex items-center gap-2 text-gray-600">
                      <User size={16} className="flex-shrink-0" color="#9333ea" />
                      {patient.gender || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
};

export default DoctorPatients;
