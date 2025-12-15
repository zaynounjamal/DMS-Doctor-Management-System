import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSecretaryProfile, updateSecretaryProfile } from '../secretaryApi';
import { useToast } from '../contexts/ToastContext';
import { User, Phone, Save, ArrowLeft } from 'lucide-react';

const SecretaryProfile = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        fullName: '',
        phone: '',
        username: ''
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const data = await getSecretaryProfile();
            setProfile(data);
        } catch (error) {
            showToast('Failed to load profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateSecretaryProfile({
                fullName: profile.fullName,
                phone: profile.phone
            });
            showToast('Profile updated successfully!', 'success');
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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/secretary-dashboard')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage your personal information</p>
                </div>

                {/* Profile Form */}
                <div className="bg-white shadow rounded-lg">
                    <form onSubmit={handleSubmit}>
                        <div className="px-6 py-6 space-y-6">
                            {/* Username (Read-only) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <User className="w-4 h-4 inline mr-2" />
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={profile.username}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                                />
                                <p className="mt-1 text-xs text-gray-500">Username cannot be changed</p>
                            </div>

                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={profile.fullName}
                                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Phone className="w-4 h-4 inline mr-2" />
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={profile.phone}
                                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/secretary-dashboard')}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Change Password Section */}
                <div className="mt-6 bg-white shadow rounded-lg px-6 py-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Change Password</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        To change your password, please contact the system administrator.
                    </p>
                    <button
                        onClick={() => showToast('Please contact admin to change password', 'info')}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                    >
                        Request Password Change
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SecretaryProfile;
