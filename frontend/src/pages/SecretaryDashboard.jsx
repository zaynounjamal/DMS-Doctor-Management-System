import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSecretaryDashboard, getDoctorAvailability, createAppointment, searchPatients, createPatient, getSecretaryAppointments, updateAppointmentStatus, getDoctors } from '../secretaryApi';
import { useToast } from '../contexts/ToastContext';
import SecretaryHeader from '../components/secretary/SecretaryHeader';
import WaitingRoom from '../components/secretary/WaitingRoom';
import AppointmentManager from '../components/secretary/AppointmentManager';
import PatientManager from '../components/secretary/PatientManager';
import PatientForm from '../components/secretary/PatientForm';
import StatCard from '../components/StatCard';

const SecretaryDashboard = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [offDays, setOffDays] = useState([]);
    const [showWalkInModal, setShowWalkInModal] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(''); // '' means all doctors

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (doctors.length > 0) {
            loadDashboard();
        }
    }, [selectedDoctor]);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const doctorsList = await getDoctors();
            setDoctors(doctorsList);
            await loadDashboard();
        } catch (error) {
            console.error('Failed to load initial data', error);
            showToast('Failed to load dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadDashboard = async () => {
        try {
            const doctorId = selectedDoctor || null;
            const data = await getSecretaryDashboard(doctorId);
            setStats(data);
            const availability = await getDoctorAvailability(doctorId);
            setOffDays(availability);
        } catch (error) {
            console.error('Failed to load dashboard', error);
            showToast('Failed to refresh dashboard', 'error');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <SecretaryHeader 
                selectedDoctor={selectedDoctor}
                onDoctorChange={setSelectedDoctor}
                doctors={doctors}
            />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {selectedDoctor ? `Dr. ${doctors.find(d => d.id == selectedDoctor)?.fullName}'s Dashboard` : 'All Doctors Dashboard'}
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">Manage patients, appointments, and payments.</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex space-x-3">
                        <button
                            onClick={() => setShowWalkInModal(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                        >
                            + Walk-In Appointment
                        </button>
                        <button
                            onClick={() => loadDashboard()}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard 
                        title="Daily Cash" 
                        value={`$${stats?.dailyCash || 0}`} 
                        subtitle="Collected Today"
                        icon="💵"
                        color="#10b981"
                    />
                    <StatCard 
                        title="Today's Appts" 
                        value={stats?.todayAppointments || 0} 
                        subtitle="Expected"
                        icon="📅"
                        color="#3b82f6"
                    />
                    <StatCard 
                        title="Tomorrow" 
                        value={stats?.tomorrowAppointments || 0} 
                        subtitle="Scheduled"
                        icon="📆"
                        color="#8b5cf6"
                    />
                    <StatCard 
                        title="Waiting Room" 
                        value={stats?.waitingCount || 0} 
                        subtitle="Checked In"
                        icon="⏳"
                        color="#f59e0b"
                    />
                </div>

                {/* Main Content Tabs */}
                <div className="bg-white shadow rounded-lg min-h-[500px]">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`${activeTab === 'overview' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Overview & Waiting Room
                            </button>
                            <button
                                onClick={() => setActiveTab('appointments')}
                                className={`${activeTab === 'appointments' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Appointment Management
                            </button>
                            <button
                                onClick={() => setActiveTab('patients')}
                                className={`${activeTab === 'patients' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Patient Management
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Waiting Room (Checked In)</h3>
                                    <WaitingRoomLoader selectedDoctor={selectedDoctor} />
                                </div>
                                
                                <div>
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                        {selectedDoctor ? `Dr. ${doctors.find(d => d.id == selectedDoctor)?.fullName}'s Off Days` : "Doctors' Off Days"}
                                    </h3>
                                    {offDays.length === 0 ? (
                                        <p className="text-gray-500">No upcoming off days.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {offDays.map((day, idx) => (
                                                <div key={idx} className="bg-red-50 p-4 rounded border border-red-100 text-red-700">
                                                    <div className="font-bold">{day.date}</div>
                                                    <div className="text-sm">{day.reason}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'appointments' && <AppointmentManager selectedDoctor={selectedDoctor} />}
                        
                        {activeTab === 'patients' && <PatientManager />}
                    </div>
                </div>

                {/* Walk In Modal */}
                {showWalkInModal && (
                    <WalkInModal 
                        onClose={() => setShowWalkInModal(false)} 
                        doctors={doctors}
                        defaultDoctor={selectedDoctor}
                    />
                )}
            </div>
        </div>
    );
};

// Helper to load waiting room data
const WaitingRoomLoader = ({ selectedDoctor }) => {
    const [appointments, setAppointments] = useState([]);
    const { showToast } = useToast();
    
    const fetchWaiting = async () => {
         try {
            const data = await getSecretaryAppointments('today', 'waiting', selectedDoctor || null);
            setAppointments(data);
         } catch(e) { 
             console.error(e);
             showToast('Failed to load waiting room', 'error');
         }
    };

    useEffect(() => {
        fetchWaiting();
    }, [selectedDoctor]);

    const handleUpdate = async (id, status, reason) => {
        try {
            await updateAppointmentStatus(id, status, reason);
            showToast(`Patient ${status === 'scheduled' ? 'removed from' : 'marked as'} ${status}`, 'success');
            fetchWaiting();
        } catch(e) { 
            showToast(e.message || 'Failed to update status', 'error');
        }
    };

    return <WaitingRoom appointments={appointments} onUpdateStatus={handleUpdate} />;
};

// Walk In Modal Component
const WalkInModal = ({ onClose, doctors, defaultDoctor }) => {
    const { showToast } = useToast();
    const [step, setStep] = useState(1);
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(defaultDoctor || (doctors.length > 0 ? doctors[0].id : ''));
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('');
    const [price, setPrice] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const results = await searchPatients(query);
            setSearchResults(results);
            if (results.length === 0) {
                showToast('No patients found', 'info');
            }
        } catch(e) { 
            showToast('Search failed', 'error');
        }
    };

    const handleCreateAppt = async (e) => {
        e.preventDefault();
        if (!selectedDoctor) {
            showToast('Please select a doctor', 'warning');
            return;
        }
        try {
            await createAppointment(selectedDoctor, selectedPatient.id, date, time, price ? parseFloat(price) : null);
            showToast('Appointment scheduled successfully!', 'success');
            onClose();
            window.location.reload();
        } catch(e) { 
            showToast(e.message || 'Failed to create appointment', 'error');
        }
    };

    const handleCreatePatient = async (formData) => {
        try {
             const res = await createPatient(formData);
             setSelectedPatient({ ...formData, id: res.patientId }); 
             showToast('Patient created successfully!', 'success');
             setStep(2);
        } catch(e) { 
            showToast(e.message || 'Failed to create patient', 'error');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">
                        {step === 3 ? 'New Patient' : 'Walk-In Appointment'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                
                {step === 1 && (
                    <div className="space-y-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <input 
                                className="flex-1 border p-2 rounded" 
                                placeholder="Search Patient..." 
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                autoFocus
                            />
                            <button type="submit" className="bg-blue-600 text-white px-4 rounded">Search</button>
                        </form>
                        <div className="max-h-60 overflow-y-auto border rounded divide-y">
                            {searchResults.map(p => (
                                <div key={p.id} className="p-2 hover:bg-gray-50 cursor-pointer flex justify-between"
                                     onClick={() => { setSelectedPatient(p); setStep(2); }}>
                                    <span>{p.fullName}</span>
                                    <span className="text-gray-500 text-sm">{p.phone}</span>
                                </div>
                            ))}
                            {searchResults.length === 0 && query && <div className="p-2 text-gray-500">No results found.</div>}
                        </div>
                        <div className="text-center pt-2 border-t">
                            <p className="text-sm text-gray-500 mb-2">New patient?</p>
                            <button type="button" onClick={() => setStep(3)} className="text-indigo-600 font-medium hover:underline">
                                + Create New Patient
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && selectedPatient && (
                    <form onSubmit={handleCreateAppt} className="space-y-4">
                        <div className="bg-blue-50 p-3 rounded flex justify-between items-center">
                            <span className="font-bold">{selectedPatient.fullName}</span>
                            <button type="button" onClick={() => setStep(1)} className="text-xs text-blue-600">Change</button>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Doctor</label>
                            <select 
                                value={selectedDoctor} 
                                onChange={e => setSelectedDoctor(parseInt(e.target.value))}
                                className="w-full border p-2 rounded"
                                required
                            >
                                {doctors.map(doc => (
                                    <option key={doc.id} value={doc.id}>
                                        {doc.fullName} - {doc.specialty}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm">Date</label>
                            <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm">Time</label>
                            <input type="time" required value={time} onChange={e => setTime(e.target.value)} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm">Price (Optional)</label>
                            <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full border p-2 rounded" placeholder="Default" />
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <button type="button" onClick={() => setStep(1)} className="text-gray-600 px-4 py-2">Back</button>
                            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Book</button>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <div className="space-y-4">
                         <PatientForm 
                            onCancel={() => setStep(1)}
                            onSubmit={handleCreatePatient}
                            isQuickAdd={true}
                         />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SecretaryDashboard;
