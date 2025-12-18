import React, { useEffect, useMemo, useState } from 'react';
import { addBlockedPhone, getBlockedPhones, removeBlockedPhone } from '../adminApi';
import { useToast } from '../contexts/ToastContext';
import { Shield, Phone, Plus, Trash2, Search, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminBlockedPhones = () => {
    const { showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');

    const [submitting, setSubmitting] = useState(false);
    const [phone, setPhone] = useState('');
    const [reason, setReason] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const data = await getBlockedPhones();
            setItems(Array.isArray(data) ? data : []);
        } catch (e) {
            showToast('Failed to load blocked phone numbers', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const filtered = useMemo(() => {
        const q = (search ?? '').toString().trim().toLowerCase();
        if (!q) return items;
        return items.filter(x => {
            const p = (x.normalizedPhone ?? x.NormalizedPhone ?? '').toString().toLowerCase();
            const r = (x.reason ?? x.Reason ?? '').toString().toLowerCase();
            return p.includes(q) || r.includes(q);
        });
    }, [items, search]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!phone.trim()) {
            showToast('Phone is required', 'error');
            return;
        }

        setSubmitting(true);
        try {
            await addBlockedPhone({ phone, reason });
            setPhone('');
            setReason('');
            showToast('Phone number blocked', 'success');
            await load();
        } catch (err) {
            showToast(err?.message || 'Failed to block phone number', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemove = async (id) => {
        try {
            await removeBlockedPhone(id);
            showToast('Phone number unblocked', 'success');
            await load();
        } catch (err) {
            showToast(err?.message || 'Failed to unblock phone number', 'error');
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-6 md:space-y-8 pb-10 px-4">
            {/* Header */}
            <div className="bg-white rounded-[24px] md:rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-gray-900 rounded-2xl text-white shadow-xl shadow-gray-200">
                                <Shield size={22} />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Blocked Phone Numbers</h2>
                        </div>
                        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            Registration and booking will be rejected for blocked numbers
                        </p>
                    </div>

                    <div className="w-full md:w-auto">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search phone or reason"
                                className="w-full md:w-[340px] pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-bold text-gray-900 text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Add form */}
                <form onSubmit={handleAdd} className="mt-6 md:mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4">
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Phone number (any format)"
                                className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-bold text-gray-900"
                            />
                        </div>
                        <input
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Reason (optional)"
                            className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-bold text-gray-900"
                        />
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-[0.98] disabled:opacity-60"
                        >
                            <Plus className="w-5 h-5" />
                            {submitting ? 'Blocking...' : 'Block'}
                        </button>
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-[24px] md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto -mx-4 md:mx-0">
                    <div className="px-4 md:px-0">
                        <table className="w-full border-collapse min-w-[720px]">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 md:px-8 py-4 md:py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 min-w-[220px]">Phone</th>
                                    <th className="px-6 md:px-8 py-4 md:py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 min-w-[260px]">Reason</th>
                                    <th className="px-6 md:px-8 py-4 md:py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 min-w-[160px]">Created</th>
                                    <th className="px-6 md:px-8 py-4 md:py-5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 min-w-[100px]">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    Array.from({ length: 4 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan="4" className="px-6 md:px-8 py-6 h-20 bg-gray-50/20" />
                                        </tr>
                                    ))
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 md:px-8 py-16 text-center">
                                            <p className="text-gray-500 font-bold text-sm">No blocked phone numbers found</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((row) => {
                                        const id = row.id ?? row.Id;
                                        const p = row.normalizedPhone ?? row.NormalizedPhone;
                                        const r = row.reason ?? row.Reason;
                                        const createdAt = row.createdAt ?? row.CreatedAt;

                                        return (
                                            <tr key={id} className="group hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 md:px-8 py-4 md:py-6">
                                                    <div className="font-bold text-sm text-gray-900 tracking-tight">{p}</div>
                                                </td>
                                                <td className="px-6 md:px-8 py-4 md:py-6">
                                                    <div className="text-xs md:text-sm text-gray-700 font-semibold break-words">{r || '—'}</div>
                                                </td>
                                                <td className="px-6 md:px-8 py-4 md:py-6">
                                                    <div className="text-xs text-gray-500 font-bold">
                                                        {createdAt ? new Date(createdAt).toLocaleString() : '—'}
                                                    </div>
                                                </td>
                                                <td className="px-6 md:px-8 py-4 md:py-6 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleRemove(id)}
                                                            className="p-2 md:p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                            title="Unblock phone"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
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
        </div>
    );
};

export default AdminBlockedPhones;
