import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      setPatients(data);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Patients</h1>
          <p className={`text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage and view your patient records
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-4 pr-10 py-3 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all shadow-sm
              ${theme === 'dark' 
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
              }
            `}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
            🔍
          </div>
        </div>
      </div>

      {/* Patients Grid */}
      {filteredPatients.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '60px 20px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>👥</div>
          <h3 style={{ fontSize: '20px', color: '#333', marginBottom: '8px' }}>
            {searchTerm ? 'No patients found' : 'No patients yet'}
          </h3>
          <p style={{ fontSize: '14px', color: '#666' }}>
            {searchTerm ? 'Try a different search term' : 'Your patients will appear here'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <div
            key={patient.id}
            onClick={() => navigate(`/doctor/patients/${patient.id}`)}
            className={`
              relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer group
              hover:shadow-lg hover:-translate-y-1
              ${theme === 'dark' 
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                : 'bg-white border-gray-100 hover:border-purple-200'
              }
            `}
          >
            <div className={`
              absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-indigo-500
              opacity-0 group-hover:opacity-100 transition-opacity
            `} />
            
            <div className="p-6 flex items-start gap-4">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0
                ${theme === 'dark' ? 'bg-gray-700 text-purple-400' : 'bg-purple-100 text-purple-600'}
              `}>
                {patient.fullName.charAt(0)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-lg truncate mb-1 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                  {patient.fullName}
                </h3>
                <div className="space-y-1">
                  <p className={`text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    📧 <span className="truncate">{patient.email}</span>
                  </p>
                  <p className={`text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    📱 {patient.phoneNumber || 'N/A'}
                  </p>
                  <p className={`text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    🎂 {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}
                  </p>
                  <p className={`text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    🩸 {patient.bloodType || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {filteredPatients.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <div className={`text-6xl mb-4 opacity-50`}>👥</div>
            <p className={`text-lg font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              No patients found
            </p>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default DoctorPatients;
