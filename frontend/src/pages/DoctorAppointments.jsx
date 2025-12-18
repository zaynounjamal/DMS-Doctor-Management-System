import { Calendar, CalendarDays, CalendarRange, History, BarChart3, FileText, Mail, X, Plus, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import {
  getTodayAppointments,
  getTomorrowAppointments,
  getFutureAppointments,
  getPastAppointments,
  completeAppointment,
  getAppointmentNotes,
  addMedicalNote,
  editMedicalNote,
  searchAppointments,
  bulkCompleteAppointments,
  sendReminder,
  sendRemindersBulk
} from '../doctorApi';
import API_URL from '../config';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppointmentCard from '../components/AppointmentCard';
import MarkAsDoneModal from '../components/MarkAsDoneModal';
import AddNoteModal from '../components/AddNoteModal';
import MedicalNotesList from '../components/MedicalNotesList';

const DoctorAppointments = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { success, error: toastError, info } = useToast();

  const [activeTab, setActiveTab] = useState('today');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showMarkAsDoneModal, setShowMarkAsDoneModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [appointmentNotes, setAppointmentNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);

  // Filter states
  const [completionFilter, setCompletionFilter] = useState('all'); // 'all', 'completed', 'not-completed'
  const [paymentFilter, setPaymentFilter] = useState('all'); // 'all', 'paid', 'unpaid'

  // Search & Bulk Action states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchStartDate, setSearchStartDate] = useState('');
  const [searchEndDate, setSearchEndDate] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [showBulkCompleteModal, setShowBulkCompleteModal] = useState(false);

  const [isBulkCompleting, setIsBulkCompleting] = useState(false);

  // Define tabs with icon render functions
  const tabs = [
    { id: 'today', label: 'Today', IconComponent: Calendar },
    { id: 'tomorrow', label: 'Tomorrow', IconComponent: CalendarDays },
    { id: 'future', label: 'Upcoming', IconComponent: CalendarRange },
    { id: 'past', label: 'History', IconComponent: History }
  ];

  useEffect(() => {
    loadAppointments(activeTab);
  }, [activeTab]);

  const loadAppointments = async (tab) => {
    try {
      setLoading(true);
      let data;
      switch (tab) {
        case 'today':
          data = await getTodayAppointments();
          break;
        case 'tomorrow':
          data = await getTomorrowAppointments();
          break;
        case 'future':
          data = await getFutureAppointments();
          break;
        case 'past':
          data = await getPastAppointments();
          break;
        default:
          data = await getTodayAppointments();
      }
      setAppointments(data);
    } catch (error) {
      console.error('Failed to load appointments:', error);
      if (error.message.includes('401') || error.message.includes('403')) {
        toastError("Session expired. Please log in again.");
      } else {
        toastError('Failed to load appointments');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsDone = (appointment) => {
    setSelectedAppointment(appointment);
    setShowMarkAsDoneModal(true);
  };

  const handleExport = async (format) => {
    try {
      setLoading(true);
      const period = document.getElementById('exportPeriod').value;
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const response = await fetch(`${API_URL}/doctor/appointments/export?format=${format}&period=${period}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `appointments_${period}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      toastError('Failed to export appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCompletion = async (finalPrice, completionNotes, paymentStatus) => {
    try {
      // Ensure price is a number
      const price = parseFloat(finalPrice);
      if (isNaN(price)) {
        toastError("Please enter a valid price");
        return;
      }
      await completeAppointment(selectedAppointment.id, price, completionNotes, paymentStatus);
      await loadAppointments(activeTab);
      setShowMarkAsDoneModal(false);
    } catch (error) {
      throw error;
    }
  };

  // --- Search ---
  const handleSearch = async () => {
    if (!searchQuery && !searchStartDate && !searchEndDate && !searchStatus) return;
    setIsSearchMode(true);
    setLoading(true);
    try {
      const results = await searchAppointments({
        query: searchQuery,
        startDate: searchStartDate,
        endDate: searchEndDate,
        status: searchStatus
      });
      setAppointments(results);
    } catch (error) {
      console.error(error);
      toastError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchStartDate('');
    setSearchEndDate('');
    setSearchStatus('');
    setIsSearchMode(false);
    loadAppointments(activeTab);
  };

  // --- Bulk Actions ---
  const handleRequestBulkComplete = () => {
    if (selectedAppointments.length === 0) return;
    setShowBulkCompleteModal(true);
  };

  const toggleSelection = (id) => {
    setSelectedAppointments(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const executeBulkComplete = async () => {
    setIsBulkCompleting(true);
    try {
      await bulkCompleteAppointments(selectedAppointments, 50);
      success('Bulk completion successful');
      setSelectedAppointments([]);
      loadAppointments(activeTab);
    } catch (error) {
      console.error(error);
      toastError('Bulk action failed');
    } finally {
      setIsBulkCompleting(false);
      setShowBulkCompleteModal(false);
    }
  };

  const handleBulkRemind = async () => {
    if (selectedAppointments.length === 0) {
      toastError('Please select at least one appointment');
      return;
    }

    try {
      const result = await sendRemindersBulk(selectedAppointments);
      if (result.succeeded > 0) {
        success(`Successfully sent ${result.succeeded} reminder(s). ${result.failed > 0 ? `${result.failed} failed.` : ''}`);
      } else {
        toastError(`Failed to send reminders. ${result.message || 'Please check patient email addresses.'}`);
      }
      
      // Log detailed results if there are failures
      if (result.failed > 0 && result.results) {
        const failures = result.results.filter(r => !r.success);
        console.warn('Failed reminders:', failures);
      }
      
      setSelectedAppointments([]);
    } catch (error) {
      console.error('Bulk reminder error:', error);
      toastError(error.message || 'Failed to send bulk reminders');
    }
  };

  const handleRemind = async (appointment, method) => {
    if (method === 'whatsapp') {
      const phone = appointment.patient?.phone || '';
      // Simple cleaning of phone number (assuming it's international or local, needs cleanup for WA)
      // If starts with 0, replace with country code (e.g. +961 for Lebanon or whatever default)
      // For now just use as is or assume user has correct format, or strip non-digits.
      const cleanPhone = phone.replace(/\D/g, '');
      const message = `Hello ${appointment.patient.fullName}, this is a reminder for your appointment with Dr. ${user.fullName} on ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.appointmentTime}.`;
      const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    } else {
      // Email
      try {
        await sendReminder(appointment.id);
        success('Email reminder sent');
      } catch (e) {
        console.error(e);
        toastError(e?.message || 'Failed to send email reminder');
      }
    }
  };

  // --- Notes Management ---
  const handleViewNotes = async (appointment) => {
    setSelectedAppointment(appointment);
    try {
      // Fetch notes
      const notes = await getAppointmentNotes(appointment.id);
      setAppointmentNotes(notes);
      setShowNotesModal(true);
    } catch (e) {
      console.error(e);
      toastError('Failed to load notes');
    }
  };

  const handleAddNote = () => {
    setSelectedNote(null);
    setShowAddNoteModal(true);
    setShowNotesModal(false); // Close list modal temporarily
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setShowAddNoteModal(true);
    setShowNotesModal(false);
  };

  const handleSubmitNote = async (noteText) => {
    try {
      if (selectedNote) {
        await editMedicalNote(selectedNote.id, noteText);
      } else {
        await addMedicalNote(selectedAppointment.id, noteText);
      }
      // Refresh notes
      const notes = await getAppointmentNotes(selectedAppointment.id);
      setAppointmentNotes(notes);
      setShowAddNoteModal(false);
      setShowNotesModal(true); // Reopen list

      // Refresh appointment list to update counts if needed
      loadAppointments(activeTab);
    } catch (e) {
      console.error(e);
      toastError('Failed to save note');
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-purple-600 dark:text-purple-400" style={{ margin: 0 }}>
            Appointments
          </h1>
          <p style={{ margin: '8px 0 0 0', fontSize: '16px', color: '#666' }}>
            Manage your appointments across different time periods
          </p>
        </div>

        {/* Export Button */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            id="exportPeriod"
            defaultValue="month"
            style={{
              padding: '10px 12px',
              fontSize: '14px',
              border: '1px solid rgba(147, 51, 234, 0.2)',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#111827',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>

          <button
            onClick={() => handleExport('csv')}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#10b981',
              color: 'white',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
          >
            <BarChart3 size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Export CSV
          </button>

          <button
            onClick={() => handleExport('pdf')}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#ef4444',
              color: 'white',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
          >
            <FileText size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Export PDF
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{
        marginBottom: '24px',
        padding: '24px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '1px solid rgba(147, 51, 234, 0.1)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'end' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '700',
              color: '#9333ea',
              marginBottom: '8px',
              letterSpacing: '0.5px'
            }}>Search</label>
            <input
              type="text"
              placeholder="Patient name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(147, 51, 234, 0.2)',
                background: '#fff',
                color: '#111827',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.border = '1px solid #9333ea';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(147, 51, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = '1px solid rgba(147, 51, 234, 0.2)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '700',
              color: '#9333ea',
              marginBottom: '8px',
              letterSpacing: '0.5px'
            }}>From</label>
            <input
              type="date"
              value={searchStartDate}
              onChange={(e) => setSearchStartDate(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(147, 51, 234, 0.2)',
                background: '#fff',
                color: '#111827',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '700',
              color: '#9333ea',
              marginBottom: '8px',
              letterSpacing: '0.5px'
            }}>To</label>
            <input
              type="date"
              value={searchEndDate}
              onChange={(e) => setSearchEndDate(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(147, 51, 234, 0.2)',
                background: '#fff',
                color: '#111827',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '700',
              color: '#9333ea',
              marginBottom: '8px',
              letterSpacing: '0.5px'
            }}>Status</label>
            <select
              value={searchStatus}
              onChange={(e) => setSearchStatus(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(147, 51, 234, 0.2)',
                background: '#fff',
                color: '#111827',
                fontSize: '14px',
                minWidth: '140px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button
            onClick={handleSearch}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '14px',
              boxShadow: '0 4px 15px rgba(155, 89, 182, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(155, 89, 182, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(155, 89, 182, 0.3)';
            }}
          >
            Search
          </button>
          {isSearchMode && (
            <button
              onClick={clearSearch}
              style={{
                padding: '12px 24px',
                backgroundColor: '#fff',
                color: '#374151',
                border: '1px solid rgba(147, 51, 234, 0.2)',
                borderRadius: '10px',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(147, 51, 234, 0.2)';
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        border: '1px solid rgba(147, 51, 234, 0.1)',
        overflowX: 'auto',
        padding: '8px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '8px',
               backgroundColor: activeTab === tab.id ? 'rgba(147, 51, 234, 0.1)' : 'transparent',
               color: activeTab === tab.id ? '#9333ea' : '#6b7280',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              backdropFilter: activeTab === tab.id ? 'blur(5px)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                 e.currentTarget.style.backgroundColor = 'rgba(147, 51, 234, 0.05)';
                 e.currentTarget.style.color = '#9333ea';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                 e.currentTarget.style.backgroundColor = 'transparent';
                 e.currentTarget.style.color = '#6b7280';
              }
            }}
          >
            <tab.IconComponent size={16} style={{ marginRight: '8px' }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        {/* Completion Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#9333ea' }}>Status:</span>
          <select
            value={completionFilter}
            onChange={(e) => setCompletionFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              fontSize: '14px',
              border: '1px solid rgba(147, 51, 234, 0.2)',
              borderRadius: '6px',
              background: '#fff',
              color: '#111827',
              cursor: 'pointer',
              outline: 'none',
              fontWeight: '600'
            }}
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="not-completed">Not Completed</option>
          </select>
        </div>

        {/* Payment Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#9333ea' }}>Payment:</span>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              fontSize: '14px',
              border: '1px solid rgba(147, 51, 234, 0.2)',
              borderRadius: '6px',
              background: '#fff',
              color: '#111827',
              cursor: 'pointer',
              outline: 'none',
              fontWeight: '600'
            }}
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {(completionFilter !== 'all' || paymentFilter !== 'all') && (
          <button
            onClick={() => {
              setCompletionFilter('all');
              setPaymentFilter('all');
            }}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 'bold',
              border: '2px solid #ef4444',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#ef4444',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.color = '#ef4444';
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Appointments List */}
      <div style={{ minHeight: '400px', position: 'relative' }}>
        {loading && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'start',
            paddingTop: '100px',
            zIndex: 10,
            borderRadius: '16px'
          }}>
            <div style={{ fontSize: '18px', color: '#fff', fontWeight: 'bold' }}>Loading appointments...</div>
          </div>
        )}

        {(() => {
          // Apply filters
          const filteredAppointments = appointments.filter(apt => {
            // Completion filter
            if (completionFilter === 'completed' && !apt.isCompleted) return false;
            if (completionFilter === 'not-completed' && apt.isCompleted) return false;

            // Payment filter (only for completed appointments)
            if (paymentFilter !== 'all' && apt.isCompleted) {
              if (paymentFilter === 'paid' && apt.paymentStatus !== 'paid') return false;
              if (paymentFilter === 'unpaid' && apt.paymentStatus !== 'unpaid') return false;
            }

            return true;
          });

          return filteredAppointments.length === 0 ? (
             <div style={{
               background: 'rgba(255, 255, 255, 0.95)',
               backdropFilter: 'blur(10px)',
               WebkitBackdropFilter: 'blur(10px)',
               borderRadius: '16px',
               border: '1px solid rgba(147, 51, 234, 0.1)',
               boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
               padding: '60px 20px',
               textAlign: 'center'
             }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: '#9333ea' }}>
                {activeTab === 'today' && <Calendar size={64} />}
                {activeTab === 'tomorrow' && <CalendarDays size={64} />}
                {activeTab === 'future' && <CalendarRange size={64} />}
                {activeTab === 'past' && <History size={64} />}
              </div>
               <h3 style={{ fontSize: '20px', color: '#111827', marginBottom: '8px', fontWeight: 'bold' }}>
                 {appointments.length === 0
                   ? `No appointments ${activeTab === 'past' ? 'in the past' : `for ${activeTab}`}`
                   : 'No appointments match your filters'
                 }
               </h3>
               <p style={{ fontSize: '14px', color: '#6b7280' }}>
                 {appointments.length === 0
                   ? (activeTab === 'past' ? 'Your appointment history will appear here' : 'Check back later for updates')
                   : 'Try adjusting your filters'
                 }
               </p>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
                Showing {filteredAppointments.length} of {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
              </div>
              {filteredAppointments.map((appointment) => (
                <div key={appointment.id} style={{ display: 'flex', gap: '12px', alignItems: 'start', marginBottom: '16px' }}>
                  <div style={{ paddingTop: '24px' }}>
                    <input
                      type="checkbox"
                      checked={selectedAppointments.includes(appointment.id)}
                      onChange={() => toggleSelection(appointment.id)}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <AppointmentCard
                      appointment={appointment}
                      onMarkAsDone={handleMarkAsDone}
                      onViewNotes={handleViewNotes}
                      onRemind={handleRemind}
                      showActions={activeTab !== 'past' || appointment.medicalNotesCount > 0}
                    />
                  </div>
                </div>
              ))}
            </div>

          );
        })()}
      </div>

      {/* Bulk Action Bar */}
      {
        selectedAppointments.length > 0 && (
          <div style={{
            position: 'fixed',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#1e293b',
            color: 'white',
            padding: '16px 32px',
            borderRadius: '100px',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: 1000,
            animation: 'slideUp 0.3s ease-out'
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
              {selectedAppointments.length} selected
            </div>
            <div style={{ height: '24px', width: '1px', backgroundColor: '#475569' }}></div>
            <button
              onClick={handleRequestBulkComplete}
              disabled={isBulkCompleting}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '20px',
                fontWeight: 'bold',
                cursor: isBulkCompleting ? 'wait' : 'pointer',
                transition: 'transform 0.1s'
              }}
            >
              {isBulkCompleting ? 'Processing...' : <><Check size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Mark as Done</>}
            </button>
            <button
              onClick={handleBulkRemind}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'transform 0.1s'
              }}
            >
              <Mail size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Send Reminders
            </button>
            <button
              onClick={() => setSelectedAppointments([])}
              style={{
                backgroundColor: 'transparent',
                color: '#94a3b8',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                padding: '4px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        )
      }

      {/* Mark as Done Modal */}
      {
        showMarkAsDoneModal && (
          <MarkAsDoneModal
            appointment={selectedAppointment}
            onClose={() => setShowMarkAsDoneModal(false)}
            onSubmit={handleSubmitCompletion}
          />
        )
      }

      {/* Notes Modal */}
      {
        showNotesModal && (
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
          }} onClick={() => setShowNotesModal(false)}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '800px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                    Medical Notes
                  </h2>
                  <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>
                    {selectedAppointment?.patient?.fullName} - {new Date(selectedAppointment?.appointmentDate).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setShowNotesModal(false)}
                  style={{
                    padding: '8px',
                    fontSize: '20px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#999',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <button
                  onClick={handleAddNote}
                  style={{
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5568d3'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#667eea'}
                >
                  <Plus size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Add New Note
                </button>
              </div>

              <MedicalNotesList notes={appointmentNotes} onEdit={handleEditNote} />
            </div>
          </div>
        )
      }

      {/* Add/Edit Note Modal */}
      {
        showAddNoteModal && (
          <AddNoteModal
            appointment={selectedAppointment}
            existingNote={selectedNote}
            onClose={() => {
              setShowAddNoteModal(false);
              setShowNotesModal(true);
            }}
            onSubmit={handleSubmitNote}
          />
        )
      }

      <ConfirmationModal
        isOpen={showBulkCompleteModal}
        title="Complete Multiple Appointments"
        message={`Are you sure you want to mark ${selectedAppointments.length} appointments as completed? This will set them as done with the default consultation price.`}
        confirmText={isBulkCompleting ? "Completing..." : "Complete All"}
        onConfirm={executeBulkComplete}
        onCancel={() => setShowBulkCompleteModal(false)}
        type="info"
      />
    </div >
  );
};

export default DoctorAppointments;
