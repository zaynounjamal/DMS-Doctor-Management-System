import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, Calendar, Shield } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Please log in to view your profile</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        {/* Profile Card */}
        <div className="rounded-xl border border-gray-200 dark:border-muted-dark bg-white dark:bg-secondary-dark shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-primary-light dark:bg-primary-dark px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{user.fullName || user.name || 'User'}</h2>
                <p className="text-white/80">Patient</p>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="px-6 py-6 space-y-4">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username */}
              {user.username && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <User className="w-5 h-5 text-primary-light dark:text-primary-dark" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Username</p>
                    <p className="font-medium">{user.username}</p>
                  </div>
                </div>
              )}

              {/* Email */}
              {user.email && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <Mail className="w-5 h-5 text-primary-light dark:text-primary-dark" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
              )}

              {/* Phone */}
              {user.phone && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <Phone className="w-5 h-5 text-primary-light dark:text-primary-dark" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                </div>
              )}

              {/* Role */}
              {user.role && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <Shield className="w-5 h-5 text-primary-light dark:text-primary-dark" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Role</p>
                    <p className="font-medium capitalize">{user.role}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-muted-dark bg-gray-50 dark:bg-gray-800/50">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Profile page is currently under development. More features coming soon!
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/my-appointments"
            className="flex items-center gap-4 p-6 rounded-xl border-2 border-primary-light dark:border-primary-dark bg-white dark:bg-secondary-dark hover:bg-primary-light/5 dark:hover:bg-primary-dark/10 transition-all hover:scale-105 hover:shadow-lg"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-light/10 dark:bg-primary-dark/20">
              <Calendar className="w-6 h-6 text-primary-light dark:text-primary-dark" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">My Appointments</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">View your appointment history</p>
            </div>
          </Link>

          <Link
            to="/financial-summary"
            className="flex items-center gap-4 p-6 rounded-xl border-2 border-primary-light dark:border-primary-dark bg-white dark:bg-secondary-dark hover:bg-primary-light/5 dark:hover:bg-primary-dark/10 transition-all hover:scale-105 hover:shadow-lg"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-light/10 dark:bg-primary-dark/20">
              <Shield className="w-6 h-6 text-primary-light dark:text-primary-dark" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Financial Summary</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">View billing and payments</p>
            </div>
          </Link>

          <Link
            to="/edit-profile"
            className="flex items-center gap-4 p-6 rounded-xl border-2 border-primary-light dark:border-primary-dark bg-white dark:bg-secondary-dark hover:bg-primary-light/5 dark:hover:bg-primary-dark/10 transition-all hover:scale-105 hover:shadow-lg"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-light/10 dark:bg-primary-dark/20">
              <User className="w-6 h-6 text-primary-light dark:text-primary-dark" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Edit Profile</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Update your personal information</p>
            </div>
          </Link>

          <Link
            to="/change-password"
            className="flex items-center gap-4 p-6 rounded-xl border-2 border-primary-light dark:border-primary-dark bg-white dark:bg-secondary-dark hover:bg-primary-light/5 dark:hover:bg-primary-dark/10 transition-all hover:scale-105 hover:shadow-lg"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-light/10 dark:bg-primary-dark/20">
              <Shield className="w-6 h-6 text-primary-light dark:text-primary-dark" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Change Password</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Update your account password</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
