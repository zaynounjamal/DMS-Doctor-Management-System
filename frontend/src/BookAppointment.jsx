import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctors, getAvailableDates, getTimeSlots, bookAppointment } from './api';
import './BookAppointment.css';

const BookAppointment = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Check if user is logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing user:', error);
      }
    }
  }, []);

  // Load doctors on mount
  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const data = await getDoctors();
      setDoctors(data);
      // Select first doctor by default if available
      if (data.length > 0) {
        await selectDoctor(data[0]);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  // Helper to handle doctor selection
  const selectDoctor = async (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate(null);
    setSelectedTime(null);
    setTimeSlots([]);
    setMessage({ type: '', text: '' });

    if (doctor) {
      setLoading(true);
      try {
        const dates = await getAvailableDates(doctor.id);
        setAvailableDates(dates);
      } catch (error) {
        setMessage({ type: 'error', text: error.message });
      } finally {
        setLoading(false);
      }
    } else {
      setAvailableDates([]);
    }
  };

  // Handle doctor dropdown change
  const handleDoctorChange = (e) => {
    const doctorId = parseInt(e.target.value);
    const doctor = doctors.find(d => d.id === doctorId);
    selectDoctor(doctor);
  };

  // Load time slots when date is selected
  const handleDateClick = async (date) => {
    if (!selectedDoctor) return;
    
    setSelectedDate(date);
    setSelectedTime(null);
    setLoading(true);

    try {
      const slots = await getTimeSlots(selectedDoctor.id, date);
      setTimeSlots(slots);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Handle time slot selection
  const handleTimeSelect = (slot) => {
    if (slot.isAvailable) {
      setSelectedTime(slot);
    }
  };

  // Book appointment
  const handleBookAppointment = async () => {
    // Check if user is logged in
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedDoctor || !selectedDate || !selectedTime) {
      setMessage({ type: 'error', text: 'Please select doctor, date, and time' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const appointmentData = {
        doctorId: selectedDoctor.id,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime.time,
        notes: notes || null
      };

      const result = await bookAppointment(appointmentData);
      setMessage({ type: 'success', text: result.message || 'Appointment booked successfully!' });
      
      // Reset form
      setSelectedDoctor(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setTimeSlots([]);
      setNotes('');
      setAvailableDates([]);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Calendar rendering
  const renderCalendar = () => {
    if (!selectedDoctor || availableDates.length === 0) {
      return <p className="calendar-placeholder">Select a doctor to view available dates</p>;
    }

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isAvailable = availableDates.includes(date);
      const isSelected = selectedDate === date;

      days.push(
        <div
          key={day}
          className={`calendar-day ${isAvailable ? 'available' : 'unavailable'} ${isSelected ? 'selected' : ''}`}
          onClick={() => isAvailable && handleDateClick(date)}
        >
          {day}
        </div>
      );
    }

    return (
      <div className="calendar">
        <div className="calendar-header">
          <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}>‹</button>
          <h3>{firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
          <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}>›</button>
        </div>
        <div className="calendar-weekdays">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        <div className="calendar-days">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="book-appointment-container">
      <h2>Book an Appointment</h2>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Doctor Selection */}
      <div className="form-section">
        <label>Select Doctor</label>
        <select 
          value={selectedDoctor?.id || ''} 
          onChange={handleDoctorChange}
          disabled={loading}
        >
          <option value="">-- Choose a doctor --</option>
          {doctors.map(doctor => (
            <option key={doctor.id} value={doctor.id}>
              {doctor.fullName} - {doctor.specialization}
            </option>
          ))}
        </select>
      </div>

      {/* Calendar */}
      {selectedDoctor && (
        <div className="form-section">
          <label>Select Date</label>
          {renderCalendar()}
        </div>
      )}

      {/* Time Slots */}
      {selectedDate && timeSlots.length > 0 && (
        <div className="form-section">
          <label>Select Time</label>
          <div className="time-slots-grid">
            {timeSlots.map((slot, index) => (
              <button
                key={index}
                className={`time-slot ${slot.isAvailable ? 'available' : 'reserved'} ${selectedTime?.time === slot.time ? 'selected' : ''}`}
                onClick={() => handleTimeSelect(slot)}
                disabled={!slot.isAvailable}
              >
                {slot.displayTime}
              </button>
            ))}
          </div>
          <div className="legend">
            <span className="legend-item"><span className="color-box available"></span> Available</span>
            <span className="legend-item"><span className="color-box reserved"></span> Reserved</span>
          </div>
        </div>
      )}

      {/* Notes */}
      {selectedTime && (
        <div className="form-section">
          <label>Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes or special requests..."
            maxLength={500}
            rows={4}
          />
          <small>{notes.length}/500 characters</small>
        </div>
      )}

      {/* Booking Summary */}
      {selectedDoctor && selectedDate && selectedTime && (
        <div className="booking-summary">
          <h3>Booking Summary</h3>
          <p><strong>Doctor:</strong> {selectedDoctor.fullName} ({selectedDoctor.specialization})</p>
          <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p><strong>Time:</strong> {selectedTime.displayTime}</p>
        </div>
      )}

      {/* Book Button */}
      <button
        className="book-button"
        onClick={handleBookAppointment}
        disabled={!selectedDoctor || !selectedDate || !selectedTime || loading}
      >
        {loading ? 'Booking...' : 'Book Appointment'}
      </button>
    </div>
  );
};

export default BookAppointment;
