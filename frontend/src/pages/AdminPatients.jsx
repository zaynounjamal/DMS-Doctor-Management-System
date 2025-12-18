import React, { useState, useEffect } from 'react';
import { getPatientsAdmin } from '../adminApi';
import { useToast } from '../contexts/ToastContext';
import { Users, Search, Phone, Calendar, Mail, User, ShieldCheck, HeartPulse, Filter, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPatients = () => {
    const { showToast } = useToast();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        setLoading(true);
        try {
            const data = await getPatientsAdmin();
            setPatients(data);
        } catch (error) {
            showToast('Failed to load patients', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(p => {
        const name = p.fullName || p.FullName || '';
        const phone = p.phone || p.Phone || '';
        const username = p.username || p.Username || '';
        return (
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            phone.includes(searchTerm) ||
            username.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div className="max-w-[1500px] mx-auto space-y-6 md:space-y-8 pb-10 px-4 md:px-0">
            {/* Header / Search Section */}
            <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32 z-0" />
                
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-100">
                                <Users size={20} className="md:w-6 md:h-6" />
                             </div>
                             <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Patient Registry</h2>
                        </div>
                        <p className="text-gray-500 font-medium font-bold uppercase text-[9px] md:text-[10px] tracking-[0.2em] flex items-center gap-2">
                             <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-500" />
                             Secure Patient Data Management
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5 group-focus-within:text-blue-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name, phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-bold text-gray-900 placeholder:text-gray-400 shadow-inner text-sm md:text-base"
                            />
                        </div>
                        <div className="flex items-center gap-2 px-4 py-3 md:py-4 bg-gray-50 rounded-2xl">
                            <Filter size={16} className="text-gray-400" />
                            <span className="text-xs md:text-sm font-bold text-gray-900 whitespace-nowrap">
                                {filteredPatients.length} <span className="text-gray-400">RESULTS</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-[24px] md:rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 md:px-8 py-5 md:py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 min-w-[200px]">Patient Identity</th>
                                <th className="px-6 md:px-8 py-5 md:py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 min-w-[180px]">Contact Details</th>
                                <th className="px-6 md:px-8 py-5 md:py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 min-w-[150px]">Birth Info</th>
                                <th className="px-6 md:px-8 py-5 md:py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 min-w-[140px]">Registration</th>
                                <th className="px-6 md:px-8 py-5 md:py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 min-w-[140px]">Operational Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 md:px-8 py-8">
                                            <div className="h-12 bg-gray-50 rounded-2xl" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredPatients.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 md:px-8 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
                                                <Users className="w-8 h-8 md:w-10 md:h-10 text-gray-200" />
                                            </div>
                                            <h3 className="text-lg md:text-xl font-bold text-gray-900">No Patient Records</h3>
                                            <p className="text-gray-500 font-medium max-w-xs mx-auto mt-2 text-sm">We couldn't find any patients matching your current search parameters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredPatients.map((patient, index) => {
                                    const fullName = patient.fullName || patient.FullName || 'Unknown';
                                    const username = patient.username || patient.Username || 'unknown';
                                    const phone = patient.phone || patient.Phone || 'N/A';
                                    const birthDate = patient.birthDate || patient.BirthDate;
                                    const createdAt = patient.createdAt || patient.CreatedAt;
                                    const isActive = patient.isActive !== undefined ? patient.isActive : patient.IsActive;

                                    return (
                                        <motion.tr 
                                            key={patient.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group hover:bg-blue-50/30 transition-all duration-300"
                                        >
                                            <td className="px-6 md:px-8 py-5 md:py-6">
                                                <div className="flex items-center gap-3 md:gap-4">
                                                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-600 font-black flex items-center justify-center text-base md:text-xl shadow-sm border border-blue-100 group-hover:scale-110 transition-transform duration-300">
                                                        {fullName[0]?.toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-extrabold text-xs md:text-sm text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                                                            {fullName}
                                                            {patient.gender === 'female' ? 
                                                                <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-pink-400 rounded-full" /> : 
                                                                <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-blue-400 rounded-full" />
                                                            }
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold text-gray-400 mt-0.5">
                                                            <span className="bg-gray-100 px-1.5 py-0.5 rounded uppercase">@{username}</span>
                                                            <span className="capitalize">{patient.gender}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 md:px-8 py-5 md:py-6">
                                                <div className="space-y-1 md:space-y-1.5">
                                                    <div className="flex items-center gap-2 text-xs md:text-sm text-gray-900 font-bold group-hover:translate-x-1 transition-transform">
                                                        <Phone size={12} className="text-emerald-500" />
                                                        {phone}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-500 font-medium group-hover:translate-x-1 transition-transform delay-75">
                                                        <Mail size={12} className="text-blue-400" />
                                                        {username}@dms.com
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 md:px-8 py-5 md:py-6">
                                                <div className="flex items-center gap-2 md:gap-3">
                                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-50 text-orange-600 rounded-lg md:rounded-xl flex items-center justify-center">
                                                        <Calendar size={14} className="md:w-4 md:h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs md:text-sm font-bold text-gray-900">
                                                            {birthDate ? new Date(birthDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                                        </div>
                                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">DOB</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 md:px-8 py-5 md:py-6">
                                                <div className="flex items-center gap-2 md:gap-3">
                                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-50 text-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center">
                                                        <Clock size={14} className="md:w-4 md:h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs md:text-sm font-bold text-gray-900">
                                                            {createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}
                                                        </div>
                                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Joined</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 md:px-8 py-5 md:py-6 text-right">
                                                <div className={`inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl text-[9px] font-black tracking-[0.1em] ${
                                                    isActive 
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm shadow-emerald-50' 
                                                        : 'bg-red-50 text-red-700 border border-red-100 shadow-sm shadow-red-50'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                                    {isActive ? 'ACTIVE' : 'INACTIVE'}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPatients;
