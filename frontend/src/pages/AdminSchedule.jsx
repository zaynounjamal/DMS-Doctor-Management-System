
import React, { useState, useEffect } from 'react';
import { getHolidays, createHoliday, deleteHoliday } from '../adminApi';
import { useToast } from '../contexts/ToastContext';
import { Calendar, Trash2, Plus, Info } from 'lucide-react';

const AdminSchedule = () => {
    const { showToast } = useToast();
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
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
            // Sort by date usually handled by API, but ensured here
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
            showToast('Holiday created successfully', 'success');
            setNewHoliday({ date: '', name: '', isRecurring: false });
            loadHolidays();
        } catch (error) {
            showToast('Failed to create holiday', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this holiday?')) return;
        try {
            await deleteHoliday(id);
            setHolidays(holidays.filter(h => h.id !== id));
            showToast('Holiday deleted', 'success');
        } catch (error) {
            showToast('Failed to delete holiday', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="text-indigo-600" />
                Clinic Schedule & Holidays
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Form Section */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Holiday</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Holiday Name</label>
                                <input
                                    type="text" required
                                    value={newHoliday.name}
                                    onChange={e => setNewHoliday({...newHoliday, name: e.target.value})}
                                    placeholder="e.g. New Year's Day"
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date" required
                                    value={newHoliday.date}
                                    onChange={e => setNewHoliday({...newHoliday, date: e.target.value})}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isRecurring"
                                    checked={newHoliday.isRecurring}
                                    onChange={e => setNewHoliday({...newHoliday, isRecurring: e.target.checked})}
                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="isRecurring" className="text-sm text-gray-700">Recurring (Every Year)</label>
                            </div>
                            
                            <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                                <Info className="w-4 h-4 flex-shrink-0" />
                                <span>Recurring holidays will block appointments on this day every year.</span>
                            </div>

                            <button
                                type="submit"
                                className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Holiday
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Section */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-700">Upcoming Holidays</h3>
                            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                                {holidays.length} configured
                            </span>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                    <tr>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Occasion</th>
                                        <th className="px-6 py-3">Type</th>
                                        <th className="px-6 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr><td colSpan="4" className="p-8 text-center text-gray-500">Loading...</td></tr>
                                    ) : holidays.length === 0 ? (
                                        <tr><td colSpan="4" className="p-8 text-center text-gray-500">No holidays scheduled.</td></tr>
                                    ) : (
                                        holidays.map(holiday => (
                                            <tr key={holiday.id} className="hover:bg-gray-50/50">
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {new Date(holiday.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: holiday.isRecurring ? undefined : 'numeric' })}
                                                    {holiday.isRecurring && <span className="text-gray-400 text-xs ml-1">(Annual)</span>}
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">{holiday.name}</td>
                                                <td className="px-6 py-4">
                                                    {holiday.isRecurring ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">Recurring</span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">One-time</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDelete(holiday.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Holiday"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSchedule;
