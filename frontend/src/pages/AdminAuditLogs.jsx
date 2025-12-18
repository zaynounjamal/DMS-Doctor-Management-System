import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '../adminApi';
import { useToast } from '../contexts/ToastContext';
import { Shield, RefreshCw, Clock, User, Activity, Search, Filter, Calendar, Terminal, ShieldAlert, Cpu, Database, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminAuditLogs = () => {
    const { showToast } = useToast();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        role: 'all',
        dateFrom: '',
        dateTo: ''
    });

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadLogs();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [filters]);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const data = await getAuditLogs(filters);
            setLogs(data);
        } catch (error) {
            console.error('Failed to load audit logs', error);
        } finally {
            setLoading(false);
        }
    };

    const getRoleStyles = (role) => {
        const styles = {
            admin: 'bg-indigo-50 text-indigo-700 border-indigo-100',
            doctor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            secretary: 'bg-amber-50 text-amber-700 border-amber-100',
            patient: 'bg-blue-50 text-blue-700 border-blue-100',
            system: 'bg-purple-50 text-purple-700 border-purple-100'
        };
        return styles[role?.toLowerCase()] || 'bg-gray-50 text-gray-700 border-gray-100';
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8 pb-10 px-4">
            {/* Header & Main Stats */}
            <div className="bg-white rounded-[24px] md:rounded-[40px] p-6 md:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gray-50/50 rounded-full blur-3xl -mr-40 -mt-40 z-0" />
                
                <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <div className="p-2.5 bg-gray-900 rounded-2xl text-white shadow-xl shadow-gray-200">
                                <Shield size={24} />
                             </div>
                             <h2 className="text-3xl font-black text-gray-900 tracking-tight">Security Audit</h2>
                        </div>
                        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                             <Terminal className="w-4 h-4 text-indigo-500" />
                             Low-level System Event Monitoring
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="flex flex-col sm:flex-row gap-4 bg-gray-50 p-3 rounded-[24px] md:rounded-[32px] w-full xl:w-auto">
                            <div className="relative flex-1 group min-w-0 sm:min-w-[280px]">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search user, action, hardware..."
                                    className="w-full pl-12 pr-6 py-3.5 md:py-4 bg-white border-none rounded-[20px] md:rounded-[24px] focus:ring-2 focus:ring-indigo-500/20 shadow-sm font-bold text-gray-900 placeholder:text-gray-300 transition-all"
                                    value={filters.search}
                                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={loadLogs}
                                    className={`p-3.5 md:p-4 bg-white text-gray-900 rounded-[20px] md:rounded-[24px] shadow-sm hover:shadow-md transition-all active:scale-95 ${loading ? 'animate-spin' : ''}`}
                                >
                                    <RefreshCw size={20} />
                                </button>
                                <div className="px-6 py-4 bg-gray-900 text-white rounded-[24px] flex items-center gap-3 shadow-lg shadow-gray-200 min-w-[140px]">
                                    <Activity size={18} className="text-indigo-400" />
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 opacity-60">Status</div>
                                        <div className="text-xs font-black uppercase leading-none">Healthy</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Surface */}
            <div className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[40px] shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-6 px-1">
                    <Filter size={14} className="text-gray-400" />
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Parameter Configuration</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Architectural Role</label>
                        <select
                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 font-bold text-gray-900 appearance-none cursor-pointer"
                            value={filters.role}
                            onChange={(e) => setFilters({...filters, role: e.target.value})}
                        >
                            <option value="all">All Access Levels</option>
                            <option value="admin">Administrators</option>
                            <option value="doctor">Medical Staff</option>
                            <option value="secretary">Clinic Operations</option>
                            <option value="patient">Portal Users</option>
                            <option value="system">Autonomous System</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-indigo-400 flex items-center gap-2">
                            <Calendar size={12} /> Start Vector
                        </label>
                        <input
                            type="date"
                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 font-bold text-gray-900"
                            value={filters.dateFrom}
                            onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 text-rose-400 flex items-center gap-2">
                            <Calendar size={12} /> End Vector
                        </label>
                        <input
                            type="date"
                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 font-bold text-gray-900"
                            value={filters.dateTo}
                            onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                        />
                    </div>
                </div>
            </div>

            {/* Log Grid */}
            <div className="bg-white rounded-[24px] md:rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto overflow-y-hidden">
                    <table className="w-full border-collapse min-w-[980px]">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Event Signature</th>
                                <th className="px-8 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">User Identity</th>
                                <th className="px-8 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Operation Type</th>
                                <th className="px-8 py-6 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">Runtime Details</th>
                                <th className="px-8 py-6 text-right text-xs font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">IP Node</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-8 py-8">
                                            <div className="h-10 bg-gray-50 rounded-2xl" />
                                        </td>
                                    </tr>
                                ))
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center mb-6">
                                                <Database className="w-10 h-10 text-gray-200" />
                                            </div>
                                            <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Zero Event Matches</h3>
                                            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest max-w-xs">
                                                The audit controller returned no logs for the current filter configuration.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log, idx) => {
                                    const timestamp = log.timestamp || log.Timestamp;
                                    const userName = log.userName || log.UserName || 'Unknown';
                                    const role = log.role || log.Role || 'user';
                                    const action = log.action || log.Action || 'Action';
                                    const details = log.details || log.Details || '';
                                    const ipAddress = log.ipAddress || log.IpAddress || 'PRIVATE_NODE';

                                    return (
                                        <motion.tr 
                                            key={log.id} 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="group hover:bg-gray-50/50 transition-all duration-300"
                                        >
                                            <td className="px-6 md:px-8 py-4 md:py-6 whitespace-nowrap">
                                                <div className="flex items-center gap-3 md:gap-4">
                                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-50 text-gray-400 rounded-xl flex items-center justify-center group-hover:bg-gray-900 group-hover:text-white transition-all duration-500">
                                                        <Clock size={14} className="md:w-4 md:h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs md:text-sm font-black text-gray-900">{timestamp ? new Date(timestamp).toLocaleDateString() : 'N/A'}</div>
                                                        <div className="text-[9px] md:text-[10px] font-black text-indigo-400 leading-none mt-1">
                                                            {timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 md:px-8 py-4 md:py-6">
                                                <div className="flex items-center gap-2 md:gap-3">
                                                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border border-gray-100 font-black text-gray-400 text-xs shadow-sm">
                                                        {userName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-xs md:text-sm text-gray-900 leading-none mb-1">{userName}</div>
                                                        <div className={`text-[8px] md:text-[9px] font-bold uppercase tracking-wider px-1.5 md:py-0.5 rounded-md border ${getRoleStyles(role)}`}>
                                                            {role}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 md:px-8 py-4 md:py-6">
                                                <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-gray-100 text-gray-900 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-gray-200 shadow-sm">
                                                    <Cpu size={10} className="text-indigo-600 md:w-3 md:h-3" />
                                                    {action}
                                                </div>
                                            </td>
                                            <td className="px-6 md:px-8 py-4 md:py-6">
                                                <div className="text-xs md:text-sm font-bold text-gray-500 max-w-xs md:max-w-md line-clamp-2 leading-relaxed">
                                                    {details}
                                                </div>
                                            </td>
                                            <td className="px-6 md:px-8 py-4 md:py-6 text-right">
                                                <div className="inline-block px-2 md:px-3 py-1 md:py-1.5 bg-gray-50 text-gray-400 rounded-lg font-mono text-[9px] md:text-[10px] font-black border border-gray-100 group-hover:bg-white transition-colors">
                                                    {ipAddress}
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

export default AdminAuditLogs;
