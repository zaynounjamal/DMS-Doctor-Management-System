import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { searchAppointments, sendReminder } from '../doctorApi';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const [offDays, setOffDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load appointments (fetch all for now, or optimize by range later)
      const appointments = await searchAppointments({
        startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of year
        endDate: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0]  // End of year
      });

      // Load off days
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const offDaysResponse = await fetch('http://localhost:5024/api/offdays', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const offDaysData = await offDaysResponse.json();
      setOffDays(offDaysData);

      // Transform appointments to events
      const appointmentEvents = appointments.map(apt => ({
        id: apt.id,
        title: `${apt.patient.fullName} - ${apt.status}`,
        start: new Date(`${apt.appointmentDate}T${apt.appointmentTime}`),
        end: new Date(new Date(`${apt.appointmentDate}T${apt.appointmentTime}`).getTime() + 60 * 60 * 1000), // Assume 1 hour duration
        resource: apt,
        type: 'appointment'
      }));

      // Transform off days to events
      const offDayEvents = offDaysData.map(day => ({
        id: `off-${day.id}`,
        title: `OFF DAY: ${day.reason || 'Unavailable'}`,
        start: new Date(day.offDate),
        end: new Date(day.offDate),
        allDay: true,
        type: 'offDay'
      }));

      setEvents([...appointmentEvents, ...offDayEvents]);

    } catch (error) {
      console.error('Failed to load calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3b82f6'; // Default blue
    
    if (event.type === 'offDay') {
      backgroundColor = '#ef4444'; // Red for off days
    } else if (event.resource.isCompleted) {
      backgroundColor = '#10b981'; // Green for completed
    } else if (event.resource.status === 'cancelled') {
      backgroundColor = '#9ca3af'; // Gray for cancelled
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  const handleSelectEvent = (event) => {
    if (event.type === 'appointment') {
      setSelectedEvent(event.resource);
    }
  };

  const handleSendReminder = async () => {
    if (!selectedEvent || !confirm(`Send reminder to ${selectedEvent.patient.fullName}?`)) return;
    
    try {
      await sendReminder(selectedEvent.id);
      alert('Reminder sent successfully!');
    } catch (error) {
      console.error('Failed to send reminder:', error);
      alert('Failed to send reminder');
    }
  };

  return (
    <div style={{ padding: '24px', height: 'calc(100vh - 100px)', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#333' }}>
          Calendar
        </h1>
        <p style={{ margin: '8px 0 0 0', fontSize: '16px', color: '#666' }}>
          View your schedule and off days
        </p>
      </div>

      <div style={{ height: 'calc(100% - 100px)', backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          views={['month', 'week', 'day', 'agenda']}
        />
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setSelectedEvent(null)}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: '#333' }}>Appointment Details</h2>
            <div style={{ marginBottom: '16px' }}>
              <strong>Patient:</strong> {selectedEvent.patient.fullName}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Date:</strong> {selectedEvent.appointmentDate} at {selectedEvent.appointmentTime}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Status:</strong> {selectedEvent.isCompleted ? 'Completed' : selectedEvent.status}
            </div>
            {selectedEvent.finalPrice && (
              <div style={{ marginBottom: '16px' }}>
                <strong>Price:</strong> ${selectedEvent.finalPrice}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={handleSendReminder}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                📧 Send Reminder
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#e5e7eb',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
