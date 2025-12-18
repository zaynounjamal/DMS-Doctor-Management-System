import React, { useState, useEffect } from 'react';
import { getHolidays, createHoliday, deleteHoliday } from '../adminApi';
import { useToast } from '../contexts/ToastContext';
import { Calendar, Trash2, Plus, Info, ShieldAlert, Sparkles, Clock, Globe, ArrowRight, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminSchedule = () => {
    const { showToast } = useToast();
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });
    const [newHoliday, setNewHoliday] = useState({
        date: '',
        name: '',
        isRecurring: false
    });

    useEffect(() => {
        loadHolidays();
    }, []);

    const loadHolidays = async () => {
        setLoading(true);
        try {
            const data = await getHolidays();
            setHolidays(data);
        } catch (error) {
            showToast('Failed to load holidays', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createHoliday(newHoliday);
            showToast('Holiday registered successfully', 'success');
            setNewHoliday({ date: '', name: '', isRecurring: false });
            loadHolidays();
        } catch (error) {
            showToast('Failed to create holiday', 'error');
        }
    };

    const confirmDelete = async () => {
        try {
            await deleteHoliday(deleteModal.id);
            setHolidays(holidays.filter(h => h.id !== deleteModal.id));
            showToast('Holiday removed from registry', 'success');
            setDeleteModal({ open: false, id: null, name: '' });
        } catch (error) {
            showToast('Failed to delete holiday', 'error');
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-10">
            {/* Header Section */}
            <div className="relative overflow-hidden bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32 z-0" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100">
                            <Calendar size={24} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Clinic Schedule</h2>
                    </div>
                    <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Manage Global Holidays & Operating Days
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-4 bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 sticky top-8"
                >
                    <div className="mb-8">
                        <h3 className="text-xl font-black text-gray-900 mb-2">Register Holiday</h3>
                        <p className="text-sm text-gray-500 font-medium">New entries will automatically block patient bookings for all doctors.</p>
                    </div>

                    <form onSubmit={handleCreate} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Event Identification</label>
                            <input
                                type="text" required
                                value={newHoliday.name}
                                onChange={e => setNewHoliday({...newHoliday, name: e.target.value})}
                                placeholder="e.g. Independence Day"
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-bold text-gray-900 placeholder:text-gray-400"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Selected Date</label>
                            <input
                                type="date" required
                                value={newHoliday.date}
                                onChange={e => setNewHoliday({...newHoliday, date: e.target.value})}
                                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all font-bold text-gray-900 min-h-[56px]"
                            />
                        </div>

                        <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl cursor-pointer group hover:bg-indigo-50 transition-colors">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={newHoliday.isRecurring}
                                    onChange={e => setNewHoliday({...newHoliday, isRecurring: e.target.checked})}
                                    className="peer sr-only"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </div>
                            <div className="flex-1">
                                <span className="block text-sm font-black text-gray-900">Annual Occurrence</span>
                                <span className="text-[10px] text-gray-500 font-bold uppercase">Repeat every year</span>
                            </div>
                        </label>
                        
                        <div className="p-4 bg-amber-50 rounded-2xl flex gap-3 border border-amber-100">
                            <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
                            <p className="text-xs font-bold text-amber-700 leading-relaxed uppercase">
                                <span className="block mb-1 text-[10px] opacity-75">Warning:</span>
                                This action will override all existing appointments on the selected date.
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="w-full group py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={18} />
                            Deploy Holiday
                        </button>
                    </form>
                </motion.div>

                {/* List Container */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <Globe size={16} className="text-gray-400" />
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Configured Schedule Interruptions</h3>
                        </div>
                        <span className="px-3 py-1 bg-white border border-gray-100 rounded-full text-[10px] font-black text-gray-500 shadow-sm">
                            {holidays.length} ENTRIES
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <AnimatePresence mode='popLayout'>
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="h-24 bg-white rounded-[24px] border border-gray-100 animate-pulse" />
                                ))
                            ) : holidays.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-white rounded-[32px] border border-gray-100 p-12 text-center"
                                >
                                    <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                        <Calendar className="w-8 h-8 text-gray-200" />
                                    </div>
                                    <h4 className="font-black text-gray-900 mb-1">No Holidays Defined</h4>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Clinic will operate normally on all dates.</p>
                                </motion.div>
                            ) : (
                                holidays.map((holiday, idx) => (
                                    <motion.div
                                        key={holiday.id}
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group bg-white rounded-[24px] border border-gray-100 p-6 flex flex-col sm:flex-row items-center gap-6 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 relative overflow-hidden"
                                    >
                                        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex flex-col items-center justify-center font-black flex-shrink-0 group-hover:scale-110 transition-transform">
                                            <span className="text-xs leading-none uppercase">{new Date(holiday.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                            <span className="text-xl leading-none">{new Date(holiday.date).getDate()}</span>
                                        </div>

                                        <div className="flex-1 text-center sm:text-left">
                                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                                                <h4 className="text-lg font-black text-gray-900">{holiday.name}</h4>
                                                {holiday.isRecurring && (
                                                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase rounded-lg border border-indigo-100">
                                                        Recurring Annual
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-center sm:justify-start gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                <span className="flex items-center gap-1.5 text-gray-400">
                                                    <Clock size={12} className="text-gray-300" />
                                                    {holiday.isRecurring ? 'Yearly Global Block' : `Full Day Block ${new Date(holiday.date).getFullYear()}`}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setDeleteModal({ open: true, id: holiday.id, name: holiday.name })}
                                            className="p-4 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all sm:opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Custom Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteModal.open && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDeleteModal({ open: false, id: null, name: '' })}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden p-10"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 bg-red-50 rounded-[32px] flex items-center justify-center mb-8 relative">
                                    <div className="absolute inset-0 bg-red-100 rounded-[32px] animate-ping opacity-20" />
                                    <AlertCircle size={40} className="text-red-600 relative z-10" />
                                </div>
                                
                                <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tighter">
                                    Delete Holiday?
                                </h3>
                                <p className="text-gray-500 font-medium mb-10 leading-relaxed uppercase text-xs tracking-widest">
                                    You are removing <span className="text-gray-900 font-black">"{deleteModal.name}"</span>. 
                                    This will reactivate patient bookings for this date. This action cannot be undone.
                                </p>

                                <div className="flex flex-col w-full gap-3">
                                    <button 
                                        onClick={confirmDelete}
                                        className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-red-100 hover:bg-red-700 hover:-translate-y-1 transition-all"
                                    >
                                        Delete Forever
                                    </button>
                                    <button 
                                        onClick={() => setDeleteModal({ open: false, id: null, name: '' })}
                                        className="w-full py-5 bg-gray-50 text-gray-500 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-gray-100 transition-all"
                                    >
                                        Keep Entry
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminSchedule;
