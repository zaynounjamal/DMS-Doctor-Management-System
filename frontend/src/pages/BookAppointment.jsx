import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctors, getAvailableDates, getTimeSlots, bookAppointment, getProfile } from '../api';
import { useAuth } from '../contexts/AuthContext';
// import '../BookAppointment.css'; // REMOVED: Using new Tailwind components

// New Components
import DoctorSelector from '../components/booking/DoctorSelector';
import AppointmentCalendar from '../components/booking/AppointmentCalendar';
import TimeSelector from '../components/booking/TimeSelector';
import NoteSection from '../components/booking/NoteSection';
import AppointmentForm from '../components/booking/AppointmentForm';

const BookAppointment = () => {
  const navigate = useNavigate();
  const { user, openLoginModal } = useAuth();
  
  // Data States
  const [doctors, setDoctors] = useState([]);
  const [availableDates, setAvailableDates] = useState([]); // ISO strings "YYYY-MM-DD"
  const [timeSlots, setTimeSlots] = useState([]);
  
  // Selection States
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null); // Date object
  const [selectedTime, setSelectedTime] = useState(null); // Slot object
  const [notes, setNotes] = useState('');
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(''); // Just a string for error passing mostly, or success via alert/toast ideally
  const [error, setError] = useState('');

  // Check if user is logged in
  useEffect(() => {
    const verifyLogin = async () => {
        try {
            // Requirement: Call existing backend controller to verify status
            await getProfile();
        } catch (error) {
            // Not logged in or token invalid
            alert("You need to log in first.");
            openLoginModal();
            navigate('/');
        }
    };
    verifyLogin();
  }, []);

  // Load doctors on mount
  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
        setLoading(true);
      const data = await getDoctors();
      setDoctors(data);
      if (data.length > 0) {
        // Optional: Pre-select first doctor? Or let user choose.
        // selectDoctor(data[0]); 
      }
    } catch (err) {
      setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleDoctorChange = async (doctorId) => {
    const id = parseInt(doctorId);
    const doctor = doctors.find(d => d.id === id);
    if (!doctor) return;

    setSelectedDoctor(doctor);
    setSelectedDate(null);
    setSelectedTime(null);
    setTimeSlots([]);
    setAvailableDates([]);
    setError('');
    
    setLoading(true);
    try {
      const dates = await getAvailableDates(doctor.id);
      setAvailableDates(dates || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = async (date) => {
    if (!selectedDoctor || !date) return;
    
    setSelectedDate(date);
    setSelectedTime(null);
    setLoading(true);
    setError('');

    try {
        // API expects YYYY-MM-DD probably, but check existing logic. 
        // Existing logic: await getTimeSlots(selectedDoctor.id, date);
        // Date passed was string from map loop: `2024-05-20`
        // But here `date` is Date object.
        // Let's modify getTimeSlots call to format the date if needed. 
        // Or if getTimeSlots handles Date object. 
        // Checking previous file: `const date = ... string ...; handleDateClick(date)`
        // So previous logic passed a STRING "YYYY-MM-DD".
        // The API function probably expects valid date input.
        
        // Let's format it to "YYYY-MM-DD" just to be safe and match previous behavior.
        // const dateStr = date.toISOString().split('T')[0]; 
        // Use local date string to avoid timezone shifts if possible, or simple ISO slice.
        const offset = date.getTimezoneOffset()
        const dateLocal = new Date(date.getTime() - (offset*60*1000))
        const dateStr = dateLocal.toISOString().split('T')[0]

      const slots = await getTimeSlots(selectedDoctor.id, dateStr);
      setTimeSlots(slots);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = (slot) => {
    if (slot.isAvailable) {
      setSelectedTime(slot);
    }
  };

  const onBook = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedDoctor || !selectedDate || !selectedTime) {
      setError('Please complete all selection steps.');
      return;
    }

    setLoading(true);
    setError('');

    try {
        const offset = selectedDate.getTimezoneOffset()
        const dateLocal = new Date(selectedDate.getTime() - (offset*60*1000))
        const dateStr = dateLocal.toISOString().split('T')[0]

      const appointmentData = {
        doctorId: selectedDoctor.id,
        appointmentDate: dateStr, // Send string as expected by backend likely
        appointmentTime: selectedTime.time,
        notes: notes || null
      };

      const result = await bookAppointment(appointmentData);
      
      // Success
      alert(result.message || 'Appointment booked successfully!');
      
      // Reset
      setSelectedDoctor(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setTimeSlots([]);
      setNotes('');
      setAvailableDates([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 p-4 md:p-8">
      <main className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-6">Book Your Visit</h1>
        
        {/* Step 1: Doctor */}
        <section>
             <h2 className="text-xl font-semibold mb-3">Step 1: Select Doctor</h2>
             <DoctorSelector 
                doctors={doctors}
                value={selectedDoctor?.id}
                onChange={handleDoctorChange}
                loading={loading}
                error={error}
             />
        </section>

        {/* Step 2: Date */}
        {selectedDoctor && (
        <section>
            <h2 className="text-xl font-semibold mb-3">Step 2: Choose Date</h2>
            <AppointmentCalendar
                selectedDate={selectedDate}
                onChange={handleDateChange}
                availableDates={availableDates}
                disabled={loading}
            />
        </section>
        )}

        {/* Step 3: Time */}
        {selectedDate && (
             <section>
                 <div className="mt-6">
                    <TimeSelector
                        timeSlots={timeSlots}
                        value={selectedTime}
                        onChange={handleTimeChange}
                        disabled={loading}
                    />
                    {timeSlots.length === 0 && !loading && (
                        <p className="text-gray-500 text-sm mt-2">No available time slots for this date.</p>
                    )}
                 </div>
             </section>
        )}

        {/* Step 4: Notes */}
        {selectedTime && (
            <section>
                <div className="mt-6">
                    <NoteSection value={notes} onChange={setNotes} />
                </div>
            </section>
        )}

        {/* Step 5: Summary & Submit */}
        {selectedTime && (
            <section>
                <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-3">Step 5: Confirm Booking</h2>
                    <AppointmentForm
                        doctor={selectedDoctor}
                        date={selectedDate}
                        time={selectedTime}
                        onSubmit={onBook}
                        loading={loading}
                        error={error}
                    />
                </div>
            </section>
        )}

      </main>
    </div>
  );
};

export default BookAppointment;
