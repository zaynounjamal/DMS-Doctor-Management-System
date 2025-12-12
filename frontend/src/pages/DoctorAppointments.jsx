import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppointmentCard from '../components/AppointmentCard';
import MarkAsDoneModal from '../components/MarkAsDoneModal';
import AddNoteModal from '../components/AddNoteModal';
import MedicalNotesList from '../components/MedicalNotesList';
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
  sendReminder
} from '../doctorApi';

const DoctorAppointments = () => {
  const [searchParams] = useSearchParams();
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
  const [isBulkCompleting, setIsBulkCompleting] = useState(false);

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
      alert('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsDone = (appointment) => {
    setSelectedAppointment(appointment);
    setShowMarkAsDoneModal(true);
  };

  const handleSubmitCompletion = async (finalPrice, completionNotes) => {
    try {
      await completeAppointment(selectedAppointment.id, finalPrice, completionNotes);
      await loadAppointments(activeTab);
      setShowMarkAsDoneModal(false);
    } catch (error) {
      throw error;
    }
  };

  const handleViewNotes = async (appointment) => {
    try {
      setSelectedAppointment(appointment);
      const notes = await getAppointmentNotes(appointment.id);
      setAppointmentNotes(notes);
      setShowNotesModal(true);
    } catch (error) {
      console.error('Failed to load notes:', error);
      alert('Failed to load notes');
    }
  };

  const handleAddNote = () => {
    setSelectedNote(null);
    setShowNotesModal(false);
    setShowAddNoteModal(true);
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setShowNotesModal(false);
    setShowAddNoteModal(true);
  };

  const handleSubmitNote = async (noteText) => {
    try {
      if (selectedNote) {
        await editMedicalNote(selectedNote.id, noteText);
      } else {
        await addMedicalNote(selectedAppointment.id, noteText);
      }
      const notes = await getAppointmentNotes(selectedAppointment.id);
      setAppointmentNotes(notes);
      setShowAddNoteModal(false);
      setShowNotesModal(true);
    } catch (error) {
      throw error;
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setIsSearchMode(true);
      const data = await searchAppointments({
        query: searchQuery,
        startDate: searchStartDate,
        endDate: searchEndDate,
        status: searchStatus
      });
      setAppointments(data);
      setActiveTab('search');
    } catch (error) {
      console.error('Search failed:', error);
      alert('Search failed');
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
    setActiveTab('today');
    loadAppointments('today');
  };

  const toggleSelection = (appointmentId) => {
    setSelectedAppointments(prev => {
      if (prev.includes(appointmentId)) {
        return prev.filter(id => id !== appointmentId);
      } else {
        return [...prev, appointmentId];
      }
    });
  };

  const selectAll = () => {
    if (selectedAppointments.length === appointments.length) {
      setSelectedAppointments([]);
    } else {
      setSelectedAppointments(appointments.map(a => a.id));
    }
  };

  const handleBulkComplete = async () => {
    if (!confirm(`Mark ${selectedAppointments.length} appointments as done?`)) return;
    
    try {
      setIsBulkCompleting(true);
      await bulkCompleteAppointments(selectedAppointments);
      alert('Appointments marked as done!');
      setSelectedAppointments([]);
      if (isSearchMode) {
        handleSearch();
      } else {
        loadAppointments(activeTab);
      }
    } catch (error) {
      console.error('Bulk complete failed:', error);
      alert('Failed to complete appointments');
    } finally {
      setIsBulkCompleting(false);
    }
  };

  const handleBulkRemind = async () => {
    if (!confirm(`Send reminders to ${selectedAppointments.length} patients?`)) return;
    
    try {
      // Send sequentially
      let count = 0;
      for (const id of selectedAppointments) {
        await sendReminder(id);
        count++;
      }
      alert(`Sent ${count} reminders successfully!`);
      setSelectedAppointments([]);
    } catch (error) {
      console.error('Failed to send reminders:', error);
      alert('Failed to send some reminders');
    }
  };

  const tabs = [
    { id: 'today', label: 'Today', icon: '📅' },
    { id: 'tomorrow', label: 'Tomorrow', icon: '📆' },
    { id: 'future', label: 'Future', icon: '🔮' },
    { id: 'past', label: 'Past', icon: '📜' }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#333' }}>
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
            style={{
              padding: '10px 12px',
              fontSize: '14px',
              border: '2px solid #e5e7eb',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#333',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month" selected>This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
          
          <button
            onClick={() => {
              const period = document.getElementById('exportPeriod').value;
              const user = JSON.parse(localStorage.getItem('user') || '{}');
              const url = `http://localhost:5024/api/doctor/appointments/export?format=csv&period=${period}`;
              window.open(url, '_blank');
            }}
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
            📊 Export CSV
          </button>
          
          <button
            onClick={() => {
              const period = document.getElementById('exportPeriod').value;
              const user = JSON.parse(localStorage.getItem('user') || '{}');
              const url = `http://localhost:5024/api/doctor/appointments/export?format=pdf&period=${period}`;
              window.open(url, '_blank');
            }}
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
            📄 Export PDF
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'end' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}>Search</label>
            <input
              type="text"
              placeholder="Patient name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}>From</label>
            <input
              type="date"
              value={searchStartDate}
              onChange={(e) => setSearchStartDate(e.target.value)}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}>To</label>
            <input
              type="date"
              value={searchEndDate}
              onChange={(e) => setSearchEndDate(e.target.value)}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}>Status</label>
            <select
              value={searchStatus}
              onChange={(e) => setSearchStatus(e.target.value)}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', minWidth: '120px' }}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button
            onClick={handleSearch}
            style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Search
          </button>
          {isSearchMode && (
            <button
              onClick={clearSearch}
              style={{ padding: '10px 20px', backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
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
        borderBottom: '2px solid #e5e7eb',
        overflowX: 'auto'
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
              borderBottom: activeTab === tab.id ? '3px solid #667eea' : '3px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === tab.id ? '#667eea' : '#666',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = '#333';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = '#666';
              }
            }}
          >
            {tab.icon} {tab.label}
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
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#666' }}>Status:</span>
          <select
            value={completionFilter}
            onChange={(e) => setCompletionFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              fontSize: '14px',
              border: '2px solid #e5e7eb',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#333',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="not-completed">Not Completed</option>
          </select>
        </div>

        {/* Payment Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#666' }}>Payment:</span>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              fontSize: '14px',
              border: '2px solid #e5e7eb',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#333',
              cursor: 'pointer',
              outline: 'none'
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
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '18px', color: '#666' }}>Loading appointments...</div>
        </div>
      ) : (() => {
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
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '60px 20px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>
              {activeTab === 'today' ? '📅' : activeTab === 'tomorrow' ? '📆' : activeTab === 'future' ? '🔮' : '📜'}
            </div>
            <h3 style={{ fontSize: '20px', color: '#333', marginBottom: '8px' }}>
              {appointments.length === 0 
                ? `No appointments ${activeTab === 'past' ? 'in the past' : `for ${activeTab}`}`
                : 'No appointments match your filters'
              }
            </h3>
            <p style={{ fontSize: '14px', color: '#666' }}>
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
                    showActions={activeTab !== 'past' || appointment.medicalNotesCount > 0}
                  />
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Bulk Action Bar */}
      {selectedAppointments.length > 0 && (
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
            onClick={handleBulkComplete}
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
            {isBulkCompleting ? 'Processing...' : '✓ Mark as Done'}
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
            📧 Send Reminders
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
            ✕
          </button>
        </div>
      )}

      {/* Mark as Done Modal */}
      {showMarkAsDoneModal && (
        <MarkAsDoneModal
          appointment={selectedAppointment}
          onClose={() => setShowMarkAsDoneModal(false)}
          onSubmit={handleSubmitCompletion}
        />
      )}

      {/* Notes Modal */}
      {showNotesModal && (
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
                ✕
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
                ➕ Add New Note
              </button>
            </div>

            <MedicalNotesList notes={appointmentNotes} onEdit={handleEditNote} />
          </div>
        </div>
      )}

      {/* Add/Edit Note Modal */}
      {showAddNoteModal && (
        <AddNoteModal
          appointment={selectedAppointment}
          existingNote={selectedNote}
          onClose={() => {
            setShowAddNoteModal(false);
            setShowNotesModal(true);
          }}
          onSubmit={handleSubmitNote}
        />
      )}
    </div>
  );
};

export default DoctorAppointments;
