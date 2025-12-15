import React, { useState, useEffect } from 'react';

const PatientForm = ({ patient, onSubmit, onCancel, isQuickAdd = false }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    username: '',
    password: '', // Only for creation
    gender: '',
    birthDate: ''
  });

  useEffect(() => {
    if (patient) {
      setFormData({
        fullName: patient.fullName || '',
        phone: patient.phone || '',
        username: patient.username || '', // Need to ensure backend sends this
        password: '', // Don't show password
        gender: patient.gender || '',
        birthDate: patient.birthDate || ''
      });
    }
  }, [patient]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-auto">
      <h3 className="text-xl font-bold mb-4">
        {patient ? 'Edit Patient' : isQuickAdd ? 'Quick Add Patient' : 'Add New Patient'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            name="fullName"
            required
            value={formData.fullName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border text-sm border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border text-sm border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            name="username"
            required
            value={formData.username}
            onChange={handleChange}
            // ReadOnly during edit if we don't want to allow username change or handle it carefully
            // allowing change for now as per req
             className="mt-1 block w-full rounded-md border text-sm border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {!patient && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              required={!patient}
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border text-sm border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        )}

        {!isQuickAdd && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                 name="gender"
                 value={formData.gender}
                 onChange={handleChange}
                 className="mt-1 block w-full rounded-md border text-sm border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Birth Date</label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border text-sm border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 text-sm"
          >
            {patient ? 'Update Patient' : 'Create Patient'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;
