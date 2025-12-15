import React, { useState } from 'react';
import { searchPatients, deletePatient, createPatient, editPatient } from '../../secretaryApi';
import { useToast } from '../../contexts/ToastContext';
import PatientForm from './PatientForm';

const PatientManager = () => {
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const data = await searchPatients(query);
      setPatients(data);
      if (data.length === 0) {
        showToast('No patients found', 'info');
      }
    } catch (error) {
      showToast('Search failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this patient?')) return;
    try {
      await deletePatient(id);
      setPatients(patients.filter(p => p.id !== id));
      showToast('Patient deactivated successfully', 'success');
    } catch (error) {
      showToast('Failed to delete patient', 'error');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (selectedPatient) {
        await editPatient(selectedPatient.id, formData);
        showToast('Patient updated successfully!', 'success');
      } else {
        await createPatient(formData);
        showToast('Patient created successfully!', 'success');
      }
      setShowForm(false);
      setSelectedPatient(null);
      if (query) handleSearch({ preventDefault: () => {} });
    } catch (error) {
      showToast(error.message || 'Operation failed', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md w-full">
          <input
            type="text"
            placeholder="Search by Name or Phone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 rounded-md border text-sm border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
          >
            Search
          </button>
        </form>
        <button
          onClick={() => { setSelectedPatient(null); setShowForm(true); }}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
        >
          + Add New Patient
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Searching...</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
           <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No patients found. Search to see results.
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {patient.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                       <button
                         onClick={() => { setSelectedPatient(patient); setShowForm(true); }}
                         className="text-indigo-600 hover:text-indigo-900"
                       >
                         Edit
                       </button>
                       <button
                         onClick={() => handleDelete(patient.id)}
                         className="text-red-600 hover:text-red-900"
                       >
                         Delete
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <PatientForm
            patient={selectedPatient}
            onSubmit={handleFormSubmit}
            onCancel={() => { setShowForm(false); setSelectedPatient(null); }}
          />
        </div>
      )}
    </div>
  );
};

export default PatientManager;
