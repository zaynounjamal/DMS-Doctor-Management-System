import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSecretaryAppointments, getDoctors } from '../secretaryApi';
import { useToast } from '../contexts/ToastContext';
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Phone, Printer } from 'lucide-react';

const DailySchedule = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const formatLocalDate = (date) => {
        const d = new Date(date);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const [selectedDate, setSelectedDate] = useState(formatLocalDate(new Date()));
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [loading, setLoading] = useState(true);

    // Time slots from 8 AM to 8 PM
    const timeSlots = Array.from({ length: 13 }, (_, i) => {
        const hour = i + 8;
        return `${hour.toString().padStart(2, '0')}:00`;
    });

    useEffect(() => {
        loadDoctors();
    }, []);

    useEffect(() => {
        loadAppointments();
    }, [selectedDate, selectedDoctor]);

    const loadDoctors = async () => {
        try {
            const doctorsList = await getDoctors();
            setDoctors(doctorsList);
        } catch (error) {
            showToast('Failed to load doctors', 'error');
        }
    };

    const loadAppointments = async () => {
        setLoading(true);
        try {
            // Determine tab based on selected date
            const today = formatLocalDate(new Date());
            const tomorrow = formatLocalDate(new Date(Date.now() + 24 * 60 * 60 * 1000));
            
            let tab = 'today';
            if (selectedDate === tomorrow) tab = 'tomorrow';
            else if (selectedDate > tomorrow) tab = 'future';
            else if (selectedDate < today) tab = 'past';

            const data = await getSecretaryAppointments(tab, null, selectedDoctor || null);

            const normalized = (data || []).map((appt) => {
                const id = appt?.id ?? appt?.Id;
                const appointmentDateRaw = appt?.appointmentDate ?? appt?.AppointmentDate;
                const appointmentTimeRaw = appt?.appointmentTime ?? appt?.AppointmentTime;
                const doctorId = appt?.doctorId ?? appt?.DoctorId;
                const status = appt?.status ?? appt?.Status;
                const paymentStatus = appt?.paymentStatus ?? appt?.PaymentStatus;
                const price = appt?.price ?? appt?.Price;
                const finalPrice = appt?.finalPrice ?? appt?.FinalPrice;

                const patient = appt?.patient ?? appt?.Patient;
                const patientFullName = patient?.fullName ?? patient?.FullName;
                const patientPhone = patient?.phone ?? patient?.Phone;

                // Normalize date to YYYY-MM-DD
                const datePart = (appointmentDateRaw || '').toString().substring(0, 10);
                // Normalize time to HH:mm:ss (handle TimeOnly with fractional seconds)
                let timePart = (appointmentTimeRaw || '').toString();
                timePart = timePart.split('.')[0];
                if (timePart.length === 5) timePart = `${timePart}:00`;

                return {
                    ...appt,
                    id,
                    doctorId,
                    status,
                    paymentStatus,
                    price,
                    finalPrice,
                    appointmentDate: datePart,
                    appointmentTime: timePart,
                    patient: patient
                        ? {
                            ...patient,
                            fullName: patientFullName,
                            phone: patientPhone
                        }
                        : { fullName: 'Unknown', phone: '' }
                };
            });

            // Filter by exact date (YYYY-MM-DD)
            const filtered = normalized.filter(appt => appt.appointmentDate === selectedDate);
            setAppointments(filtered);
        } catch (error) {
            showToast('Failed to load schedule', 'error');
        } finally {
            setLoading(false);
        }
    };

    const changeDate = (days) => {
        const newDate = new Date(`${selectedDate}T00:00:00`);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(formatLocalDate(newDate));
    };

    const getAppointmentForSlot = (timeSlot) => {
        return appointments.filter(appt => {
            const apptTime = (appt.appointmentTime || '').substring(0, 5);
            return apptTime === timeSlot;
        });
    };

    const getDoctorColor = (doctorId) => {
        const colors = [
            'bg-blue-100 border-blue-300 text-blue-800',
            'bg-green-100 border-green-300 text-green-800',
            'bg-purple-100 border-purple-300 text-purple-800',
            'bg-orange-100 border-orange-300 text-orange-800',
            'bg-pink-100 border-pink-300 text-pink-800',
        ];
        return colors[doctorId % colors.length];
    };

    const handlePrint = () => {
        window.print();
        showToast('Print dialog opened', 'info');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 print:mb-4">
                    <button
                        onClick={() => navigate('/secretary-dashboard')}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4 print:hidden"
                    >
                        <ChevronLeft className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </button>
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Daily Schedule</h1>
                            <p className="mt-1 text-sm text-gray-500">View appointments by day</p>
                        </div>
                        <button
                            onClick={handlePrint}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center print:hidden"
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            Print Schedule
                        </button>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-white shadow rounded-lg p-6 mb-6 print:hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Date Navigation */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => changeDate(-1)}
                                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                                onClick={() => changeDate(1)}
                                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Doctor Filter */}
                        <div>
                            <select
                                value={selectedDoctor}
                                onChange={(e) => setSelectedDoctor(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Doctors</option>
                                {doctors.map(doc => (
                                    <option key={doc.id} value={doc.id}>
                                        Dr. {doc.fullName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Quick Date Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedDate(formatLocalDate(new Date()))}
                                className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                Today
                            </button>
                            <button
                                onClick={() => setSelectedDate(formatLocalDate(new Date(Date.now() + 24 * 60 * 60 * 1000)))}
                                className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                            >
                                Tomorrow
                            </button>
                        </div>
                    </div>
                </div>

                {/* Schedule Grid */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 print:py-2">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {new Date(selectedDate).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} scheduled
                        </p>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading schedule...</div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {timeSlots.map(slot => {
                                const slotAppointments = getAppointmentForSlot(slot);
                                return (
                                    <div key={slot} className="flex hover:bg-gray-50 print:hover:bg-white">
                                        {/* Time Column */}
                                        <div className="w-24 flex-shrink-0 p-4 border-r border-gray-200 print:p-2">
                                            <div className="flex items-center text-sm font-medium text-gray-900">
                                                <Clock className="w-4 h-4 mr-2 print:hidden" />
                                                {slot}
                                            </div>
                                        </div>

                                        {/* Appointments Column */}
                                        <div className="flex-1 p-4 print:p-2">
                                            {slotAppointments.length === 0 ? (
                                                <div className="text-sm text-gray-400 italic">No appointments</div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {slotAppointments.map(appt => (
                                                        <div
                                                            key={appt.id}
                                                            className={`p-3 rounded-lg border-l-4 ${getDoctorColor(appt.doctorId)} print:p-2`}
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <User className="w-4 h-4 print:hidden" />
                                                                        <span className="font-medium">{appt.patient.fullName}</span>
                                                                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                                                                            appt.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                                                            appt.status === 'checked-in' ? 'bg-green-100 text-green-800' :
                                                                            'bg-gray-100 text-gray-800'
                                                                        }`}>
                                                                            {appt.status}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                                        <span className="flex items-center gap-1">
                                                                            <Phone className="w-3 h-3 print:hidden" />
                                                                            {appt.patient.phone}
                                                                        </span>
                                                                        <span>Dr. {doctors.find(d => d.id === appt.doctorId)?.fullName || 'Unknown'}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className={`text-sm font-medium ${
                                                                        appt.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'
                                                                    }`}>
                                                                        {appt.paymentStatus === 'paid' ? 'PAID' : 'UNPAID'}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">
                                                                        ${appt.finalPrice ?? appt.price ?? 0}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="mt-6 bg-white shadow rounded-lg p-6 print:mt-4 print:p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Doctor Color Legend</h3>
                    <div className="flex flex-wrap gap-4">
                        {doctors.slice(0, 5).map((doc, idx) => (
                            <div key={doc.id} className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded border-2 ${getDoctorColor(doc.id)}`}></div>
                                <span className="text-sm text-gray-700">Dr. {doc.fullName}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                    .print\\:hidden { display: none !important; }
                    .print\\:mb-4 { margin-bottom: 1rem !important; }
                    .print\\:py-2 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
                    .print\\:p-2 { padding: 0.5rem !important; }
                    .print\\:mt-4 { margin-top: 1rem !important; }
                    .print\\:p-4 { padding: 1rem !important; }
                    .print\\:hover\\:bg-white:hover { background-color: white !important; }
                }
            `}</style>
        </div>
    );
};

export default DailySchedule;
