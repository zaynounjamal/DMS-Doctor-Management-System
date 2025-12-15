import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Eye, EyeOff, User, Loader2, Phone, Calendar, UserCircle, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { login, signup, checkUsernameAvailability, getProfile } from '../../api';

const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { redirectPath, setRedirectPath } = useAuth();
  const [currentView, setCurrentView] = useState('login'); // 'login' or 'signup'
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    username: '',
    fullName: '',
    dateOfBirth: '',
    gender: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [usernameStatus, setUsernameStatus] = useState(''); // 'checking', 'available', 'taken', ''
  
  const genderDropdownRef = useRef(null);


  
  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
  ];

  // Password validation rules
  const passwordRules = [
    {
      id: 'length',
      label: 'At least 8 characters',
      validator: (password) => password.length >= 8
    },
    {
      id: 'uppercase',
      label: 'One uppercase letter',
      validator: (password) => /[A-Z]/.test(password)
    },
    {
      id: 'lowercase',
      label: 'One lowercase letter',
      validator: (password) => /[a-z]/.test(password)
    },
    {
      id: 'number',
      label: 'One number',
      validator: (password) => /[0-9]/.test(password)
    },
    {
      id: 'special',
      label: 'One special character',
      validator: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
  ];

  // Check password rules
  const getPasswordValidation = (password) => {
    return passwordRules.map(rule => ({
      ...rule,
      isValid: rule.validator(password)
    }));
  };

  const validationPatterns = {
    phoneNumber: /^\d{8,}$/, // At least 8 digits
    username: /^[a-zA-Z0-9._-]{3,30}$/,
    fullName: /^[a-zA-Z\s]{2,50}$/,
  };

  const validationMessages = {
    phoneNumber: 'Phone must contain at least 8 numbers',
    username: 'Username must be 3-30 characters (letters, numbers, dot, underscore, hyphen)',
    password: 'Password does not meet all requirements',
    fullName: 'Full name must be 2-50 characters (letters and spaces only)',
    dateOfBirth: 'Please select a valid date of birth',
    gender: 'Please select your gender',
    confirmPassword: 'Passwords do not match',
  };

  // Username availability check with debouncing
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
          setUsernameStatus('');
        }
      }
    };

    const timeoutId = setTimeout(() => {
      if (formData.username && !isLogin) {
        checkUsername();
      }
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [formData.username, isLogin]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (genderDropdownRef.current && !genderDropdownRef.current.contains(event.target)) {
        setIsGenderOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        phoneNumber: '',
        username: '',
        fullName: '',
        dateOfBirth: '',
        gender: '',
        password: '',
        confirmPassword: '',
      });
      setError('');
      setFieldErrors({});
      setCurrentView('login');
      setIsLogin(true);
      setUsernameStatus('');
    }
  }, [isOpen]);

  // Auto-redirect if already logged in (Fix for "Back button shows login")
  useEffect(() => {
    if (isOpen && isLogin && localStorage.getItem('user')) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            onClose(); // Just close the modal if we are already valid
            // Or redirect?
            if (user.role && user.role.toLowerCase() === 'doctor') {
               // navigate('/doctor/dashboard'); // Optional enforce
            }
        }
    }
  }, [isOpen, isLogin]);

  const validateField = (name, value) => {
    // Optional fields check
    if (!value && (name === 'dateOfBirth' || name === 'gender')) return '';
    
    if (!value) return 'This field is required';
    
    if (name === 'password' && !isLogin) {
      const validations = getPasswordValidation(value);
      if (!validations.every(v => v.isValid)) return validationMessages.password;
    }

    if (name === 'confirmPassword' && value !== formData.password) {
      return validationMessages.confirmPassword;
    }

    if (validationPatterns[name] && !validationPatterns[name].test(value)) {
      return validationMessages[name];
    }

    if (name === 'dateOfBirth') {
      const date = new Date(value);
      const now = new Date();
      const minAge = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate());
      const maxAge = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (date > maxAge) return 'Date cannot be in the future';
      if (date < minAge) return 'Please enter a valid date';
    }

    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Validate all fields
    const newErrors = {};
    const fieldsToValidate = isLogin 
      ? ['username', 'password']
      : ['fullName', 'username', 'phoneNumber', 'password', 'confirmPassword'];

    fieldsToValidate.forEach(field => {
      const errorMsg = validateField(field, formData[field]);
      if (errorMsg) newErrors[field] = errorMsg;
    });

    // Check username availability for signup
    if (!isLogin && usernameStatus === 'taken') {
      newErrors.username = 'Username is already taken';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // 1. Authenticate (Login or Signup)
      let authData;
      if (isLogin) {
        authData = await login(formData.username, formData.password);
      } else {
        const signupData = {
          username: formData.username,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phoneNumber,
          gender: formData.gender || null,
          birthDate: formData.dateOfBirth ? formData.dateOfBirth : null,
        };
        authData = await signup(signupData);
      }

      // 2. Save token temporarily to allow getProfile via API to work
      localStorage.setItem('user', JSON.stringify(authData));

      // 3. Fetch full profile to ensure we have all details (Phone, Photo, etc.)
      const profileResponse = await getProfile();
      
      // 4. Merge Data
      // IMPORTANT: Spreading profileResponse first ensuring we get root properties like 'role'
      // Then spreading profile which might overwrite some user props if names collide (usually fine)
      // 4. Merge Data
      console.log('DEBUG: authData', authData);
      console.log('DEBUG: profileResponse', profileResponse);

      const completeUser = {
        ...authData, 
        ...profileResponse, 
        ...profileResponse.profile, 
        token: authData.token
      };
      
      // Normalize to ensure core properties are consistent (handle PascalCase vs camelCase)
      const normalizedUser = {
        ...completeUser,
        role: (completeUser.role || completeUser.Role || '').toLowerCase(),
        id: completeUser.id || completeUser.Id,
        username: completeUser.username || completeUser.Username
      };

      console.log('DEBUG: normalizedUser', normalizedUser);

      // 5. Update Context & Close Modal
      onLogin(normalizedUser);
      onClose();
      
      // 6. Redirect Logic
      // Wrap in setTimeout to ensure state update propagates in App.jsx before route change
      setTimeout(() => {
        // Validate redirectPath is a string (and not an Event object)
        if (redirectPath && typeof redirectPath === 'string') {
            console.log("Redirecting to saved path:", redirectPath);
            navigate(redirectPath, { replace: true });
            setRedirectPath(null); 
        } else {
            // Fallback to Role-based redirection
            const userRole = normalizedUser.role;
            console.log("Redirecting based on role:", userRole);
            
            if (userRole === 'doctor') {
                // Use navigate with replace + reload if needed, but since we have protected routes now, navigate should be enough.
                // However, to ensure fresh state, window.location.href is safest for dashboard entry.
                // But user wanted "back press remove it". window.location.replace is akin to navigate replace.
                navigate('/doctor/dashboard', { replace: true });
                 // window.location.href = '/doctor/dashboard'; // Removing full reload unless necessary
            } else if (userRole === 'secretary') {
                navigate('/secretary-dashboard', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        }
      }, 100);

    } catch (err) {
      console.error("Authentication error:", err);
      // Clean up if failed
      localStorage.removeItem('user');
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchView = (view) => {
    setCurrentView(view);
    setError('');
    setFieldErrors({});
    setUsernameStatus('');
    if (view === 'login') setIsLogin(true);
    if (view === 'signup') setIsLogin(false);
  };

  // Render Helpers
  const renderInput = (name, label, type = 'text', icon, placeholder, required = true) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          {icon}
        </div>
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          className={`block w-full pl-10 pr-3 py-2.5 border ${
            fieldErrors[name] ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-muted-dark focus:ring-primary-light focus:border-primary-light dark:focus:ring-primary-dark dark:focus:border-primary-dark'
          } rounded-lg bg-white dark:bg-secondary-dark text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200`}
          placeholder={placeholder}
        />
      </div>
      {fieldErrors[name] && (
        <p className="text-xs text-red-500 mt-1 flex items-center">
          <AlertCircle size={12} className="mr-1" />
          {fieldErrors[name]}
        </p>
      )}
      {/* Username availability indicator */}
      {name === 'username' && !isLogin && formData.username.length >= 3 && (
        <div className="text-xs mt-1">
          {usernameStatus === 'checking' && <span className="text-gray-500">Checking availability...</span>}
          {usernameStatus === 'available' && <span className="text-green-600 dark:text-green-400">✓ Username available</span>}
          {usernameStatus === 'taken' && <span className="text-red-500">✗ Username taken</span>}
        </div>
      )}
    </div>
  );

  const renderPasswordInput = (name, label, showState, setShowState, placeholder) => (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <Lock size={18} />
        </div>
        <input
          type={showState ? 'text' : 'password'}
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          className={`block w-full pl-10 pr-10 py-2.5 border ${
            fieldErrors[name] ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-muted-dark focus:ring-primary-light focus:border-primary-light dark:focus:ring-primary-dark dark:focus:border-primary-dark'
          } rounded-lg bg-white dark:bg-secondary-dark text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200`}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setShowState(!showState)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          {showState ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {fieldErrors[name] && (
        <p className="text-xs text-red-500 mt-1 flex items-center">
          <AlertCircle size={12} className="mr-1" />
          {fieldErrors[name]}
        </p>
      )}
      {/* Password Strength Indicator for Signup */}
      {name === 'password' && !isLogin && formData[name].length > 0 && (
        <div className="mt-2 space-y-1 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Password requirements:</p>
          {getPasswordValidation(formData[name]).map((rule) => (
            <div key={rule.id} className="flex items-center text-xs">
              {rule.isValid ? (
                <Check size={12} className="text-green-500 mr-1.5" />
              ) : (
                <div className="w-3 h-3 rounded-full border border-gray-300 mr-1.5" />
              )}
              <span className={rule.isValid ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                {rule.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="w-full max-w-md bg-white dark:bg-secondary-dark rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 dark:border-muted-dark flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentView === 'login' && 'Welcome Back'}
                  {currentView === 'signup' && 'Create Account'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 modal-content">
                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start space-x-3"
                  >
                    <AlertCircle size={18} className="text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </motion.div>
                )}

                {/* VIEW: LOGIN */}
                {currentView === 'login' && (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {renderInput('username', 'Username', 'text', <User size={18} />, 'Enter your username')}
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <Lock size={18} />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`block w-full pl-10 pr-10 py-2.5 border ${
                            fieldErrors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-muted-dark focus:ring-primary-light focus:border-primary-light dark:focus:ring-primary-dark dark:focus:border-primary-dark'
                          } rounded-lg bg-white dark:bg-secondary-dark text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200`}
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {fieldErrors.password && (
                        <p className="text-xs text-red-500 mt-1 flex items-center">
                          <AlertCircle size={12} className="mr-1" />
                          {fieldErrors.password}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-light dark:bg-primary-dark hover:bg-primary-dark dark:hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Sign In'}
                    </button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-secondary-dark text-gray-500">
                          Don't have an account?
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => switchView('signup')}
                      className="w-full flex items-center justify-center py-3 px-4 border-2 border-primary-light dark:border-primary-dark rounded-lg text-sm font-medium text-primary-light dark:text-primary-dark hover:bg-primary-light/5 dark:hover:bg-primary-dark/10 transition-colors"
                    >
                      Create Account
                    </button>
                  </form>
                )}

                {/* VIEW: SIGNUP */}
                {currentView === 'signup' && (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {renderInput('fullName', 'Full Name', 'text', <UserCircle size={18} />, 'John Doe')}
                    {renderInput('username', 'Username', 'text', <User size={18} />, 'johndoe123')}
                    {renderInput('phoneNumber', 'Phone Number', 'number', <Phone size={18} />, '70123456')}
                    
                    {/* Date of Birth */}
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Date of Birth
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <Calendar size={18} />
                        </div>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          max={new Date().toISOString().split('T')[0]}
                          className={`block w-full pl-10 pr-3 py-2.5 border ${
                            fieldErrors.dateOfBirth ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-muted-dark focus:ring-primary-light focus:border-primary-light dark:focus:ring-primary-dark dark:focus:border-primary-dark'
                          } rounded-lg bg-white dark:bg-secondary-dark text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200`}
                        />
                      </div>
                      {fieldErrors.dateOfBirth && (
                        <p className="text-xs text-red-500 mt-1 flex items-center">
                          <AlertCircle size={12} className="mr-1" />
                          {fieldErrors.dateOfBirth}
                        </p>
                      )}
                    </div>

                    {/* Gender Dropdown */}
                    <div className="space-y-1 relative" ref={genderDropdownRef}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Gender
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsGenderOpen(!isGenderOpen)}
                        className={`w-full flex items-center justify-between pl-3 pr-3 py-2.5 border ${
                          fieldErrors.gender ? 'border-red-500' : 'border-gray-300 dark:border-muted-dark'
                        } rounded-lg bg-white dark:bg-secondary-dark text-left focus:outline-none focus:ring-2 focus:ring-primary-light transition-all`}
                      >
                        <span className={formData.gender ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>
                          {formData.gender ? genderOptions.find(o => o.value === formData.gender)?.label : 'Select Gender'}
                        </span>
                        <ChevronDown size={18} className={`text-gray-400 transition-transform ${isGenderOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isGenderOpen && (
                        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-secondary-dark border border-gray-200 dark:border-muted-dark rounded-lg shadow-lg max-h-60 overflow-auto">
                          {genderOptions.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, gender: option.value }));
                                setIsGenderOpen(false);
                                if (fieldErrors.gender) {
                                  setFieldErrors(prev => {
                                    const newErrors = { ...prev };
                                    delete newErrors.gender;
                                    return newErrors;
                                  });
                                }
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                      {fieldErrors.gender && (
                        <p className="text-xs text-red-500 mt-1 flex items-center">
                          <AlertCircle size={12} className="mr-1" />
                          {fieldErrors.gender}
                        </p>
                      )}
                    </div>
                    
                    {renderPasswordInput('password', 'Password', showPassword, setShowPassword, 'Create a strong password')}
                    {renderPasswordInput('confirmPassword', 'Confirm Password', showConfirmPassword, setShowConfirmPassword, 'Repeat your password')}

                    <button
                      type="submit"
                      disabled={isLoading || usernameStatus === 'taken'}
                      className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-light dark:bg-primary-dark hover:bg-primary-dark dark:hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                    >
                      {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Create Account'}
                    </button>

                    <div className="text-center mt-4">
                      <button
                        type="button"
                        onClick={() => switchView('login')}
                        className="text-sm text-primary-light dark:text-primary-dark hover:underline"
                      >
                        Already have an account? Sign In
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
