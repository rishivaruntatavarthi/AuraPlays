import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle, IndianRupee } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchBookings = () => {
    setLoading(true);
    api.get('/bookings/my')
      .then(res => setBookings(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handlePayment = async (booking) => {
    try {
      const orderRes = await api.post(`/payments/create-order/${booking.id}`);
      const paymentData = orderRes.data;

      if (paymentData.keyId === 'mock') {
        alert('Test Mode: Simulating a successful Razorpay payment since no keys are configured.');
        try {
          await api.post('/payments/verify', {
            bookingId: booking.id,
            razorpayOrderId: paymentData.gatewayOrderId,
            razorpayPaymentId: 'pay_mock_' + Math.floor(Math.random()*1000000),
            razorpaySignature: 'mock_signature'
          });
          alert('Payment successful and booking confirmed!');
          fetchBookings();
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
        description: `Payment for slot at ${booking.slot.court.name}`,
        order_id: paymentData.gatewayOrderId,
        handler: async function (response) {
          try {
            await api.post('/payments/verify', {
              bookingId: booking.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            alert('Payment successful and booking confirmed!');
            fetchBookings();
          } catch (verifyErr) {
            alert('Payment verification failed.');
          }
        },
        prefill: {
          name: booking.bookedForName || user?.name,
          email: user?.email,
          contact: booking.bookedForPhone || user?.phone
        },
        theme: { color: '#0ea5e9' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to initialize payment.');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-10 text-center sm:text-left">
        <h2 className="text-4xl font-black tracking-tight mb-2">My Bookings</h2>
        <p className="text-muted-foreground text-lg">Manage your upcoming and past court reservations.</p>
      </div>
      
      {bookings.length > 0 ? (
        <div className="grid gap-6">
          {bookings.map((booking, index) => (
            <motion.div 
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border border-border rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex-1 space-y-4 w-full">
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    {booking.slot.court.name}
                  </h3>
                  <div className="flex flex-wrap gap-4 mt-3 text-muted-foreground font-medium text-sm">
                    <span className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-lg border border-border">
                      <Calendar size={16} className="text-accent" /> {booking.slot.slotDate}
                    </span>
                    <span className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-lg border border-border">
                      <Clock size={16} className="text-accent" /> {booking.slot.startTime.substring(0, 5)} - {booking.slot.endTime.substring(0, 5)}
                    </span>
                    <span className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-lg border border-border text-foreground font-bold">
                      <IndianRupee size={16} className="text-green-500" /> ₹{booking.totalAmount}
                    </span>
                  </div>
                </div>
                
                <div className="text-sm font-medium text-muted-foreground">
                  Booked for <span className="text-foreground">{booking.bookedForName}</span> ({booking.bookedForPhone})
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-border">
                {booking.status === 'CONFIRMED' && (
                  <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-4 py-2 rounded-xl font-bold border border-green-500/20">
                    <CheckCircle size={18} /> Confirmed
                  </div>
                )}
                {booking.status === 'REJECTED' && (
                  <div className="flex items-center gap-2 text-red-500 bg-red-500/10 px-4 py-2 rounded-xl font-bold border border-red-500/20">
                    <XCircle size={18} /> Rejected
                  </div>
                )}
                {booking.status === 'PENDING' && (
                  <div className="flex items-center gap-2 text-yellow-500 bg-yellow-500/10 px-4 py-2 rounded-xl font-bold border border-yellow-500/20">
                    <AlertCircle size={18} /> Pending Approval
                  </div>
                )}
                {booking.status === 'APPROVED' && (
                  <div className="w-full sm:w-auto">
                    <div className="flex items-center gap-2 text-blue-500 bg-blue-500/10 px-4 py-2 rounded-xl font-bold border border-blue-500/20 mb-3 justify-center sm:justify-end">
                      <CheckCircle size={18} /> Approved (Unpaid)
                    </div>
                    <button 
                      onClick={() => handlePayment(booking)}
                      className="w-full bg-accent text-accent-foreground px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2"
                    >
                      <IndianRupee size={18} /> Pay Now
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-3xl p-12 text-center shadow-sm">
          <Calendar size={64} className="mx-auto text-muted mb-4 opacity-50" />
          <p className="text-xl font-semibold text-foreground">You have no bookings yet.</p>
          <p className="text-muted-foreground mt-2">Find a court nearby and schedule your first game!</p>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
