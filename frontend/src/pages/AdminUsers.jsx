import React, { useState, useEffect } from 'react';
import { getUsers, createUser, toggleUserStatus, resetPassword, blockUser, unblockUser } from '../adminApi';
import { useToast } from '../contexts/ToastContext';
import { Plus, Search, User, Shield, Phone, Activity, Power, Lock, X, Mail, ShieldCheck, UserPlus, Filter, AlertCircle, Ban, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const AdminUsers = () => {
    const { showToast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Filter state
    const [roleFilter, setRoleFilter] = useState('all');

    // Password Reset State
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [userToReset, setUserToReset] = useState(null);
    const [newPassword, setNewPassword] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        email: '',
        role: 'doctor', // default
        phone: '',
        specialty: ''
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            showToast('Failed to load users', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await toggleUserStatus(id);
            setUsers(users.map(u => 
                u.id === id ? { ...u, isActive: !u.isActive } : u
            ));
            showToast('User status updated', 'success');
        } catch (error) {
            showToast('Failed to update status', 'error');
        }
    };

    const handleBlockUser = async (user) => {
        try {
            await blockUser(user.id, { blockLogin: true, blockBooking: true, reason: 'Blocked by admin' });
            await loadUsers();
            showToast('User blocked (login + booking)', 'success');
        } catch (error) {
            showToast('Failed to block user', 'error');
        }
    };

    const handleUnblockUser = async (user) => {
        try {
            await unblockUser(user.id);
            await loadUsers();
            showToast('User unblocked (no-show reset)', 'success');
        } catch (error) {
            showToast('Failed to unblock user', 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createUser(formData);
            showToast('User created successfully', 'success');
            setShowModal(false);
            setFormData({
                username: '',
                password: '',
                fullName: '',
                email: '',
                role: 'doctor',
                phone: '',
                specialty: ''
            });
            loadUsers();
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenResetModal = (user) => {
        setUserToReset(user);
        setNewPassword('');
        setPasswordModalOpen(true);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!newPassword || newPassword.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }

        try {
            await resetPassword(userToReset.id, newPassword);
            showToast('Password reset successfully', 'success');
            setPasswordModalOpen(false);
        } catch (error) {
            showToast(error.message || 'Failed to reset password', 'error');
        }
    };

    const filteredUsers = users.filter(user => {
        const username = user.username || user.Username || '';
        const fullName = user.fullName || user.FullName || '';
        const role = user.role || user.Role || '';

        const matchesSearch = username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              fullName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || role.toLowerCase() === roleFilter.toLowerCase();
        return matchesSearch && matchesRole;
    });

    return (
        <div className="max-w-[1500px] mx-auto space-y-6 md:space-y-8 pb-10 px-4">
            {/* Header section */}
            <div className="bg-white rounded-[24px] md:rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">System Users</h2>
                        <p className="mt-1 text-gray-500 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                             <ShieldCheck className="w-4 h-4 text-blue-600" />
                             Access Control & Permissions
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <Link
                            to="/admin/blocked-phones"
                            className="flex items-center justify-center w-full sm:w-auto px-6 py-3.5 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black shadow-xl shadow-gray-200 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm md:text-base"
                        >
                            <Phone className="w-5 h-5 mr-2" />
                            Blocked Phones
                        </Link>
                        <button 
                            onClick={() => setShowModal(true)}
                            className="flex items-center justify-center w-full sm:w-auto px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all hover:scale-[1.02] active:scale-[0.98] text-sm md:text-base"
                        >
                            <UserPlus className="w-5 h-5 mr-2" />
                            Create New User
                        </button>
                    </div>
                </div>

                <div className="mt-8 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find user by name or username..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-bold text-gray-900 text-sm md:text-base"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="pl-10 pr-10 py-3 md:py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-bold text-gray-900 appearance-none min-w-[160px] text-sm md:text-base"
                        >
                            <option value="all">Every Role</option>
                            <option value="doctor">Doctors</option>
                            <option value="secretary">Secretaries</option>
                            <option value="patient">Patients</option>
                            <option value="admin">Administrators</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-[24px] md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto -mx-4 md:mx-0">
                    <div className="px-4 md:px-0">
                        <table className="w-full border-collapse min-w-[920px]">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 md:px-8 py-4 md:py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 min-w-[200px]">User Identity</th>
                                <th className="px-6 md:px-8 py-4 md:py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 min-w-[200px]">Contact Channels</th>
                                <th className="px-6 md:px-8 py-4 md:py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 min-w-[120px]">Platform Role</th>
                                <th className="px-6 md:px-8 py-4 md:py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 min-w-[200px]">Current Status</th>
                                <th className="px-6 md:px-8 py-4 md:py-5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 min-w-[100px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 md:px-8 py-6 h-20 bg-gray-50/20"></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 md:px-8 py-16 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                <User className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <p className="text-gray-500 font-bold text-sm">No system users found matching your search</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => {
                                    const fullName = user.fullName || user.FullName || 'System User';
                                    const username = user.username || user.Username || 'unknown';
                                    const role = user.role || user.Role || 'user';
                                    const email = user.email || user.Email || 'N/A';
                                    const phone = user.phone || user.Phone || 'N/A';
                                    const isActive = user.isActive !== undefined ? user.isActive : user.IsActive;

                                    return (
                                        <tr key={user.id} className="group hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 md:px-8 py-4 md:py-6">
                                                <div className="flex items-center gap-3 md:gap-4">
                                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-50 text-blue-600 font-extrabold flex items-center justify-center text-base md:text-lg shadow-sm border border-blue-100/50">
                                                        {fullName[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-xs md:text-sm text-gray-900 group-hover:text-blue-600 transition-colors">{fullName}</div>
                                                        <div className="text-[10px] md:text-xs font-bold text-gray-400 tracking-tight">@{username}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 md:px-8 py-4 md:py-6">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-xs md:text-sm text-gray-900 font-bold">
                                                        <Mail className="w-3.5 h-3.5 text-gray-300" />
                                                        {email}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-500 font-medium">
                                                        <Phone className="w-3.5 h-3.5 text-gray-300" />
                                                        {phone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 md:px-8 py-4 md:py-6">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border ${
                                                    role.toLowerCase() === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                    role.toLowerCase() === 'doctor' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    role.toLowerCase() === 'secretary' ? 'bg-pink-50 text-pink-700 border-pink-200' :
                                                    'bg-gray-50 text-gray-700 border-gray-200'
                                                }`}>
                                                    {role}
                                                </span>
                                            </td>
                                            <td className="px-6 md:px-8 py-4 md:py-6">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] md:text-[10px] font-bold ${
                                                    isActive 
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                                        : 'bg-red-50 text-red-700 border border-red-100'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                                    {isActive ? 'OPERATIONAL' : 'RESTRICTED'}
                                                </div>

                                                {user.isLoginBlocked || user.isBookingBlocked ? (
                                                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] md:text-[10px] font-bold bg-gray-900 text-white">
                                                        <Ban className="w-3.5 h-3.5" />
                                                        BLOCKED
                                                    </div>
                                                ) : null}

                                                <div className="mt-2 text-[10px] md:text-xs font-bold text-gray-500">
                                                    No-shows: <span className="text-gray-900">{user.noShowCount ?? 0}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 md:px-8 py-4 md:py-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {user.isLoginBlocked || user.isBookingBlocked ? (
                                                        <button
                                                            onClick={() => handleUnblockUser(user)}
                                                            className="p-2 md:p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                            title="Unblock user (reset no-show count)"
                                                        >
                                                            <Unlock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleBlockUser(user)}
                                                            className="p-2 md:p-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-sm"
                                                            title="Block user (login + booking)"
                                                        >
                                                            <Ban className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleOpenResetModal(user)}
                                                        className="p-2 md:p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                        title="Security: Reset Password"
                                                    >
                                                        <Lock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(user.id)}
                                                        className={`p-2 md:p-2.5 rounded-xl transition-all shadow-sm ${
                                                            isActive 
                                                                ? 'bg-red-50 text-red-500 hover:bg-red-600 hover:text-white' 
                                                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                                                        }`}
                                                        title={isActive ? "Deactivate Account" : "Activate Account"}
                                                    >
                                                        <Power className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>

            {/* Create User Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-[24px] md:rounded-[32px] w-full max-w-lg shadow-2xl relative z-10 overflow-hidden mx-auto max-h-[90vh] flex flex-col"
                        >
                            <div className="px-6 md:px-8 py-5 md:py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                                <div>
                                    <h3 className="text-xl font-extrabold text-gray-900">Add System User</h3>
                                    <p className="text-xs text-blue-600 font-black uppercase tracking-widest mt-1">Initialize new operational account</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-2.5 bg-white rounded-xl text-gray-400 hover:text-gray-600 shadow-sm transition-colors border border-gray-100">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="col-span-1 sm:col-span-2">
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">User Permissions Role</label>
                                        <div className="relative">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                                            <select 
                                                value={formData.role} 
                                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                                className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all appearance-none"
                                            >
                                                <option value="doctor">Doctor (Medical Provider)</option>
                                                <option value="secretary">Secretary (Admin Support)</option>
                                                <option value="patient">Patient (Frontend Client)</option>
                                                <option value="admin">System Administrator</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Security Username</label>
                                        <input 
                                            type="text" required
                                            value={formData.username}
                                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                                            className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                                            placeholder="e.g. jdoe88"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Access Password</label>
                                        <input 
                                            type="password" required
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Full Legal Name</label>
                                    <input 
                                        type="text" required
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                        className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                                        placeholder="e.g. Dr. John Doe"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email Endpoint</label>
                                        <input 
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                                            placeholder="contact@clinic.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                                        <input 
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                                            placeholder="+1 234 567"
                                        />
                                    </div>
                                </div>

                                {formData.role === 'doctor' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                    >
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Medical Specialty</label>
                                        <input 
                                            type="text"
                                            value={formData.specialty}
                                            onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                                            className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                                            placeholder="e.g. Orthodontist"
                                        />
                                    </motion.div>
                                )}

                                <div className="pt-4 flex gap-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-colors"
                                    >
                                        Discard
                                    </button>
                                    <button 
                                        type="submit" disabled={submitting}
                                        className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {submitting ? 'Initializing...' : 'Authorize User'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Password Reset Modal */}
            <AnimatePresence>
                {passwordModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setPasswordModalOpen(false)}
                            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative z-10 text-center mx-auto"
                        >
                            <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 scale-110 border border-orange-100">
                                <Lock size={40} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Security Override</h3>
                            <p className="text-gray-500 mb-8 font-medium px-4 leading-relaxed">
                                Enter a new secure password for <span className="font-bold text-gray-900">{userToReset?.fullName}</span>.
                            </p>
                            <form onSubmit={handleResetPassword} className="space-y-6 text-left">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Strong Password</label>
                                    <input 
                                        type="password" required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all shadow-inner"
                                        placeholder="Min 6 characters"
                                        minLength={6}
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-3 pt-2">
                                    <button 
                                        type="submit"
                                        className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 shadow-lg shadow-orange-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        Override Password
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setPasswordModalOpen(false)}
                                        className="w-full py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all"
                                    >
                                        Cancel Override
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminUsers;
