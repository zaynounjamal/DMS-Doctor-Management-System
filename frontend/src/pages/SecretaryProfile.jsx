
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSecretaryProfile, updateSecretaryProfile, changeSecretaryPassword } from '../secretaryApi';
import { useToast } from '../contexts/ToastContext';
import { User, Phone, Save, ChevronLeft, Shield, Clock, BadgeCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const SecretaryProfile = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        username: '', // Keep username for display
        oldPassword: '',
        newPassword: ''
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const data = await getSecretaryProfile();
            setFormData({
                fullName: data.fullName,
                phone: data.phone,
                username: data.username, // Set username from loaded data
                oldPassword: '',
                newPassword: ''
            });
        } catch (error) {
            showToast('Failed to load profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Update Profile Info
            await updateSecretaryProfile({
                fullName: formData.fullName,
                phone: formData.phone
            });

            let passwordChanged = false;
            // Change Password if provided
            if (formData.newPassword) {
                if (!formData.oldPassword) {
                    showToast('Please enter current password to change it', 'error');
                    setSaving(false); // Ensure saving state is reset
                    return;
                }
                await changeSecretaryPassword(formData.oldPassword, formData.newPassword);
                passwordChanged = true;
                // Clear password fields
                setFormData(prev => ({ ...prev, oldPassword: '', newPassword: '' }));
            }

            if (passwordChanged) {
                showToast('Profile and password updated successfully!', 'success');
            } else {
                showToast('Profile updated successfully!', 'success');
            }
        } catch (error) {
            showToast(error.message || 'Failed to update profile', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header/Breadcrumbs */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 text-center"
                >
                    <button
                        onClick={() => navigate('/secretary-dashboard')}
                        className="inline-flex items-center text-gray-500 hover:text-indigo-600 transition-colors mb-6 font-bold text-sm"
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Account Settings</h1>
                    <p className="mt-2 text-gray-500 font-medium">Update your profile information and security password</p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Profile Section */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900 text-lg">General Information</h3>
                                <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded">Official Staff Account</div>
                            </div>
                            <div className="p-8 space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Username</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={formData.username}
                                            disabled
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-500 cursor-not-allowed"
                                        />
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    </div>
                                    <p className="mt-2 text-[11px] text-gray-400 font-medium">Username cannot be changed. Contact admin for assistance.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans"
                                            placeholder="Your full name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                                placeholder="+961 XXXXXXX"
                                            />
                                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Section */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/50">
                                <h3 className="font-bold text-gray-900 text-lg">Security & Password</h3>
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Current Password</label>
                                    <input
                                        type="password"
                                        name="oldPassword"
                                        value={formData.oldPassword || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        placeholder="Enter to authorize change"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={formData.newPassword || ''}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        placeholder="Min 6 characters"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <p className="text-[11px] text-gray-400 font-medium bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                                        Note: Providing your current password is mandatory only if you decide to change your security credentials.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/secretary-dashboard')}
                                className="w-full sm:w-48 px-8 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full sm:w-48 px-8 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-100 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default SecretaryProfile;
