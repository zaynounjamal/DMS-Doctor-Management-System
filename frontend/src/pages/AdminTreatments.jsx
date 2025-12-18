import React, { useState, useEffect } from 'react';
import { getTreatments, createTreatment, updateTreatment, deleteTreatment } from '../adminApi';
import { useToast } from '../contexts/ToastContext';
import { Plus, Edit, Trash2, Search, X, AlertCircle, Settings } from 'lucide-react';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminTreatments = () => {
    const { showToast } = useToast();
    const [treatments, setTreatments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTreatment, setEditingTreatment] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        icon: 'Stethoscope'
    });

    useEffect(() => {
        loadTreatments();
    }, []);

    const loadTreatments = async () => {
        setLoading(true);
        try {
            const data = await getTreatments();
            setTreatments(data);
        } catch (error) {
            showToast('Failed to load treatments', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (treatment = null) => {
        if (treatment) {
            setEditingTreatment(treatment);
            setFormData({
                name: treatment.name,
                description: treatment.description,
                price: treatment.price,
                icon: treatment.icon || 'Stethoscope'
            });
        } else {
            setEditingTreatment(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                icon: 'Stethoscope'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData, price: Number(formData.price) };
            if (editingTreatment) {
                await updateTreatment(editingTreatment.id, payload);
                showToast('Treatment updated successfully', 'success');
            } else {
                await createTreatment(payload);
                showToast('Treatment created successfully', 'success');
            }
            setIsModalOpen(false);
            loadTreatments();
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;
        setIsDeleting(true);
        try {
            await deleteTreatment(deleteConfirmId);
            showToast('Treatment deleted successfully', 'success');
            setTreatments(prev => prev.filter(t => t.id !== deleteConfirmId));
            setDeleteConfirmId(null);
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredTreatments = treatments.filter(t => 
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.description.toLowerCase().includes(query.toLowerCase())
    );

    const DynamicIcon = ({ name, className = "w-5 h-5" }) => {
        const IconComponent = Icons[name];
        return IconComponent ? <IconComponent className={className} /> : <Icons.HelpCircle className={className} />;
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-10">
            {/* Header section with Stats or Breadcrumbs would go here */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Clinic Treatments</h2>
                        <p className="mt-1 text-gray-500 font-medium">Manage and configure available medical treatments and pricing</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center justify-center px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Treatment
                    </button>
                </div>

                <div className="mt-8 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find treatment by name or description..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all font-medium"
                        />
                    </div>
                    <div className="bg-blue-50 px-4 py-2 rounded-2xl flex items-center gap-3 border border-blue-100">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                            {filteredTreatments.length}
                        </div>
                        <span className="text-blue-900 font-bold text-sm">Treatments Active</span>
                    </div>
                </div>
            </div>

            {/* List Grid / Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Icon</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Treatment Details</th>
                                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Price</th>
                                <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="4" className="px-8 py-6 h-20 bg-gray-50/20"></td>
                                    </tr>
                                ))
                            ) : filteredTreatments.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-16 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                <Search className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <p className="text-gray-500 font-bold">No matching treatments found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTreatments.map(t => {
                                    const name = t.name || t.Name || 'Unnamed Treatment';
                                    const description = t.description || t.Description || '';
                                    const price = t.price || t.Price || 0;
                                    const icon = t.icon || t.Icon || 'Stethoscope';

                                    return (
                                        <tr key={t.id} className="group hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 md:px-8 py-4 md:py-6">
                                                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 text-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                                    <DynamicIcon name={icon} className="w-5 h-5 md:w-6 md:h-6" />
                                                </div>
                                            </td>
                                            <td className="px-6 md:px-8 py-4 md:py-6">
                                                <div className="font-bold text-xs md:text-sm text-gray-900 mb-0.5 md:mb-1">{name}</div>
                                                <div className="text-gray-500 text-[10px] md:text-sm font-medium line-clamp-1 max-w-[120px] md:max-w-sm">{description}</div>
                                            </td>
                                            <td className="px-6 md:px-8 py-4 md:py-6 whitespace-nowrap">
                                                <span className="px-2 md:px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs md:text-sm font-bold border border-green-100">
                                                    ${price}
                                                </span>
                                            </td>
                                            <td className="px-6 md:px-8 py-4 md:py-6 text-right">
                                                <div className="flex items-center justify-end gap-1.5 md:gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => handleOpenModal(t)} 
                                                        className="p-2 md:p-2.5 bg-gray-100 text-gray-600 rounded-lg md:rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => setDeleteConfirmId(t.id)} 
                                                        className="p-2 md:p-2.5 bg-gray-100 text-red-500 rounded-lg md:rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                        title="Delete"
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

            {/* Treatment Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {editingTreatment ? 'Edit Treatment' : 'Create Treatment'}
                                    </h3>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                                        {editingTreatment ? 'Update existing service' : 'Define new medical service'}
                                    </p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white rounded-xl text-gray-400 hover:text-gray-600 shadow-sm transition-colors border border-gray-100">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Treatment Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                                            placeholder="e.g. Tooth Extraction"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Price (USD)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                step="0.01"
                                                value={formData.price}
                                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                                className="w-full pl-8 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Visual Icon</label>
                                        <div className="px-4 py-3 bg-gray-50 rounded-2xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm shadow-blue-100">
                                                    <DynamicIcon name={formData.icon} className="w-5 h-5" />
                                                </div>
                                                <span className="text-gray-900 font-bold text-sm tracking-tight">{formData.icon}</span>
                                            </div>
                                            <Settings className="w-4 h-4 text-gray-300" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Icon Library</label>
                                    <div className="grid grid-cols-6 sm:grid-cols-8 gap-3 max-h-40 overflow-y-auto p-4 bg-gray-50 rounded-2xl custom-scrollbar border border-gray-100/50">
                                        {['Stethoscope', 'Activity', 'Heart', 'Pill', 'User', 'Clipboard', 'Thermometer', 'Syringe', 'Eye', 'Smile', 'Brain', 'Bone', 'Ear', 'Flame', 'Zap', 'Droplet'].map(iconName => (
                                            <button
                                                key={iconName}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, icon: iconName })}
                                                className={`aspect-square rounded-xl flex items-center justify-center transition-all ${formData.icon === iconName ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110 z-10' : 'bg-white text-gray-400 hover:text-blue-600 border border-gray-100'}`}
                                            >
                                               <DynamicIcon name={iconName} className="w-5 h-5" />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Detailed Description</label>
                                    <textarea
                                        required
                                        rows="3"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-gray-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all resize-none"
                                        placeholder="Briefly describe the treatment..."
                                    />
                                </div>
                                
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-colors"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95"
                                    >
                                        {editingTreatment ? 'Save Changes' : 'Publish Treatment'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Custom Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirmId && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDeleteConfirmId(null)}
                            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative z-10 text-center"
                        >
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 scale-110">
                                <AlertCircle size={40} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Treatment?</h3>
                            <p className="text-gray-500 mb-8 font-medium px-4 leading-relaxed">
                                This action cannot be undone. Are you sure you want to permanently remove this treatment?
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 shadow-lg shadow-red-100 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isDeleting && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    {isDeleting ? 'Deleting...' : 'Confirm Deletion'}
                                </button>
                                <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    disabled={isDeleting}
                                    className="w-full py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all disabled:opacity-50"
                                >
                                    No, Keep It
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminTreatments;
