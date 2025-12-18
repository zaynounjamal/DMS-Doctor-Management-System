import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, Calendar, Shield, LogOut, AlertTriangle, X } from 'lucide-react';
import BackButton from '../components/ui/BackButton';
import { BASE_URL } from '../config';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  // Helper to get image URL
  const getImageUrl = (path) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `${BASE_URL}${path}`;
  };

  // Determine back button destination based on user role
  const backButtonDestination = user.role?.toLowerCase() === 'doctor' ? '/doctor/dashboard' : '/';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <BackButton to={backButtonDestination} />
          <div className="flex items-center justify-between">
             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          </div>

        {/* Profile Header Card */}
        <div className="rounded-2xl border-0 bg-white dark:bg-gray-800 shadow-lg overflow-hidden flex flex-col relative group">
           {/* Background Pattern/Gradient - Full width */}
          <div className="h-48 bg-gradient-to-r from-primary-light to-primary-dark w-full relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <div className="w-40 h-40 rounded-full border-8 border-white"></div>
            </div>
            <div className="absolute bottom-0 left-10 p-4 opacity-10">
               <div className="w-24 h-24 rounded-full bg-white"></div>
            </div>
          </div>
          
          <div className="relative px-6 pb-6 -mt-20 flex flex-col items-center text-center z-10 w-full">
             {/* Avatar with Ring - Centered */}
              <div className="flex-shrink-0 mb-4">
                <div className="w-40 h-40 rounded-full border-[6px] border-white dark:border-gray-800 bg-white dark:bg-gray-700 shadow-xl overflow-hidden flex items-center justify-center relative group-hover:scale-105 transition-transform duration-300">
                  {user.profilePhoto ? (
                    <img 
                      src={getImageUrl(user.profilePhoto)} 
                      alt={user.fullName || "Profile"} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary-light/10 dark:bg-primary-dark/20 flex items-center justify-center">
                       <span className="text-5xl font-bold text-primary-light dark:text-primary-dark">
                          {(user.fullName || user.username || 'U').charAt(0).toUpperCase()}
                       </span>
                    </div>
                  )}
                </div>
              </div>

              {/* User Info - Centered and clearly below banner */}
              <div className="flex flex-col items-center">
                 <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{user.fullName || user.username || 'Welcome User'}</h2>
                 <div className="flex items-center gap-2 mb-4 bg-primary-light/10 dark:bg-primary-dark/20 px-4 py-1.5 rounded-full">
                   <Shield size={16} className="text-primary-light dark:text-primary-dark" />
                   <p className="text-primary-dark dark:text-primary-light font-semibold capitalize">{user.role || 'Patient'}</p>
                 </div>
                 
                 {/* Logout Button */}
                 <button 
                    onClick={() => setShowLogoutModal(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-medium shadow-md hover:shadow-lg transform active:scale-95"
                 >
                    <LogOut size={18} />
                    <span>Logout</span>
                 </button>
              </div>
           </div>

             {/* Personal Info Grid */}
             <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-gray-100 dark:border-gray-700 pt-6">
                 <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                       <User size={18} />
                    </div>
                    <div className="overflow-hidden">
                       <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Username</p>
                       <p className="font-medium truncate">{user.username}</p>
                    </div>
                 </div>



                 <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                       <Phone size={18} />
                    </div>
                    <div className="overflow-hidden">
                       <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Phone</p>
                       <p className="font-medium truncate">{user.phone || 'Not set'}</p>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                       <Shield size={18} />
                    </div>
                    <div className="overflow-hidden">
                       <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Role</p>
                       <p className="font-medium capitalize">{user.role || 'Patient'}</p>
                    </div>
                 </div>
             </div>
          </div>

        {/* Action Tiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {user.role?.toLowerCase() !== 'doctor' && (
           <>
              <Link
                to="/my-appointments"
                className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              >
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Calendar className="w-24 h-24 text-primary-light dark:text-primary-dark" />
                 </div>
                 <div className="w-14 h-14 mb-4 rounded-xl bg-primary-light/10 dark:bg-primary-dark/20 flex items-center justify-center text-primary-light dark:text-primary-dark group-hover:scale-110 transition-transform duration-300">
                   <Calendar className="w-7 h-7" />
                 </div>
                 <h3 className="font-bold text-lg mb-1 group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors">My Appointments</h3>
                 <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">View upcoming visits and history.</p>
              </Link>

              <Link
                to="/financial-summary"
                className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Shield className="w-24 h-24 text-green-600" />
                </div>
                <div className="w-14 h-14 mb-4 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg mb-1 group-hover:text-green-600 transition-colors">Financial Summary</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Check billing, invoices, and payments.</p>
              </Link>
           </>
          )}

          <Link
            to="/edit-profile"
            className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <User className="w-24 h-24 text-blue-600" />
            </div>
            <div className="w-14 h-14 mb-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
              <User className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg mb-1 group-hover:text-blue-600 transition-colors">Edit Profile</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Update your personal details.</p>
          </Link>

          <Link
            to="/change-password"
            className="group flex flex-col p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Shield className="w-24 h-24 text-orange-600" />
            </div>
            <div className="w-14 h-14 mb-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg mb-1 group-hover:text-orange-600 transition-colors">Change Password</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Secure your account access.</p>
          </Link>
        </div>
      </div>
      
      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
             <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                   <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sign Out</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Are you sure you want to sign out of your account?</p>
                
                <div className="flex gap-3">
                   <button 
                     onClick={() => setShowLogoutModal(false)}
                     className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                   >
                      Cancel
                   </button>
                   <button 
                     onClick={handleLogout}
                     className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/30 transition-colors"
                   >
                      Logout
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
