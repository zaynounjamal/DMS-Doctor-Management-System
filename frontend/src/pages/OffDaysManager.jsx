import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Trash2, Plus, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { getOffDays, addOffDay, deleteOffDay } from '../doctorApi';

const OffDaysManager = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  
  const [offDays, setOffDays] = useState([]);
  const [newDate, setNewDate] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [deleteId, setDeleteId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchOffDays();
  }, []);

  const fetchOffDays = async () => {
    try {
      const data = await getOffDays();
      setOffDays(data);
    } catch (error) {
      console.error('Error fetching off days:', error);
      toastError('Failed to load off days');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOffDay = async (e) => {
    e.preventDefault();
    if (!newDate) return;

    try {
      const response = await addOffDay(newDate, "Manual Entry");
      setOffDays([...offDays, response.offDay]);
      setNewDate('');
      success('Off day added successfully!');
    } catch (error) {
      console.error('Error adding off day:', error);
      toastError(error.response?.data?.message || 'Failed to add off day');
    }
  };

  const promptDelete = (id) => {
    setDeleteId(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      await deleteOffDay(deleteId);
      setOffDays(offDays.filter(day => day.id !== deleteId));
      success('Off day removed successfully');
    } catch (error) {
      console.error('Error deleting off day:', error);
      toastError('Failed to delete off day');
    } finally {
      setIsModalOpen(false);
      setDeleteId(null);
    }
  };

  return (
    <div className={`space-y-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400">Off Days Manager</h1>
          <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Manage your unavailable dates and holidays
          </p>
        </div>
      </div>

      {/* Add New Off Day Card */}
      <div className={`p-6 rounded-xl border shadow-sm ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus size={20} className="text-purple-500" />
          Add New Off Day
        </h2>
        
        <form onSubmit={handleAddOffDay} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="w-full sm:w-auto flex-1">
            <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Select Date
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none ${
                theme === 'dark' 
                  ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus size={18} />
            <span>Add Date</span>
          </button>
        </form>
      </div>

      {/* Off Days List */}
      <div className={`rounded-xl border shadow-sm overflow-hidden ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CalendarIcon size={20} className="text-purple-500" />
            Scheduled Off Days
          </h2>
        </div>
        
        {loading ? (
           <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : offDays.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center text-gray-500">
             <CalendarIcon size={48} className="mb-3 opacity-20" />
             <p>No off days scheduled yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {offDays.map((day) => (
              <div 
                key={day.id} 
                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                role="row"
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center 
                    ${theme === 'dark' ? 'bg-gray-700 text-purple-400' : 'bg-purple-50 text-purple-600'}
                  `}>
                    <CalendarIcon size={18} />
                  </div>
                  <div>
                    <p className={`font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                      {new Date(day.offDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => promptDelete(day.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Remove off day"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        title="Remove Off Day"
        message="Are you sure you want to remove this off day? Doctors will be able to book appointments on this date again."
        confirmText="Remove"
        onConfirm={confirmDelete}
        onCancel={() => setIsModalOpen(false)}
        type="danger"
      />
    </div>
  );
};

export default OffDaysManager;
