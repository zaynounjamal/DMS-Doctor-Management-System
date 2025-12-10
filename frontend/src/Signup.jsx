import React, { useState, useEffect } from 'react';
import { signup, checkUsernameAvailability } from './api';

const Signup = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    phone: '',
    gender: '',
    birthDate: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [usernameStatus, setUsernameStatus] = useState(''); // 'checking', 'available', 'taken', ''

  // Debounce username check
  useEffect(() => {
    setUsernameStatus(''); // Clear status immediately when username changes
    
    const controller = new AbortController();
    const signal = controller.signal;

    const checkUsername = async () => {
      if (formData.username.length < 3) {
        return;
      }

      setUsernameStatus('checking');
      try {
        const { available } = await checkUsernameAvailability(formData.username, signal);
        if (!signal.aborted) {
            setUsernameStatus(available ? 'available' : 'taken');
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
            console.error("Error checking username:", error);
            setUsernameStatus(`Error: ${error.message}`); 
        }
      }
    };

    const timeoutId = setTimeout(() => {
      if (formData.username) {
        checkUsername();
      }
    }, 500);

    return () => {
        clearTimeout(timeoutId);
        controller.abort();
    };
  }, [formData.username]);

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'username':
        if (!value) error = 'Username is required';
        break;
      case 'password':
        if (!value) error = 'Password is required';
        else if (value.length < 6) error = 'Password must be at least 6 characters';
        break;
      case 'fullName':
        if (!value) error = 'Full Name is required';
        break;
      case 'phone':
        if (!value) error = 'Phone is required';
        else if (!/^\d+$/.test(value)) error = 'Phone must contain only numbers';
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Username is required';
    else if (usernameStatus === 'taken') newErrors.username = 'Username is already taken';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (!formData.fullName) newErrors.fullName = 'Full Name is required';
    
    if (!formData.phone) newErrors.phone = 'Phone is required';
    else if (!/^\d+$/.test(formData.phone)) newErrors.phone = 'Phone must contain only numbers';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    if (!validate()) return;

    try {
      // Send null if birthDate is empty string
      const dataToSend = {
        ...formData,
        birthDate: formData.birthDate === '' ? null : formData.birthDate
      };
      
      const data = await signup(dataToSend);
      onLogin(data);
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Signup</h2>
      {serverError && <p className="error">{serverError}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input name="username" value={formData.username} onChange={handleChange} />
          {usernameStatus === 'checking' && <span className="status-text">Checking...</span>}
          {usernameStatus === 'available' && <span className="success-text">Username available</span>}
          {usernameStatus === 'taken' && <span className="error-text">Username taken</span>}
          {usernameStatus.startsWith('Error:') && <span className="error-text">{usernameStatus}</span>}
          {errors.username && <span className="error-text">{errors.username}</span>}
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} />
          {errors.password && <span className="error-text">{errors.password}</span>}
        </div>
        <div className="form-group">
          <label>Full Name</label>
          <input name="fullName" value={formData.fullName} onChange={handleChange} />
          {errors.fullName && <span className="error-text">{errors.fullName}</span>}
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input name="phone" value={formData.phone} onChange={handleChange} />
          {errors.phone && <span className="error-text">{errors.phone}</span>}
        </div>
        <div className="form-group">
          <label>Gender</label>
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div className="form-group">
          <label>Birth Date</label>
          <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} />
        </div>
        <button type="submit">Signup</button>
      </form>
    </div>
  );
};

export default Signup;
