import React, { useState } from 'react';
import { changePassword } from '../api';
import { Lock, Key, ShieldCheck, AlertCircle, CheckCircle, Check, X } from 'lucide-react';
import BackButton from '../components/ui/BackButton';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Password validation rules (Reused from LoginModal)
  const passwordRules = [
    { id: 'length', label: 'At least 8 characters', validator: (p) => p.length >= 8 },
    { id: 'uppercase', label: 'One uppercase letter', validator: (p) => /[A-Z]/.test(p) },
    { id: 'lowercase', label: 'One lowercase letter', validator: (p) => /[a-z]/.test(p) },
    { id: 'number', label: 'One number', validator: (p) => /[0-9]/.test(p) },
    { id: 'special', label: 'One special character', validator: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) }
  ];

  const getPasswordValidation = (password) => {
    return passwordRules.map(rule => ({
      ...rule,
      isValid: rule.validator(password)
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    // Client-side validation
    const validations = getPasswordValidation(formData.newPassword);
    const isPasswordValid = validations.every(v => v.isValid);

    if (!isPasswordValid) {
      setMessage({ type: 'error', text: 'Password does not meet all security requirements.' });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setLoading(true);

    try {
      await changePassword(formData);
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      
      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <BackButton to="/profile" />
        <div>
           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Change Password</h1>
           <p className="text-gray-500 dark:text-gray-400 mt-1">Ensure your account is secure by using a strong password.</p>
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
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2">
               <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
               <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                     <Key size={18} />
                  </div>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-light/50 focus:border-primary-light transition-all outline-none"
                    placeholder="Enter current password"
                  />
               </div>
            </div>

            <div className="space-y-4 pt-2">
               <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                  <div className="relative">
                     <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Lock size={18} />
                     </div>
                     <input
                       type="password"
                       name="newPassword"
                       value={formData.newPassword}
                       onChange={handleChange}
                       required
                       className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-light/50 focus:border-primary-light transition-all outline-none"
                       placeholder="Enter new password"
                     />
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.newPassword.length > 0 && (
                     <div className="mt-2 space-y-1 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Password requirements:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                           {getPasswordValidation(formData.newPassword).map((rule) => (
                              <div key={rule.id} className="flex items-center text-xs">
                                 {rule.isValid ? (
                                    <Check size={14} className="text-green-500 mr-2" />
                                 ) : (
                                    <div className="w-3.5 h-3.5 rounded-full border border-gray-300 mr-2" />
                                 )}
                                 <span className={rule.isValid ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-500 dark:text-gray-400'}>
                                    {rule.label}
                                 </span>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>

               <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                  <div className="relative">
                     <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <ShieldCheck size={18} />
                     </div>
                     <input
                       type="password"
                       name="confirmPassword"
                       value={formData.confirmPassword}
                       onChange={handleChange}
                       required
                       className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-light/50 focus:border-primary-light transition-all outline-none"
                       placeholder="Re-enter new password"
                     />
                  </div>
               </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full md:w-auto px-8 py-3 bg-primary-light hover:bg-primary-dark text-white font-semibold rounded-xl shadow-lg shadow-primary-light/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                   <>
                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                     Updating...
                   </>
                ) : (
                   <>
                     <ShieldCheck size={20} />
                     Change Password
                   </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
