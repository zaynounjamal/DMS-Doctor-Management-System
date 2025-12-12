import React, { useState, useEffect, useRef } from 'react';
import { getProfile, updateProfile, updateDoctorProfile, uploadProfilePhoto } from '../api';
import '../BookAppointment.css'; // Reusing styles

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
          birthDate: profile.birthDate || '',
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

  if (loading) return <div className="loading">Loading profile...</div>;

  return (
    <div className="booking-container">
      <h2>Edit Profile</h2>
      
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Profile Photo Section - Centered at Top */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px'
      }}>
        {formData.profilePhoto ? (
          <img 
            src={`http://localhost:5024${formData.profilePhoto}`}
            alt="Profile" 
            style={{ 
              width: '150px', 
              height: '150px', 
              borderRadius: '50%', 
              objectFit: 'cover', 
              border: '4px solid #3498db',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
            onError={(e) => { 
              e.target.style.display = 'none';
            }} 
          />
        ) : (
          <div style={{
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            backgroundColor: '#3498db',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '60px',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}>
            {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : '?'}
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          style={{ display: 'none' }}
        />
        
        <button 
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            marginTop: '15px',
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            opacity: uploading ? 0.6 : 1
          }}
        >
          {uploading ? 'Uploading...' : 'Update Photo'}
        </button>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-group">
          <label>Full Name:</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label>Phone Number:</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            maxLength={20}
          />
        </div>

        {role === 'doctor' ? (
          <>
            <div className="form-group">
              <label>Specialty:</label>
              <input
                type="text"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                required
                maxLength={50}
              />
            </div>
            <div className="form-group">
              <label>Start Hour:</label>
              <input
                type="time"
                name="startHour"
                value={formData.startHour}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>End Hour:</label>
              <input
                type="time"
                name="endHour"
                value={formData.endHour}
                onChange={handleChange}
                required
              />
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label>Gender:</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Birth Date:</label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
              />
            </div>
          </>
        )}

        <button type="submit" className="submit-btn">Update Profile</button>
      </form>
    </div>
  );
};

export default EditProfile;
