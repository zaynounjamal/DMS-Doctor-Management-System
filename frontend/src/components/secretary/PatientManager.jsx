

import { searchPatients, deletePatient, createPatient, editPatient, addPatientBalance, resetPatientPassword } from '../../secretaryApi';
import { useToast } from '../../contexts/ToastContext';
import PatientForm from './PatientForm';
import { Wallet, Plus } from 'lucide-react';
import { useState } from 'react';

const PatientManager = () => {
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // Balance State
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');


  const handleSearch = async (e) => {
    e && e.preventDefault();
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

  const handleAddFunds = async (e) => {
      e.preventDefault();
      if (!balanceAmount || isNaN(balanceAmount) || Number(balanceAmount) <= 0) {
          showToast('Please enter a valid amount', 'error');
          return;
      }

      const amount = Number(balanceAmount);

      try {
          const result = await addPatientBalance(selectedPatient.id, amount);
          showToast('Funds added successfully', 'success');
          
          // Update local state immediately
          const newBalance = result.balance !== undefined ? result.balance : (selectedPatient.balance || 0) + amount;
          
          // Update selected patient
          setSelectedPatient(prev => ({ ...prev, balance: newBalance }));
          
          // Update list
          setPatients(prev => prev.map(p => 
              p.id === selectedPatient.id ? { ...p, balance: newBalance } : p
          ));

          setShowBalanceModal(false);
          setBalanceAmount('');
      } catch (error) {
          showToast(error.message, 'error');
      }
  };

  const openBalanceModal = (patient) => {
      setSelectedPatient(patient);
      setShowBalanceModal(true);
  };

  // ... (handleDelete, handleFormSubmit same as before)
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
      if (query) handleSearch(null);
      if (query) handleSearch(null);
    } catch (error) {
      showToast(error.message || 'Operation failed', 'error');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!selectedPatient || !newPassword) return;
    try {
        await resetPatientPassword(selectedPatient.id, newPassword);
        showToast('Password reset successfully', 'success');
        setShowPasswordModal(false);
        setNewPassword('');
    } catch (error) {
        showToast(error.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        {/* Search Form */}
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
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
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
                      <div className="text-xs text-gray-500">{patient.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            (patient.balance || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                            <Wallet className="w-3 h-3 mr-1" />
                            ${patient.balance || 0}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                       <button
                         onClick={() => openBalanceModal(patient)}
                         className="text-green-600 hover:text-green-900 mr-2"
                         title="Add Funds"
                       >
                         <Plus className="w-4 h-4 inline" /> Add Funds
                       </button>

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

      {/* Forms Modals */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <PatientForm
            patient={selectedPatient}
            onSubmit={handleFormSubmit}
            onCancel={() => { setShowForm(false); setSelectedPatient(null); }}
          />
        </div>
      )}

      {/* Add Balance Modal */}
      {showBalanceModal && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                  <h3 className="text-lg font-bold mb-4">Add Funds to Wallet</h3>
                  <p className="mb-4 text-sm text-gray-600">
                      Patient: <span className="font-medium text-gray-900">{selectedPatient.fullName}</span><br/>
                      Current Balance: <span className="font-medium text-green-600">${selectedPatient.balance || 0}</span>
                  </p>
                  
                  <form onSubmit={handleAddFunds}>
                      <input
                          type="number"
                          value={balanceAmount}
                          onChange={(e) => setBalanceAmount(e.target.value)}
                          placeholder="Amount (e.g., 50.00)"
                          className="w-full border rounded p-2 mb-4"
                          step="0.01"
                          min="0.01"
                          autoFocus
                      />
                      <div className="flex justify-end gap-2">
                          <button
                              type="button"
                              onClick={() => { setShowBalanceModal(false); setBalanceAmount(''); }}
                              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                          >
                              Cancel
                          </button>
                          <button
                              type="submit"
                              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                          >
                              Add Funds
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && selectedPatient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                  <h3 className="text-lg font-bold mb-4">Reset Patient Password</h3>
                  <p className="mb-4 text-sm text-gray-600">
                      Resetting password for: <span className="font-medium text-gray-900">{selectedPatient.fullName}</span>
                  </p>
                  <form onSubmit={handleResetPassword}>
                      <input
                          type="text"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="New Password"
                          className="w-full border rounded p-2 mb-4"
                          autoFocus
                      />
                      <div className="flex justify-end gap-2">
                          <button
                              type="button"
                              onClick={() => setShowPasswordModal(false)}
                              className="px-4 py-2 border rounded hover:bg-gray-100"
                          >
                              Cancel
                          </button>
                          <button
                              type="submit"
                              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                          >
                              Reset Password
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default PatientManager;

