import React, { useState, useEffect, useRef } from 'react';
import { getProfile, updateProfile, updateDoctorProfile, uploadProfilePhoto } from '../api';
import { Camera, User, Phone, Calendar, Save, AlertCircle, CheckCircle } from 'lucide-react';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    gender: '',
    birthDate: '',
    specialty: '',
    startHour: '',
    endHour: '',
    profilePhoto: ''
  });
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getProfile();
      const profile = data.profile;
      setRole(data.role?.toLowerCase() || '');
      
      if (profile) {
        setFormData({
          fullName: profile.fullName || '',
          phone: profile.phone || '',
          gender: profile.gender || '',
          birthDate: profile.birthDate ? profile.birthDate.split('T')[0] : '',
          specialty: profile.specialty || '',
          startHour: profile.startHour || '',
          endHour: profile.endHour || '',
          profilePhoto: profile.profilePhoto || ''
        });
      } else {
        setMessage({ type: 'error', text: 'Profile not found. Please contact support.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load profile: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      const result = await uploadProfilePhoto(file);
      setFormData(prev => ({
        ...prev,
        profilePhoto: result.url
      }));
      setMessage({ type: 'success', text: 'Photo uploaded successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      if (role === 'doctor') {
        const doctorData = {
          fullName: formData.fullName,
          phone: formData.phone,
          specialty: formData.specialty,
          startHour: formData.startHour,
          endHour: formData.endHour,
          profilePhoto: formData.profilePhoto
        };
        await updateDoctorProfile(doctorData);
      } else {
        // Patient update
        const patientData = {
          fullName: formData.fullName,
          phone: formData.phone,
          gender: formData.gender,
          birthDate: formData.birthDate || null,
          profilePhoto: formData.profilePhoto
        };
        await updateProfile(patientData);
      }
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `http://localhost:5024${path}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
           <p className="text-gray-500 dark:text-gray-400 mt-1">Update your personal information and profile picture.</p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl border flex items-center gap-3 ${
            message.type === 'error' 
              ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800' 
              : 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800'
          }`}>
             {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
             <p>{message.text}</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8">
          
          {/* Photo Upload Section */}
          <div className="flex flex-col items-center mb-8 pb-8 border-b border-gray-100 dark:border-gray-700">
             <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-32 h-32 rounded-full border-4 border-gray-100 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-inner">
                   {formData.profilePhoto ? (
                      <img 
                        src={getImageUrl(formData.profilePhoto)}
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }} 
                      />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                         <span className="text-4xl font-bold">
                            {(formData.fullName || '?').charAt(0).toUpperCase()}
                         </span>
                      </div>
                   )}
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="bg-white/90 p-2 rounded-full shadow-lg">
                      <Camera className="w-5 h-5 text-gray-700" />
                   </div>
                </div>

                {uploading && (
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                     <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
             </div>
             
             <button 
               type="button" 
               onClick={() => fileInputRef.current?.click()}
               className="mt-4 text-sm font-medium text-primary-light hover:text-primary-dark transition-colors"
               disabled={uploading}
             >
                Change Profile Photo
             </button>
             
             <input
               ref={fileInputRef}
               type="file"
               accept="image/*"
               onChange={handlePhotoChange}
               className="hidden"
             />
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                  <div className="relative">
                     <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <User size={18} />
                     </div>
                     <input
                       type="text"
                       name="fullName"
                       value={formData.fullName}
                       onChange={handleChange}
                       required
                       className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-light/50 focus:border-primary-light transition-all outline-none"
                       placeholder="Enter your full name"
                     />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                  <div className="relative">
                     <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Phone size={18} />
                     </div>
                     <input
                       type="number" // Consider 'tel' but number is requested in old code
                       name="phone"
                       value={formData.phone}
                       onChange={handleChange}
                       required
                       className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-light/50 focus:border-primary-light transition-all outline-none"
                       placeholder="Enter phone number"
                     />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-light/50 focus:border-primary-light transition-all outline-none appearance-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
               </div>

               <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
                  <div className="relative">
                     <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Calendar size={18} />
                     </div>
                     <input
                       type="date"
                       name="birthDate"
                       value={formData.birthDate || ''}
                       onChange={handleChange}
                       className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-light/50 focus:border-primary-light transition-all outline-none"
                     />
                  </div>
               </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                className="w-full md:w-auto px-8 py-3 bg-primary-light hover:bg-primary-dark text-white font-semibold rounded-xl shadow-lg shadow-primary-light/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                <Save size={20} />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
