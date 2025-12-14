import React, { useState } from 'react';

const MarkAsDoneModal = ({ appointment, onClose, onSubmit }) => {
  const [finalPrice, setFinalPrice] = useState(appointment?.price || '');
  const [completionNotes, setCompletionNotes] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('unpaid');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!finalPrice || parseFloat(finalPrice) <= 0) {
      alert('Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(parseFloat(finalPrice), completionNotes, paymentStatus);
      onClose();
    } catch (error) {
      alert('Failed to mark appointment as done: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
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
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
            Mark Appointment as Done
          </h2>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>
            Complete appointment for {appointment?.patient?.fullName}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Final Price */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '8px'
            }}>
              Final Price <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '16px',
                color: '#666'
              }}>$</span>
              <input
                type="number"
                step="0.01"
                value={finalPrice}
                onChange={(e) => setFinalPrice(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 28px',
                  fontSize: '16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                placeholder="0.00"
              />
            </div>

          </div>

          {/* Payment Status */}
          <div style={{ marginBottom: '20px' }}>
             <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
                Payment Status <span style={{ color: '#ef4444' }}>*</span>
             </label>
             <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                   <input 
                      type="radio" 
                      name="paymentStatus" 
                      value="unpaid" 
                      checked={paymentStatus === 'unpaid'} 
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      style={{ marginRight: '8px', width: '18px', height: '18px' }}
                   />
                   <span style={{ color: '#ef4444', fontWeight: '500' }}>Unpaid</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                   <input 
                      type="radio" 
                      name="paymentStatus" 
                      value="paid" 
                      checked={paymentStatus === 'paid'} 
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      style={{ marginRight: '8px', width: '18px', height: '18px' }}
                   />
                   <span style={{ color: '#10b981', fontWeight: '500' }}>Paid</span>
                </label>
             </div>
          </div>

          {/* Completion Notes */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '8px'
            }}>
              Completion Notes (Optional)
            </label>
            <textarea
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              placeholder="Add any notes about the appointment completion..."
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 'bold',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: 'white',
                color: '#666',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#f9fafb')}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#10b981',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#059669')}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
            >
              {loading ? 'Saving...' : '✓ Mark as Done'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarkAsDoneModal;
