
import React, { useState, useEffect } from 'react';
import { getPatientsAdmin } from '../adminApi';
import { useToast } from '../contexts/ToastContext';
import { Users, Search, Phone, Calendar } from 'lucide-react';

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

    const filteredPatients = patients.filter(p => 
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone.includes(searchTerm) ||
        p.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="text-indigo-600" />
                Patient Database
            </h2>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by name, phone, or username..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold tracking-wider">
                                <th className="px-6 py-4">Patient</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Birth Date</th>
                                <th className="px-6 py-4">Registered</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading patients...</td></tr>
                            ) : filteredPatients.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-500">No patients found.</td></tr>
                            ) : (
                                filteredPatients.map(patient => (
                                    <tr key={patient.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-gray-900">{patient.fullName}</div>
                                                <div className="text-xs text-gray-500">@{patient.username}</div>
                                                <div className="text-xs text-gray-400 capitalize">{patient.gender}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone className="w-3 h-3 text-gray-400" />
                                                {patient.phone}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(patient.birthDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(patient.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                patient.isActive 
                                                    ? 'bg-emerald-50 text-emerald-700' 
                                                    : 'bg-red-50 text-red-700'
                                            }`}>
                                                {patient.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPatients;
