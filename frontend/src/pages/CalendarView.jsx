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
import { searchAppointments, sendReminder, getOffDays } from '../doctorApi';

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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadData();
    // Cleanup function to cancel any pending requests if component unmounts
    return () => {
      // Could add AbortController here if needed
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load appointments - optimized to load current year
      const currentYear = new Date().getFullYear();
      const appointments = await searchAppointments({
        startDate: new Date(currentYear, 0, 1).toISOString().split('T')[0],
        endDate: new Date(currentYear, 11, 31).toISOString().split('T')[0]
      });

      // Load off days
      const offDaysData = await getOffDays();
      setOffDays(offDaysData);

      // Transform appointments to events
      const appointmentEvents = appointments.map(apt => {
        const startDate = new Date(`${apt.appointmentDate}T${apt.appointmentTime}`);
        // Use actual duration if available, otherwise default to 1 hour
        const duration = apt.duration ? apt.duration * 60 * 1000 : 60 * 60 * 1000;
        const endDate = new Date(startDate.getTime() + duration);

        return {
          id: apt.id,
          title: `${apt.patient?.fullName || 'Unknown'} - ${apt.status}`,
          start: startDate,
          end: endDate,
          resource: apt,
          type: 'appointment'
        };
      });

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

    let backgroundGradient = 'linear-gradient(135deg, #5b9bd5 0%, #4a7fb8 100%)';

    if (event.type === 'offDay') {
      backgroundGradient = 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)';
    } else if (event.resource?.isCompleted) {
      // Completed appointments could have different styling
      backgroundGradient = 'linear-gradient(135deg, #5b9bd5 0%, #4a7fb8 100%)';
    } else if (event.resource?.status === 'cancelled') {
      // Cancelled appointments could have different styling
      backgroundGradient = 'linear-gradient(135deg, #5b9bd5 0%, #4a7fb8 100%)';
    }

    return {
      style: {
        background: backgroundGradient,
        borderRadius: '8px',
        opacity: 0.95,
        color: 'white',
        border: 'none',
        borderLeft: '3px solid rgba(255, 255, 255, 0.5)',
        display: 'block',
        padding: '6px 10px',
        fontSize: '12px',
        fontWeight: '500',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
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

  const executeSendReminder = async () => {
    try {
      await sendReminder(selectedEvent.id);
      success('Reminder sent successfully!');
      setShowReminderModal(false);
    } catch (error) {
      console.error('Failed to send reminder:', error);
      toastError('Failed to send reminder');
    }
  };

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
          background: #000000;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: clamp(16px, 4vw, 20px);
          border: 1px solid rgba(155, 89, 182, 0.2);
          box-shadow: 0 20px 60px rgba(155, 89, 182, 0.15);
          padding: clamp(16px, 4vw, 30px);
          width: 100%;
          box-sizing: border-box;
        }
        
        /* Calendar base */
        .rbc-calendar {
          background: transparent !important;
          color: #ffffff !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
        }
        
        /* Day headers - Purple with shimmer */
        .rbc-header {
          background: linear-gradient(135deg, #581c87 0%, #7e22ce 100%) !important;
          color: #000000 !important;
          border: none !important;
          border-bottom: 2px solid #9333ea !important;
          border-right: 1px solid rgba(155, 89, 182, 0.3) !important;
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
        
        /* Calendar cells - Dark with hover effect */
        .rbc-day-bg {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%) !important;
          border: none !important;
          border-right: 1px solid rgba(155, 89, 182, 0.2) !important;
          border-bottom: 1px solid rgba(155, 89, 182, 0.2) !important;
          transition: all 0.3s ease !important;
          position: relative !important;
        }
        
        .rbc-day-bg:last-child {
          border-right: none !important;
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
          transform: scale(1.02) !important;
          box-shadow: 0 8px 25px rgba(155, 89, 182, 0.2) !important;
          z-index: 10 !important;
        }
        
        .rbc-day-bg:hover::before {
          opacity: 1;
        }
        
        /* Date numbers */
        .rbc-date-cell {
          color: #ffffff !important;
          font-size: 16px !important;
          font-weight: 600 !important;
          padding: 12px 8px 8px 8px !important;
          text-align: left !important;
        }
        
        .rbc-date-cell > a {
          color: #ffffff !important;
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
        
        /* Today's date - Purple with pulse animation */
        .rbc-today {
          background: linear-gradient(135deg, #581c87 0%, #7e22ce 100%) !important;
          border: 2px solid #9333ea !important;
          box-shadow: 0 0 30px rgba(155, 89, 182, 0.5), inset 0 0 20px rgba(155, 89, 182, 0.1) !important;
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
          color: #000000 !important;
          font-size: 18px !important;
          font-weight: 700 !important;
          text-shadow: 0 0 10px rgba(155, 89, 182, 0.5) !important;
        }
        
        /* Toolbar */
        .rbc-toolbar {
          background: transparent !important;
          color: #ffffff !important;
          padding: clamp(16px, 3vw, 20px) 0 !important;
          margin-bottom: clamp(16px, 3vw, 20px) !important;
          border-bottom: 1px solid rgba(155, 89, 182, 0.2) !important;
          display: flex !important;
          flex-wrap: wrap !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 12px !important;
        }
        
        .rbc-toolbar-label {
          background: linear-gradient(135deg, #ffffff 0%, #9333ea 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700 !important;
          font-size: clamp(18px, 4vw, 24px) !important;
          letter-spacing: -0.5px !important;
        }
        
        /* Buttons - Modern gradient with hover effects */
        .rbc-btn-group button,
        .rbc-toolbar button {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%) !important;
          color: #ffffff !important;
          border: 1px solid rgba(155, 89, 182, 0.3) !important;
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
          background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%) !important;
          border-color: rgba(155, 89, 182, 0.6) !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 5px 15px rgba(155, 89, 182, 0.3) !important;
        }
        
        .rbc-btn-group button:hover::before,
        .rbc-toolbar button:hover::before {
          left: 100%;
        }
        
        .rbc-btn-group button.rbc-active,
        .rbc-toolbar button.rbc-active {
          background: linear-gradient(135deg, #9333ea 0%, #7e22ce 100%) !important;
          color: #000000 !important;
          border-color: #9333ea !important;
          box-shadow: 0 4px 12px rgba(155, 89, 182, 0.5) !important;
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
          transform: translateX(3px) !important;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4) !important;
        }
        
        .rbc-event-content {
          padding: 2px 4px !important;
        }
        
        /* Off-range days */
        .rbc-off-range-bg {
          background: linear-gradient(135deg, #050505 0%, #0f0f0f 100%) !important;
          opacity: 0.5 !important;
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
          border-top: 1px solid rgba(155, 89, 182, 0.3) !important;
          border-left: none !important;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%) !important;
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
          color: #ffffff !important;
          border: none !important;
          border-collapse: separate !important;
          border-spacing: 0 8px !important;
        }
        
        .rbc-agenda-view table thead {
          background: linear-gradient(135deg, #581c87 0%, #7e22ce 100%) !important;
        }
        
        .rbc-agenda-view table thead tr th {
          color: #000000 !important;
          font-weight: 700 !important;
          border: none !important;
          padding: 12px !important;
        }
        
        .rbc-agenda-view table tbody tr {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%) !important;
          border: none !important;
          border-radius: 8px !important;
          transition: all 0.3s ease !important;
        }
        
        .rbc-agenda-view table tbody tr:hover {
          background: radial-gradient(circle at center, rgba(155, 89, 182, 0.1) 0%, #0a0a0a 100%) !important;
          transform: scale(1.01) !important;
        }
        
        .rbc-agenda-date-cell,
        .rbc-agenda-time-cell,
        .rbc-agenda-event-cell {
          color: #ffffff !important;
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
          color: #ffffff !important;
          text-align: center !important;
          padding: 40px !important;
          font-size: 16px !important;
          opacity: 0.7 !important;
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
          }
          
          .calendar-header p {
            font-size: 14px !important;
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
            <p style={{ margin: '8px 0 0 0', fontSize: 'clamp(14px, 2vw, 16px)', color: '#ffffff', opacity: 0.8 }}>
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
                  border: '4px solid rgba(155, 89, 182, 0.2)',
                  borderTop: '4px solid #9333ea',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ color: '#ffffff', fontSize: '16px', opacity: 0.8 }}>Loading calendar...</p>
              </div>
            ) : null}
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '650px', opacity: loading ? 0.5 : 1, transition: 'opacity 0.3s ease' }}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleSelectEvent}
              views={['month', 'week', 'day', 'agenda']}
              length={90}
              popup
              showMultiDayTimes
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
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
              border: '1px solid rgba(155, 89, 182, 0.3)',
              borderRadius: '20px',
              padding: 'clamp(20px, 4vw, 30px)',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(155, 89, 182, 0.3)',
              color: '#ffffff',
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
                <strong style={{ color: '#9333ea' }}>Patient:</strong> {selectedEvent.patient.fullName}
              </div>
              <div style={{ marginBottom: '16px', fontSize: '15px' }}>
                <strong style={{ color: '#9333ea' }}>Date:</strong> {selectedEvent.appointmentDate} at {selectedEvent.appointmentTime}
              </div>
              <div style={{ marginBottom: '16px', fontSize: '15px' }}>
                <strong style={{ color: '#9333ea' }}>Status:</strong> {selectedEvent.isCompleted ? 'Completed' : selectedEvent.status}
              </div>
              {selectedEvent.finalPrice && (
                <div style={{ marginBottom: '16px', fontSize: '15px' }}>
                  <strong style={{ color: '#9333ea' }}>Price:</strong> ${selectedEvent.finalPrice}
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
                  onClick={() => setSelectedEvent(null)}
                  style={{
                    padding: 'clamp(8px, 2vw, 10px) clamp(16px, 4vw, 20px)',
                    background: 'linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%)',
                    color: '#ffffff',
                    border: '1px solid rgba(155, 89, 182, 0.3)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    width: isMobile ? '100%' : 'auto',
                    fontSize: 'clamp(13px, 2vw, 14px)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = 'rgba(155, 89, 182, 0.6)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(155, 89, 182, 0.3)';
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
          message={`Are you sure you want to send a reminder to ${selectedEvent?.patient?.fullName}?`}
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