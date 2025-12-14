import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getDoctors, getAvailableDates, getTimeSlots, bookAppointment, getProfile } from '../api';
import { useAuth } from '../contexts/AuthContext';
import BackButton from '../components/ui/BackButton';
// import '../BookAppointment.css'; // REMOVED: Using new Tailwind components

// New Components
import DoctorSelector from '../components/booking/DoctorSelector';
import AppointmentCalendar from '../components/booking/AppointmentCalendar';
import TimeSelector from '../components/booking/TimeSelector';
import TimeSlotModal from '../components/booking/TimeSlotModal';
import SuccessModal from '../components/booking/SuccessModal';
import NoteSection from '../components/booking/NoteSection';
import AppointmentForm from '../components/booking/AppointmentForm';

const BookAppointment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, openLoginModal } = useAuth();
  
  // Data States
  const [doctors, setDoctors] = useState([]);
  const [availableDates, setAvailableDates] = useState([]); // ISO strings "YYYY-MM-DD"
  const [timeSlots, setTimeSlots] = useState([]);
  
  // Selection States - with sessionStorage persistence
  const [selectedDoctor, setSelectedDoctor] = useState(() => {
    const saved = sessionStorage.getItem('bookingDoctor');
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedDate, setSelectedDate] = useState(() => {
    const saved = sessionStorage.getItem('bookingDate');
    return saved ? new Date(saved) : null;
  });
  const [selectedTime, setSelectedTime] = useState(() => {
    const saved = sessionStorage.getItem('bookingTime');
    return saved ? JSON.parse(saved) : null;
  });
  const [notes, setNotes] = useState(() => {
    return sessionStorage.getItem('bookingNotes') || '';
  });
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(''); // Just a string for error passing mostly, or success via alert/toast ideally
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [validationWarning, setValidationWarning] = useState('');

  // Removed login verification - guests can now browse freely

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
    sessionStorage.setItem('bookingDoctor', JSON.stringify(doctor));
    
    setSelectedDate(null);
    setSelectedTime(null);
    sessionStorage.removeItem('bookingDate');
    sessionStorage.removeItem('bookingTime');
    
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
    sessionStorage.setItem('bookingDate', date.toISOString());
    
    setSelectedTime(null);
    sessionStorage.removeItem('bookingTime');
    
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
        const offset = date.getTimezoneOffset() * 60000;
        const dateLocal = new Date(date.getTime() - offset);
        const dateStr = dateLocal.toISOString().split('T')[0];

      const slots = await getTimeSlots(selectedDoctor.id, dateStr);
      setTimeSlots(slots);
      
      // Auto-open modal when time slots are loaded
      if (slots && slots.length > 0) {
        setIsModalOpen(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = (slot) => {
    if (slot.isAvailable) {
      setSelectedTime(slot);
      sessionStorage.setItem('bookingTime', JSON.stringify(slot));
    }
  };

  const handleNotesChange = (value) => {
    setNotes(value);
    sessionStorage.setItem('bookingNotes', value);
  };

  const validateBooking = () => {
    if (!selectedDoctor) {
      setValidationWarning('Please select a doctor first');
      return false;
    }
    if (!selectedDate) {
      setValidationWarning('Please select a date');
      return false;
    }
    if (!selectedTime) {
      setValidationWarning('Please select a time slot');
      return false;
    }
    setValidationWarning('');
    return true;
  };

  const onBook = async () => {
    // Check if user is logged in - open login modal for guests
    if (!user) {
      openLoginModal(location.pathname);
      return;
    }

    if (!validateBooking()) {
      return;
    }

    setLoading(true);
    setError('');
    setValidationWarning('');

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
      
      // Success - show modal
      setSuccessMessage(result.message || 'Appointment booked successfully!');
      setSuccessModalOpen(true);
      
      // Clear sessionStorage after successful booking
      sessionStorage.removeItem('bookingDoctor');
      sessionStorage.removeItem('bookingDate');
      sessionStorage.removeItem('bookingTime');
      sessionStorage.removeItem('bookingNotes');
      
      // Reset state
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
        <BackButton />
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

        {/* Step 3: Time Slot Modal */}
        <TimeSlotModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          timeSlots={timeSlots}
          value={selectedTime}
          onChange={handleTimeChange}
          disabled={loading}
          loading={loading}
        />

        {/* Success Modal */}
        <SuccessModal
          isOpen={successModalOpen}
          onClose={() => setSuccessModalOpen(false)}
          message={successMessage}
          title="Booking Confirmed!"
        />

        {/* Selected Time Display */}
        {selectedTime && (
          <section>
            <div className="rounded-lg border border-gray-200 dark:border-muted-dark bg-white dark:bg-secondary-dark p-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Selected Time</h3>
              <p className="text-lg font-semibold text-primary-light dark:text-primary-dark">
                {selectedTime.displayTime}
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-sm text-primary-light dark:text-primary-dark hover:underline mt-2"
              >
                Change time slot
              </button>
            </div>
          </section>
        )}

        {/* Step 4: Notes */}
        {selectedDoctor && selectedDate && (
            <section>
                <div className="mt-6">
                    <NoteSection value={notes} onChange={handleNotesChange} />
                </div>
            </section>
        )}

        {/* Booking Button - Now visible to all users */}
        <section>
            <div className="mt-6">
              {/* Validation Warning */}
              {validationWarning && (
                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-800 dark:text-yellow-400">
                  {validationWarning}
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Booking Summary Card */}
              <div className="rounded-xl border border-gray-200 dark:border-muted-dark bg-white dark:bg-secondary-dark shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-muted-dark">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">Booking Summary</h3>
                </div>
                <div className="px-4 py-4 space-y-3">
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Doctor:</span>{' '}
                      {selectedDoctor?.fullName || selectedDoctor?.name || '-'}{' '}
                      {selectedDoctor?.specialization ? `(${selectedDoctor.specialization})` : ''}
                    </li>
                    <li>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Date:</span>{' '}
                      {selectedDate ? new Date(selectedDate).toLocaleDateString() : '-'}
                    </li>
                    <li>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Time:</span>{' '}
                      {selectedTime?.displayTime || '-'}
                    </li>
                  </ul>
                  
                  <button
                    onClick={() => {
                      if (validateBooking()) {
                        onBook();
                      }
                    }}
                    disabled={loading}
                    className={`w-full px-4 py-3 rounded-lg font-semibold text-white transition-all ${
                      loading
                        ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                        : 'bg-primary-light dark:bg-primary-dark hover:opacity-90 hover:shadow-lg'
                    }`}
                  >
                    {loading ? 'Booking...' : 'Book Appointment'}
                  </button>
                  
                  <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                    You will receive a confirmation once your appointment is booked.
                  </div>
                </div>
              </div>
            </div>
          </section>

      </main>
    </div>
  );
};

export default BookAppointment;
