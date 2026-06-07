import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const SlotPicker = ({ courtId, pricePerHour }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingForm, setBookingForm] = useState({ bookedForName: '', bookedForPhone: '' });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (date) {
      setLoading(true);
      api.get(`/courts/${courtId}/slots?date=${date}`)
        .then(res => setSlots(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
      setSelectedSlot(null);
    }
  }, [courtId, date]);

  const [isHostingGame, setIsHostingGame] = useState(false);
  const [gameForm, setGameForm] = useState({
    title: '',
    sportType: 'Badminton',
    skillLevelRequired: 'Any',
    maxPlayers: 4,
    pricePerPlayer: 0
  });

  useEffect(() => {
    if (selectedSlot) {
      setGameForm(prev => ({
        ...prev,
        sportType: selectedSlot.sportType || '',
        title: user ? `${user.name}'s ${selectedSlot.sportType || ''} Game` : ''
      }));
    }
  }, [selectedSlot, user]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      const res = await api.post('/bookings', {
        slotId: selectedSlot.id,
        bookedForName: bookingForm.bookedForName || user.name,
        bookedForPhone: bookingForm.bookedForPhone || user.phone
      });
      
      const booking = res.data;

      const finishBookingFlow = async () => {
        if (isHostingGame) {
          try {
            await api.post('/games/host', {
              title: gameForm.title || `${user.name}'s Game`,
              slotId: selectedSlot.id,
              sportType: gameForm.sportType,
              skillLevelRequired: gameForm.skillLevelRequired,
              maxPlayers: parseInt(gameForm.maxPlayers),
              pricePerPlayer: parseFloat(gameForm.pricePerPlayer)
            });
            alert('Booking confirmed and Game Hosted successfully!');
            navigate('/play');
          } catch (err) {
            alert('Booking succeeded, but failed to host game: ' + (err.response?.data?.message || err.message));
          }
        } else {
          alert('Booking confirmed successfully!');
        }
        setSelectedSlot(null);
        setIsHostingGame(false);
        const slotsRes = await api.get(`/courts/${courtId}/slots?date=${date}`);
        setSlots(slotsRes.data);
      };

      if (booking.status === 'APPROVED') {
        // Auto-approved, launch Razorpay immediately
        try {
          const orderRes = await api.post(`/payments/create-order/${booking.id}`);
          const paymentData = orderRes.data;

          if (paymentData.keyId === 'mock') {
            // Simulate successful payment for test mode without real Razorpay keys
            alert('Test Mode: Simulating a successful Razorpay payment since no keys are configured.');
            try {
              await api.post('/payments/verify', {
                bookingId: booking.id,
                razorpayOrderId: paymentData.gatewayOrderId,
                razorpayPaymentId: 'pay_mock_' + Math.floor(Math.random()*1000000),
                razorpaySignature: 'mock_signature'
              });
              await finishBookingFlow();
            } catch (verifyErr) {
              alert('Payment verification failed.');
            }
            return;
          }

          const options = {
            key: paymentData.keyId,
            amount: paymentData.amount * 100,
            currency: paymentData.currency,
            name: 'AuraPlay Booking',
            description: `Payment for slot ${selectedSlot.startTime}`,
            order_id: paymentData.gatewayOrderId,
            handler: async function (response) {
              try {
                await api.post('/payments/verify', {
                  bookingId: booking.id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                });
                await finishBookingFlow();
              } catch (verifyErr) {
                alert('Payment verification failed.');
              }
            },
            prefill: {
              name: bookingForm.bookedForName || user.name,
              email: user.email,
              contact: bookingForm.bookedForPhone || user.phone
            },
            theme: { color: '#3b82f6' }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        } catch (paymentErr) {
          alert('Booking created, but failed to initialize payment.');
        }
      } else {
        alert('Booking request sent successfully! Waiting for owner approval.');
        if (isHostingGame) {
          alert('Game will be published to the Play feed once the owner approves your booking.');
        }
        setSelectedSlot(null);
        const slotsRes = await api.get(`/courts/${courtId}/slots?date=${date}`);
        setSlots(slotsRes.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to book slot');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Select Date:</label>
        <input 
          type="date" 
          value={date} 
          min={new Date().toISOString().split('T')[0]}
          onChange={(e) => setDate(e.target.value)} 
          style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
        />
      </div>

      {loading ? (
        <p>Loading slots...</p>
      ) : slots.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2rem' }}>
          {slots.map(slot => (
            <button 
              key={slot.id}
              onClick={() => setSelectedSlot(slot)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                border: selectedSlot?.id === slot.id ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                backgroundColor: selectedSlot?.id === slot.id ? 'var(--accent-light)' : 'var(--bg-card)',
                color: selectedSlot?.id === slot.id ? 'var(--accent)' : 'var(--text-primary)',
                fontWeight: '500'
              }}
            >
              {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
              {slot.sportType && <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>{slot.sportType}</div>}
            </button>
          ))}
        </div>
      ) : (
        <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>No slots available for this date.</p>
      )}

      {selectedSlot && (
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
          <h3 className="text-xl font-bold mb-4">Confirm Booking</h3>
          <p className="mb-4">Time: <strong>{selectedSlot.startTime.substring(0, 5)} - {selectedSlot.endTime.substring(0, 5)}</strong> | Price: <strong>₹{pricePerHour}</strong></p>
          
          {(!user || user.role === 'CUSTOMER') ? (
            <form onSubmit={handleBook} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold">Booking For (Name)</label>
                  <input 
                    type="text" 
                    className="p-3 rounded-lg border bg-background"
                    value={bookingForm.bookedForName} 
                    onChange={e => setBookingForm({...bookingForm, bookedForName: e.target.value})} 
                    placeholder={user?.name || 'Enter name'}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold">Contact Phone</label>
                  <input 
                    type="text" 
                    className="p-3 rounded-lg border bg-background"
                    value={bookingForm.bookedForPhone} 
                    onChange={e => setBookingForm({...bookingForm, bookedForPhone: e.target.value})} 
                    placeholder={user?.phone || 'Enter phone'}
                  />
                </div>
              </div>

              <div className="mt-4 p-4 rounded-xl border border-border bg-background">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded border-gray-300 text-accent focus:ring-accent"
                    checked={isHostingGame}
                    onChange={(e) => setIsHostingGame(e.target.checked)}
                  />
                  <div>
                    <span className="font-bold block">Host a Game (Playo Mode)</span>
                    <span className="text-sm text-muted-foreground">Open this slot to the community and find players to join you!</span>
                  </div>
                </label>

                {isHostingGame && (
                  <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label className="text-sm font-semibold">Game Title</label>
                      <input 
                        type="text" 
                        required
                        className="p-3 rounded-lg border bg-background"
                        value={gameForm.title} 
                        onChange={e => setGameForm({...gameForm, title: e.target.value})} 
                        placeholder="e.g. Friendly Match, Need 2 more!"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold">Sport Type</label>
                      <input 
                        type="text" 
                        required
                        className="p-3 rounded-lg border bg-background"
                        value={gameForm.sportType} 
                        onChange={e => setGameForm({...gameForm, sportType: e.target.value})} 
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold">Skill Level</label>
                      <select 
                        className="p-3 rounded-lg border bg-background"
                        value={gameForm.skillLevelRequired}
                        onChange={e => setGameForm({...gameForm, skillLevelRequired: e.target.value})}
                      >
                        <option value="Any">Any Skill Level</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold">Max Players Total</label>
                      <input 
                        type="number" 
                        required min="2" max="20"
                        className="p-3 rounded-lg border bg-background"
                        value={gameForm.maxPlayers} 
                        onChange={e => setGameForm({...gameForm, maxPlayers: e.target.value})} 
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold">Split Price (per player)</label>
                      <input 
                        type="number" 
                        required min="0"
                        className="p-3 rounded-lg border bg-background"
                        value={gameForm.pricePerPlayer} 
                        onChange={e => setGameForm({...gameForm, pricePerPlayer: e.target.value})} 
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <button type="submit" className="w-full bg-accent text-accent-foreground p-4 rounded-xl font-bold mt-4 shadow-lg hover:scale-[1.02] transition-transform">
                {user ? (isHostingGame ? 'Pay & Host Game' : 'Request Booking') : 'Login to Book'}
              </button>
            </form>
          ) : (
            <p className="text-muted-foreground italic">Booking is only available for Customer accounts.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SlotPicker;
