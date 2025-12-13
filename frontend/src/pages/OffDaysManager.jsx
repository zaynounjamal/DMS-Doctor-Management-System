import React, { useState, useEffect } from 'react';
import { getOffDays, addOffDay, deleteOffDay } from '../doctorApi';

const OffDaysManager = () => {
  const [offDays, setOffDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [reason, setReason] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    loadOffDays();
  }, []);

  const loadOffDays = async () => {
    try {
      setLoading(true);
      const data = await getOffDays();
      setOffDays(data);
    } catch (error) {
      console.error('Failed to load off days:', error);
      alert('Failed to load off days');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOffDay = async (e) => {
    e.preventDefault();
    try {
      await addOffDay(selectedDate, reason);
      
      await loadOffDays();
      setSelectedDate('');
      setReason('');
      setShowAddForm(false);
      alert('Off day added successfully!');
    } catch (error) {
      console.error('Failed to add off day:', error);
      alert(error.message || 'Failed to add off day');
    }
  };

  const handleDeleteOffDay = async (id) => {
    if (!confirm('Are you sure you want to remove this off day?')) return;
    
    try {
      await deleteOffDay(id);
      
      await loadOffDays();
      alert('Off day removed successfully!');
    } catch (error) {
      console.error('Failed to delete off day:', error);
      alert('Failed to delete off day');
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const futureOffDays = offDays.filter(o => o.offDate >= today);
  const pastOffDays = offDays.filter(o => o.offDate < today);

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#333' }}>
            Off Days Management
          </h1>
          <p style={{ margin: '8px 0 0 0', fontSize: '16px', color: '#666' }}>
            Manage your unavailable dates
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: '12px 24px',
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
          {showAddForm ? '✕ Cancel' : '➕ Add Off Day'}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold' }}>Add New Off Day</h3>
          <form onSubmit={handleAddOffDay}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#666' }}>
                Date *
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={today}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '14px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '6px',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#666' }}>
                Reason (Optional)
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Vacation, Conference, Personal"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '14px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '6px',
                  outline: 'none'
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#10b981',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Add Off Day
            </button>
          </form>
        </div>
      )}

      {/* Future Off Days */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#333' }}>
          Upcoming Off Days ({futureOffDays.length})
        </h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading...</div>
        ) : futureOffDays.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
            <p style={{ fontSize: '16px', color: '#666' }}>No upcoming off days scheduled</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {futureOffDays.map((offDay) => (
              <div
                key={offDay.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
                    {new Date(offDay.offDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  {offDay.reason && (
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      Reason: {offDay.reason}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteOffDay(offDay.id)}
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
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Off Days */}
      {pastOffDays.length > 0 && (
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#333' }}>
            Past Off Days ({pastOffDays.length})
          </h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {pastOffDays.map((offDay) => (
              <div
                key={offDay.id}
                style={{
                  backgroundColor: '#f9fafb',
                  borderRadius: '12px',
                  padding: '16px',
                  opacity: 0.7
                }}
              >
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>
                  {new Date(offDay.offDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                {offDay.reason && (
                  <div style={{ fontSize: '14px', color: '#999' }}>
                    Reason: {offDay.reason}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OffDaysManager;
