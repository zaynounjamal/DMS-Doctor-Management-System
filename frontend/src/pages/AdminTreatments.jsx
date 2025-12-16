
import React, { useState, useEffect } from 'react';
import { getTreatments, createTreatment, updateTreatment, deleteTreatment } from '../adminApi';
import { useToast } from '../contexts/ToastContext';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import * as Icons from 'lucide-react';

const AdminTreatments = () => {
    const { showToast } = useToast();
    const [treatments, setTreatments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTreatment, setEditingTreatment] = useState(null);
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

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this treatment?')) return;
        try {
            await deleteTreatment(id);
            showToast('Treatment deleted', 'success');
            setTreatments(treatments.filter(t => t.id !== id));
        } catch (error) {
            showToast(error.message, 'error');
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Manage Treatments</h2>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    New Treatment
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search treatments..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>

            {/* Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icon</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="5" className="px-6 py-4 text-center">Loading...</td></tr>
                        ) : filteredTreatments.length === 0 ? (
                            <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No treatments found</td></tr>
                        ) : (
                            filteredTreatments.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-gray-500 bg-gray-100 p-2 rounded-lg inline-block">
                                            <DynamicIcon name={t.icon} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{t.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-gray-900">${t.price}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-500 max-w-xs truncate">{t.description}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleOpenModal(t)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:text-red-900">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {editingTreatment ? 'Edit Treatment' : 'Add New Treatment'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    required
                                    rows="3"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            {/* Icon Picker */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                                <div className="grid grid-cols-6 gap-2 border p-2 rounded-lg max-h-48 overflow-y-auto">
                                    {['Stethoscope', 'Activity', 'Heart', 'Pill', 'User', 'Clipboard', 'Thermometer', 'Syringe', 'Eye', 'Smile', 'Brain', 'Bone', 'Ear', 'Flame', 'Zap', 'Droplet'].map(iconName => (
                                        <button
                                            key={iconName}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, icon: iconName })}
                                            className={`p-2 rounded flex items-center justify-center hover:bg-gray-100 transition-colors ${formData.icon === iconName ? 'bg-indigo-100 border-2 border-indigo-500 text-indigo-600' : 'border border-transparent text-gray-500'}`}
                                            title={iconName}
                                        >
                                           <DynamicIcon name={iconName} className="w-6 h-6" />
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Selected: {formData.icon}</p>
                            </div>
                            
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    {editingTreatment ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTreatments;
