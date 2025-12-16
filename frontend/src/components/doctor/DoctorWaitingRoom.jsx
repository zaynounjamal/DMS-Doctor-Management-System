import React, { useState, useEffect } from 'react';
import { getDoctorWaitingRoom } from '../../api';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { User, Clock, Activity, ArrowRight } from 'lucide-react';

const DoctorWaitingRoom = () => {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWaitingRoom();
        const interval = setInterval(loadWaitingRoom, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const loadWaitingRoom = async () => {
        try {
            const data = await getDoctorWaitingRoom();
            setPatients(data);
        } catch (error) {
            console.error("Waiting room load failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartConsult = (appointmentId, patientId) => {
        // Navigate to patient details/medical notes
        navigate(`/doctor/patients/${patientId}?appointmentId=${appointmentId}`);
    };

    if (loading && patients.length === 0) {
        return <div className="p-8 text-center text-gray-500">Loading waiting room...</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50/50">
                <div className="flex items-center gap-2">
                    <Activity className="text-indigo-600" size={24} />
                    <h2 className="text-xl font-bold text-gray-900">Waiting Room</h2>
                </div>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wide">
                    {patients.length} Waiting
                </span>
            </div>

            {patients.length === 0 ? (
                <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="text-gray-300" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No patients waiting</h3>
                    <p className="text-gray-500 mt-1">Checked-in patients will appear here.</p>
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {patients.map((patient) => (
                        <div key={patient.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shrink-0">
                                    {patient.patientName.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{patient.patientName}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                        <div className="flex items-center gap-1">
                                            <Clock size={14} />
                                            <span>{patient.appointmentTime}</span>
                                        </div>
                                        <span className="capitalize">{patient.gender || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => handleStartConsult(patient.id, patient.patientId)}
                                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-all font-medium shadow-sm hover:shadow"
                            >
                                Start Consult
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DoctorWaitingRoom;
