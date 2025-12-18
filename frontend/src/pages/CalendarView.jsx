import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Mail } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { searchAppointments, sendReminder, getOffDays, getHolidays } from '../doctorApi';
import { getProfile } from '../api';

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
  const { theme } = useTheme();
  const { success, error: toastError } = useToast();

  const [events, setEvents] = useState([]);
  const [offDays, setOffDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loadedRanges, setLoadedRanges] = useState(new Set()); // Track loaded month ranges to avoid duplicate fetches

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadData(currentDate);
    // Cleanup function to cancel any pending requests if component unmounts
    return () => {
      // Could add AbortController here if needed
    };
  }, []);

  // Handle calendar navigation - refetch data for the new visible range
  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
    
    // Create a range key for the month being navigated to
    const rangeKey = `${newDate.getFullYear()}-${newDate.getMonth()}`;
    
    // Only fetch if we haven't loaded this range yet
    if (!loadedRanges.has(rangeKey)) {
      loadData(newDate, true); // true = append to existing events
    }
  };

  const loadData = async (centerDate = new Date(), appendMode = false) => {
    try {
      setLoading(true);

      // Calculate a 6-month window around the center date (3 months before, 3 months after)
      const startDate = new Date(centerDate.getFullYear(), centerDate.getMonth() - 3, 1);
      const endDate = new Date(centerDate.getFullYear(), centerDate.getMonth() + 4, 0); // Last day of 3 months ahead
      
      const appointments = await searchAppointments({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });
      
      // Mark this range as loaded
      const rangeKey = `${centerDate.getFullYear()}-${centerDate.getMonth()}`;
      setLoadedRanges(prev => new Set([...prev, rangeKey]));

      // Load off days
      const offDaysData = await getOffDays();
      setOffDays(offDaysData);

      // Load holidays
      const holidaysData = await getHolidays();

      // Transform appointments to events
      const appointmentEvents = appointments
        .map(apt => {
          const appointmentId = apt?.id ?? apt?.Id ?? apt?.appointmentId ?? apt?.AppointmentId;
          const patient = apt?.patient ?? apt?.Patient;
          const patientFullName = patient?.fullName ?? patient?.FullName;
          const patientPhone = patient?.phone ?? patient?.Phone;
          const status = apt?.status ?? apt?.Status;
          const isCompleted = apt?.isCompleted ?? apt?.IsCompleted;
          const appointmentDate = apt?.appointmentDate ?? apt?.AppointmentDate;
          const appointmentTimeRaw = apt?.appointmentTime ?? apt?.AppointmentTime;

          const normalizedAppointment = {
            ...apt,
            id: appointmentId,
            status,
            isCompleted,
            appointmentDate,
            appointmentTime: appointmentTimeRaw,
            patient: patient
              ? {
                  ...patient,
                  fullName: patientFullName,
                  phone: patientPhone
                }
              : undefined
          };

          const datePart = normalizedAppointment.appointmentDate;
          let timePart = (appointmentTimeRaw || '00:00:00').toString();
          timePart = timePart.split('.')[0];
          if (timePart.length === 5) timePart = `${timePart}:00`;

          const startDate = new Date(`${datePart}T${timePart}`);
          if (Number.isNaN(startDate.getTime())) return null;

          // Use actual duration if available, otherwise default to 1 hour
          const duration = apt.duration ? apt.duration * 60 * 1000 : 60 * 60 * 1000;
          const endDate = new Date(startDate.getTime() + duration);

          return {
            id: appointmentId,
            title: `${normalizedAppointment.patient?.fullName || 'Unknown'} - ${status}`,
            start: startDate,
            end: endDate,
            resource: normalizedAppointment,
            type: 'appointment'
          };
        })
        .filter(Boolean);

      // Transform off days to events
      const offDayEvents = offDaysData.map(day => ({
        id: `off-${day.id}`,
        title: `OFF DAY: ${day.reason || 'Unavailable'}`,
        start: new Date(day.offDate),
        end: new Date(day.offDate),
        allDay: true,
        type: 'offDay'
      }));

      // Transform holidays to events
      const holidayEvents = holidaysData.map(h => ({
        id: `holiday-${h.id}`,
        title: `HOLIDAY: ${h.name}`,
        start: new Date(h.date),
        end: new Date(h.date),
        allDay: true,
        type: 'holiday'
      }));

      if (appendMode) {
        // Merge new events with existing ones, avoiding duplicates
        setEvents(prev => {
          const existingIds = new Set(prev.map(e => e.id));
          const newEvents = [...appointmentEvents, ...offDayEvents, ...holidayEvents].filter(e => !existingIds.has(e.id));
          return [...prev, ...newEvents];
        });
      } else {
        setEvents([...appointmentEvents, ...offDayEvents, ...holidayEvents]);
      }

      // Debug logging for agenda view
      console.log('Loaded events:', [...appointmentEvents, ...offDayEvents]);
      console.log('Total appointments:', appointmentEvents.length);
      console.log('Total off days:', offDayEvents.length);

    } catch (error) {
      console.error('Failed to load calendar data:', error);
      toastError(error.message || 'Failed to load calendar data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const eventStyleGetter = (event) => {
    if (!event || !event.type) {
      return { style: {} };
    }

    let backgroundGradient = 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)';
    let textColor = 'white';
    let borderColor = 'rgba(255, 255, 255, 0.3)';

    if (event.type === 'offDay') {
      backgroundGradient = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    } else if (event.type === 'holiday') {
      backgroundGradient = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'; // Amber/Orange for Holidays
    } else if (event.resource?.isCompleted) {
      backgroundGradient = 'rgba(147, 51, 234, 0.1)';
      textColor = '#9333ea';
      borderColor = 'rgba(147, 51, 234, 0.3)';
    } else if (event.resource?.status === 'cancelled') {
      backgroundGradient = 'rgba(239, 68, 68, 0.1)';
      textColor = '#ef4444';
      borderColor = 'rgba(239, 68, 68, 0.3)';
    }

    return {
      style: {
        background: backgroundGradient,
        borderRadius: '8px',
        opacity: 1,
        color: textColor,
        border: '1px solid ' + borderColor,
        display: 'block',
        padding: '6px 10px',
        fontSize: '12px',
        fontWeight: '600',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }
    };
  };

  const handleSelectEvent = (event) => {
    if (event && event.type === 'appointment' && event.resource) {
      setSelectedEvent(event.resource);
    }
  };

  const handleRequestReminder = () => {
    if (!selectedEvent) return;
    setShowReminderModal(true);
  };

  const handleSendWhatsApp = () => {
    const phone = selectedEvent?.patient?.phone ?? selectedEvent?.patient?.Phone;
    const fullName = selectedEvent?.patient?.fullName ?? selectedEvent?.patient?.FullName;
    const date = selectedEvent?.appointmentDate ?? selectedEvent?.AppointmentDate;
    const time = selectedEvent?.appointmentTime ?? selectedEvent?.AppointmentTime;

    const cleanPhone = (phone || '').toString().replace(/\D/g, '');
    if (!cleanPhone) {
      toastError('Patient phone number is missing');
      return;
    }

    const message = `Hello ${fullName || ''}, this is a reminder for your appointment on ${date || ''} at ${time || ''}.`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const executeSendReminder = async () => {
    try {
      const appointmentId = selectedEvent?.id ?? selectedEvent?.Id ?? selectedEvent?.appointmentId ?? selectedEvent?.AppointmentId;
      if (!appointmentId) {
        toastError('Could not send reminder: missing appointment id');
        return;
      }

      await sendReminder(appointmentId);
      success('Reminder sent successfully!');
      setShowReminderModal(false);
    } catch (error) {
      console.error('Failed to send reminder:', error);
      toastError(error?.message || 'Failed to send reminder');
    }
  };

  const [workingHours, setWorkingHours] = useState(() => {
    const s = new Date(); s.setHours(8, 0, 0, 0);
    const e = new Date(); e.setHours(20, 0, 0, 0);
    return { start: s, end: e };
  });

  useEffect(() => {
     // Fetch doctor profile to get working hours
     const loadProfile = async () => {
         try {
             // Use getProfile from api.js which handles auth and correct URL
             const data = await getProfile();
             
             if (data && data.profile && data.profile.startHour && data.profile.endHour) {
                 const today = new Date();
                 const [startH, startM] = data.profile.startHour.toString().split(':');
                 const [endH, endM] = data.profile.endHour.toString().split(':');
                 
                 const start = new Date(today);
                 start.setHours(parseInt(startH), parseInt(startM), 0);
                 
                 const end = new Date(today);
                 end.setHours(parseInt(endH), parseInt(endM), 0);
                 
                 setWorkingHours({ start, end });
                 console.log('Working hours loaded:', { start, end });
             }
         } catch(e) { 
             console.error("Failed to load working hours", e); 
         }
     };
     loadProfile();
  }, []);

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { 
            box-shadow: 0 0 0 0 rgba(155, 89, 182, 0.7);
          }
          50% { 
            box-shadow: 0 0 0 8px rgba(155, 89, 182, 0);
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Main wrapper - white background */
        .calendar-wrapper-modern {
          background: transparent;
          min-height: 100vh;
          padding: clamp(16px, 4vw, 30px);
          width: 100%;
          box-sizing: border-box;
        }
        
        /* Glass container */
        .calendar-glass-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: clamp(16px, 4vw, 20px);
          border: 1px solid rgba(147, 51, 234, 0.1);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          padding: clamp(16px, 4vw, 30px);
          width: 100%;
          box-sizing: border-box;
        }
        
        /* Calendar base */
        .rbc-calendar {
          background: transparent !important;
          color: #111827 !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
        }
        
        /* Day headers */
        .rbc-header {
          background: #f9fafb !important;
          color: #4b5563 !important;
          border: none !important;
          border-bottom: 2px solid rgba(147, 51, 234, 0.2) !important;
          border-right: 1px solid rgba(147, 51, 234, 0.1) !important;
          padding: 16px 8px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 1px !important;
          font-size: 13px !important;
          position: relative !important;
        }
        
        .rbc-header:last-child {
          border-right: none !important;
        }
        
        .rbc-header::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #9333ea, transparent);
          animation: shimmer 3s infinite;
        }
        
        /* Calendar cells */
        .rbc-day-bg {
          background: #ffffff !important;
          border: none !important;
          border-right: 1px solid rgba(147, 51, 234, 0.1) !important;
          border-bottom: 1px solid rgba(147, 51, 234, 0.1) !important;
          transition: all 0.3s ease !important;
          position: relative !important;
        }
        
        .rbc-day-bg:last-child {
          border-right: none !important;
          border-bottom: 1px solid rgba(147, 51, 234, 0.1) !important;
        }
        
        .rbc-day-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(155, 89, 182, 0.1), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        
        .rbc-day-bg:hover {
          background: rgba(147, 51, 234, 0.05) !important;
          z-index: 1 !important;
        }
        
        .rbc-day-bg:hover::before {
          opacity: 1;
        }
        
        /* Date numbers */
        .rbc-date-cell {
          color: #374151 !important;
          font-size: 16px !important;
          font-weight: 600 !important;
          padding: 12px 8px 8px 8px !important;
          text-align: left !important;
        }
        
        .rbc-date-cell > a {
          color: #374151 !important;
          transition: all 0.3s ease !important;
        }
        
        .rbc-row-content {
          z-index: 2 !important;
        }
        
        .rbc-row {
          border: none !important;
        }
        
        .rbc-month-row {
          border: none !important;
          overflow: visible !important;
        }
        
        /* Today's date */
        .rbc-today {
          background: rgba(147, 51, 234, 0.05) !important;
          border: 2px solid rgba(147, 51, 234, 0.3) !important;
          box-shadow: inset 0 0 20px rgba(147, 51, 234, 0.05) !important;
        }
        
        .rbc-today::after {
          content: '';
          position: absolute;
          inset: 0;
          border: 2px solid #9333ea;
          border-radius: 0;
          animation: pulse 2s infinite;
          pointer-events: none;
        }
        
        .rbc-today .rbc-date-cell > a {
          color: #9333ea !important;
          font-size: 18px !important;
          font-weight: 700 !important;
        }
        
        /* Toolbar */
        .rbc-toolbar {
          background: transparent !important;
          color: #111827 !important;
          padding: clamp(16px, 3vw, 20px) 0 !important;
          margin-bottom: clamp(16px, 3vw, 20px) !important;
          border-bottom: 1px solid rgba(147, 51, 234, 0.1) !important;
          display: flex !important;
          flex-wrap: wrap !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 12px !important;
        }
        
        .rbc-toolbar-label {
          color: #111827 !important;
          font-weight: 700 !important;
          font-size: clamp(18px, 4vw, 24px) !important;
          letter-spacing: -0.5px !important;
        }
        
        /* Buttons - Modern gradient with hover effects */
        .rbc-btn-group button,
        .rbc-toolbar button {
          background: #ffffff !important;
          color: #374151 !important;
          border: 1px solid rgba(147, 51, 234, 0.2) !important;
          border-radius: 10px !important;
          padding: 10px 20px !important;
          font-weight: 500 !important;
          font-size: 14px !important;
          transition: all 0.3s ease !important;
          position: relative !important;
          overflow: hidden !important;
          margin: 0 4px !important;
        }
        
        .rbc-btn-group button::before,
        .rbc-toolbar button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(155, 89, 182, 0.3), transparent);
          transition: left 0.5s;
        }
        
        .rbc-btn-group button:hover,
        .rbc-toolbar button:hover {
          background: #f9fafb !important;
          border-color: rgba(147, 51, 234, 0.5) !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05) !important;
        }
        
        .rbc-btn-group button:hover::before,
        .rbc-toolbar button:hover::before {
          left: 100%;
        }
        
        .rbc-btn-group button.rbc-active,
        .rbc-toolbar button.rbc-active {
          background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%) !important;
          color: #ffffff !important;
          border-color: #9333ea !important;
          box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3) !important;
        }
        
        /* Events - Enhanced with hover */
        .rbc-event {
          border-radius: 8px !important;
          border: none !important;
          border-left: 3px solid rgba(255, 255, 255, 0.5) !important;
          transition: all 0.3s ease !important;
          cursor: pointer !important;
          margin: 2px 4px !important;
        }
        
        .rbc-event:hover {
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
        }
        
        .rbc-event-content {
          padding: 2px 4px !important;
        }
        
        /* Off-range days */
        .rbc-off-range-bg {
          background: #f3f4f6 !important;
          opacity: 0.6 !important;
        }
        
        .rbc-off-range {
          color: #666666 !important;
        }
        
        /* Time slots */
        .rbc-time-slot {
          border-top: 1px solid rgba(155, 89, 182, 0.2) !important;
          border-left: none !important;
        }
        
        .rbc-time-header-content {
          border-left: none !important;
          border-bottom: 1px solid rgba(155, 89, 182, 0.3) !important;
        }
        
        .rbc-time-content {
          border-top: 1px solid rgba(147, 51, 234, 0.1) !important;
          border-left: none !important;
          background: #ffffff !important;
        }
        
        .rbc-time-gutter {
          color: #9333ea !important;
          font-weight: 600 !important;
          border-left: none !important;
        }
        
        .rbc-allday-cell {
          border-left: none !important;
        }
        
        .rbc-time-header {
          border-bottom: 1px solid rgba(155, 89, 182, 0.3) !important;
        }
        
        .rbc-label {
          border-bottom: 1px solid rgba(155, 89, 182, 0.2) !important;
        }
        
        .rbc-current-time-indicator {
          background-color: #9333ea !important;
          height: 2px !important;
        }
        
        /* Agenda view */
        .rbc-agenda-view {
          background: transparent !important;
          min-height: 400px !important;
        }
        
        .rbc-agenda-view table {
          background: transparent !important;
          color: #111827 !important;
          border: none !important;
          border-collapse: separate !important;
          border-spacing: 0 8px !important;
        }
        
        .rbc-agenda-view table thead {
          background: linear-gradient(135deg, #581c87 0%, #7e22ce 100%) !important;
        }
        
        .rbc-agenda-view table thead tr th {
          color: #ffffff !important;
          font-weight: 700 !important;
          border: none !important;
          padding: 12px !important;
        }
        
        .rbc-agenda-view table tbody tr {
          background: #ffffff !important;
          border: 1px solid rgba(147, 51, 234, 0.1) !important;
          border-radius: 8px !important;
          transition: all 0.3s ease !important;
        }
        
        .rbc-agenda-view table tbody tr:hover {
          background: rgba(147, 51, 234, 0.05) !important;
        }
        
        .rbc-agenda-date-cell,
        .rbc-agenda-time-cell,
        .rbc-agenda-event-cell {
          color: #374151 !important;
          padding: 12px !important;
          border: none !important;
        }
        
        .rbc-agenda-date-cell {
          border-radius: 8px 0 0 8px !important;
        }
        
        .rbc-agenda-event-cell {
          border-radius: 0 8px 8px 0 !important;
        }
        
        /* Empty agenda message */
        .rbc-agenda-empty {
          color: #6b7280 !important;
          text-align: center !important;
          padding: 40px !important;
          font-size: 16px !important;
        }
        
        /* Week/Day view time column */
        .rbc-time-view .rbc-header {
          border-right: 1px solid rgba(155, 89, 182, 0.3) !important;
          border-left: none !important;
        }
        
        .rbc-time-view .rbc-header:last-child {
          border-right: none !important;
        }
        
        .rbc-time-view .rbc-time-gutter {
          border-right: 1px solid rgba(155, 89, 182, 0.3) !important;
        }
        
        .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid rgba(155, 89, 182, 0.2) !important;
        }
        
        .rbc-time-column {
          border-left: none !important;
        }
        
        .rbc-timeslot-group {
          border-left: none !important;
          border-bottom: 1px solid rgba(155, 89, 182, 0.2) !important;
        }
        
        .rbc-day-slot {
          border-left: 1px solid rgba(155, 89, 182, 0.3) !important;
        }
        
        .rbc-day-slot:first-child {
          border-left: none !important;
        }
        
        .rbc-time-header-content {
          border-left: none !important;
        }
        
        .rbc-time-content > * + * > * {
          border-left: 1px solid rgba(155, 89, 182, 0.3) !important;
        }
        
        /* Scrollbar styling - Hide all scrollbars */
        .rbc-time-content::-webkit-scrollbar {
          width: 0;
          height: 0;
          display: none;
        }
        
        .rbc-time-content::-webkit-scrollbar-track {
          display: none;
        }
        
        .rbc-time-content::-webkit-scrollbar-thumb {
          display: none;
        }
        
        .rbc-time-content::-webkit-scrollbar-thumb:hover {
          display: none;
        }
        
        .rbc-time-content {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        /* Hide scrollbar for all elements */
        * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        *::-webkit-scrollbar {
          width: 0;
          height: 0;
          display: none;
        }
        
        /* Responsive Styles */
        /* Mobile devices (up to 768px) */
        @media (max-width: 768px) {
          .calendar-wrapper-modern {
            padding: 16px !important;
          }
          
          .calendar-glass-container {
            padding: 16px !important;
            border-radius: 16px !important;
          }
          
          /* Header adjustments */
          .calendar-header h1 {
            font-size: 24px !important;
            min-height: auto !important;
            margin-bottom: 8px !important;
          }
          
          .calendar-header p {
            font-size: 14px !important;
            margin-bottom: 16px !important;
          }
          
          /* Toolbar - stack buttons vertically on mobile */
          .rbc-toolbar {
            flex-direction: column !important;
            gap: 12px !important;
            padding: 16px 0 !important;
          }
          
          .rbc-toolbar-label {
            font-size: 18px !important;
            margin-bottom: 8px !important;
            text-align: center !important;
            width: 100% !important;
          }
          
          .rbc-btn-group {
            display: flex !important;
            flex-wrap: wrap !important;
            justify-content: center !important;
            gap: 8px !important;
            width: 100% !important;
          }
          
          .rbc-btn-group button {
            flex: 1 1 calc(50% - 4px) !important;
            min-width: calc(50% - 4px) !important;
            padding: 8px 12px !important;
            font-size: 12px !important;
            margin: 0 !important;
          }
          
          .rbc-toolbar button {
            padding: 8px 12px !important;
            font-size: 12px !important;
            margin: 4px !important;
          }
          
          /* Day headers - smaller on mobile */
          .rbc-header {
            padding: 10px 4px !important;
            font-size: 11px !important;
            letter-spacing: 0.5px !important;
          }
          
          /* Date cells - smaller on mobile */
          .rbc-date-cell {
            font-size: 14px !important;
            padding: 8px 4px 4px 4px !important;
          }
          
          .rbc-today .rbc-date-cell > a {
            font-size: 16px !important;
            width: 28px !important;
            height: 28px !important;
            line-height: 24px !important;
          }
          
          /* Events - smaller text on mobile */
          .rbc-event {
            font-size: 11px !important;
            padding: 4px 6px !important;
            margin: 1px 2px !important;
          }
          
          .rbc-event-content {
            padding: 1px 2px !important;
          }
          
          /* Time gutter - smaller on mobile */
          .rbc-time-gutter {
            font-size: 11px !important;
            padding: 4px !important;
          }
          
          /* Agenda view - responsive table */
          .rbc-agenda-view table {
            font-size: 12px !important;
            border-spacing: 0 4px !important;
          }
          
          .rbc-agenda-view table thead tr th {
            padding: 8px 4px !important;
            font-size: 11px !important;
          }
          
          .rbc-agenda-date-cell,
          .rbc-agenda-time-cell,
          .rbc-agenda-event-cell {
            padding: 8px 4px !important;
            font-size: 12px !important;
          }
          
          /* Modal adjustments for mobile */
          .calendar-event-modal {
            width: 95% !important;
            max-width: 95% !important;
            padding: 20px !important;
            margin: 10px !important;
          }
          
          .calendar-event-modal h2 {
            font-size: 20px !important;
          }
          
          .calendar-event-modal button {
            width: 100% !important;
            margin-top: 8px !important;
          }
          
          /* Hide some elements on very small screens */
          @media (max-width: 480px) {
            .rbc-toolbar-label {
              font-size: 16px !important;
            }
            
            .rbc-header {
              font-size: 10px !important;
              padding: 8px 2px !important;
            }
            
            .rbc-date-cell {
              font-size: 12px !important;
            }
            
            .rbc-event {
              font-size: 10px !important;
              padding: 3px 4px !important;
            }
            
            /* Make calendar scrollable on very small screens */
            .rbc-calendar {
              overflow-x: auto !important;
            }
            
            .rbc-month-view {
              min-width: 100% !important;
            }
          }
          
          /* Ensure calendar doesn't overflow on mobile */
          .rbc-calendar {
            width: 100% !important;
            max-width: 100% !important;
            overflow-x: auto !important;
          }
          
          .rbc-month-view,
          .rbc-time-view,
          .rbc-agenda-view {
            width: 100% !important;
            min-width: 100% !important;
          }
        }
        
        /* Tablet devices (768px - 1024px) */
        @media (min-width: 769px) and (max-width: 1024px) {
          .calendar-wrapper-modern {
            padding: 20px !important;
          }
          
          .calendar-glass-container {
            padding: 20px !important;
          }
          
          .rbc-toolbar {
            flex-wrap: wrap !important;
          }
          
          .rbc-btn-group button {
            padding: 9px 16px !important;
            font-size: 13px !important;
          }
          
          .rbc-header {
            padding: 12px 6px !important;
            font-size: 12px !important;
          }
          
          .rbc-date-cell {
            font-size: 15px !important;
          }
          
          .rbc-event {
            font-size: 11px !important;
            padding: 5px 8px !important;
          }
        }
        
        /* Large screens (1024px and above) */
        @media (min-width: 1025px) {
          .calendar-wrapper-modern {
            padding: 30px !important;
          }
          
          .calendar-glass-container {
            padding: 30px !important;
          }
        }
      `}</style>

      <div className="calendar-wrapper-modern">
        <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          <div className="calendar-header" style={{ marginBottom: '24px', padding: '0 8px' }}>
            <h1 style={{
              margin: 0,
              fontSize: 'clamp(24px, 5vw, 32px)',
              fontWeight: '700',
              color: '#9333ea',
              letterSpacing: '-0.5px'
            }}>
              Calendar
            </h1>
            <p style={{ margin: '8px 0 0 0', fontSize: 'clamp(14px, 2vw, 16px)', color: '#4b5563' }}>
              View your schedule and off days
            </p>
          </div>

          <div className="calendar-glass-container" style={{
            height: 'auto',
            minHeight: isMobile ? '500px' : '650px',

            position: 'relative',
            width: '100%',
            overflow: 'visible',
          }}>
            {loading ? (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                   border: '4px solid rgba(147, 51, 234, 0.1)',
                   borderTop: '4px solid #9333ea',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                 <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading calendar...</p>
              </div>
            ) : null}
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              onSelectEvent={handleSelectEvent}
              eventPropGetter={eventStyleGetter}
              views={['month', 'week', 'day', 'agenda']}
              defaultView="week"
              step={30}
              timeslots={2}
              min={workingHours.start}
              max={workingHours.end}
              date={currentDate}
              onNavigate={handleNavigate}
            />
          </div>
        </div>

        {/* Event Details Modal */}
        {selectedEvent && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }} onClick={() => setSelectedEvent(null)}>
             <div className="calendar-event-modal" style={{
               background: '#ffffff',
               border: '1px solid rgba(147, 51, 234, 0.1)',
               borderRadius: '20px',
               padding: 'clamp(20px, 4vw, 30px)',
               maxWidth: '500px',
               width: '90%',
               maxHeight: '90vh',
               overflowY: 'auto',
               boxShadow: '0 10px 25px -5px rgba(147, 51, 234, 0.1)',
               color: '#111827',
               margin: '20px'
             }} onClick={(e) => e.stopPropagation()}>
              <h2 style={{
                marginTop: 0,
                color: '#9333ea',
                fontSize: '24px',
                fontWeight: '700'
              }}>
                Appointment Details
              </h2>
               <div style={{ marginBottom: '16px', fontSize: '15px' }}>
                 <strong style={{ color: '#9333ea' }}>Patient:</strong> <span style={{ color: '#374151' }}>{selectedEvent?.patient?.fullName || selectedEvent?.patient?.FullName || 'Unknown'}</span>
               </div>
               <div style={{ marginBottom: '16px', fontSize: '15px' }}>
                 <strong style={{ color: '#9333ea' }}>Date:</strong> <span style={{ color: '#374151' }}>{selectedEvent?.appointmentDate || selectedEvent?.AppointmentDate} at {selectedEvent?.appointmentTime || selectedEvent?.AppointmentTime}</span>
               </div>
               <div style={{ marginBottom: '16px', fontSize: '15px' }}>
                 <strong style={{ color: '#9333ea' }}>Status:</strong> <span style={{ color: '#374151' }}>{(selectedEvent?.isCompleted ?? selectedEvent?.IsCompleted) ? 'Completed' : (selectedEvent?.status || selectedEvent?.Status)}</span>
               </div>
               {selectedEvent.finalPrice && (
                 <div style={{ marginBottom: '16px', fontSize: '15px' }}>
                   <strong style={{ color: '#9333ea' }}>Price:</strong> <span style={{ color: '#374151' }}>${selectedEvent.finalPrice}</span>
                 </div>
               )}

              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '24px'
              }}>
                <button
                  onClick={handleRequestReminder}
                  style={{
                    padding: 'clamp(8px, 2vw, 10px) clamp(16px, 4vw, 20px)',
                    background: 'linear-gradient(135deg, #5b9bd5 0%, #4a7fb8 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(91, 155, 213, 0.3)',
                    width: isMobile ? '100%' : 'auto',
                    fontSize: 'clamp(13px, 2vw, 14px)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(91, 155, 213, 0.5)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(91, 155, 213, 0.3)';
                  }}
                >
                  <Mail size={isMobile ? 14 : 16} />
                  Send Reminder
                </button>

                <button
                  onClick={handleSendWhatsApp}
                  style={{
                    padding: 'clamp(8px, 2vw, 10px) clamp(16px, 4vw, 20px)',
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                    width: isMobile ? '100%' : 'auto',
                    fontSize: 'clamp(13px, 2vw, 14px)'
                  }}
                >
                  WhatsApp
                </button>

                 <button
                   onClick={() => setSelectedEvent(null)}
                   style={{
                     padding: 'clamp(8px, 2vw, 10px) clamp(16px, 4vw, 20px)',
                     backgroundColor: '#ffffff',
                     color: '#374151',
                     border: '1px solid rgba(147, 51, 234, 0.2)',
                     borderRadius: '10px',
                     cursor: 'pointer',
                     fontWeight: '600',
                     transition: 'all 0.3s ease',
                     width: isMobile ? '100%' : 'auto',
                     fontSize: 'clamp(13px, 2vw, 14px)'
                   }}
                   onMouseOver={(e) => {
                     e.currentTarget.style.transform = 'translateY(-2px)';
                     e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.5)';
                   }}
                   onMouseOut={(e) => {
                     e.currentTarget.style.transform = 'translateY(0)';
                     e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.2)';
                   }}
                 >
                   Close
                 </button>
              </div>
            </div>
          </div>
        )}

        <ConfirmationModal
          isOpen={showReminderModal}
          title="Send Appointment Reminder"
          message={`Are you sure you want to send a reminder to ${selectedEvent?.patient?.fullName || selectedEvent?.patient?.FullName || 'this patient'}?`}
          confirmText="Send Reminder"
          onConfirm={executeSendReminder}
          onCancel={() => setShowReminderModal(false)}
          type="info"
        />
      </div>
    </>
  );
};

export default CalendarView;