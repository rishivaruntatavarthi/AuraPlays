import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Check, X, Calendar, Clock, User, Phone, MapPin } from 'lucide-react';

const BookingRequests = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const courtsRes = await api.get('/courts/my');
      const allBookings = [];
      for (const court of courtsRes.data) {
        const bookRes = await api.get(`/bookings/court/${court.id}`);
        allBookings.push(...bookRes.data);
      }
      // Sort by latest
      allBookings.sort((a, b) => b.id - a.id);
      setBookings(allBookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleAction = async (id, action) => {
    try {
      await api.put(`/bookings/${id}/${action}`);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} booking`);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8 border-b border-border pb-4">
        <h2 className="text-3xl font-black tracking-tight text-foreground">Booking Requests</h2>
        <p className="text-muted-foreground mt-2 text-lg">Manage incoming reservations for all your courts.</p>
      </div>
      
      {bookings.length > 0 ? (
        <div className="grid gap-6">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-card border border-border rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 hover:shadow-md transition-shadow">
              
              <div className="flex-1 space-y-4 w-full">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <MapPin className="text-accent" size={24} />
                    {booking.slot?.court?.name}
                  </h3>
                  <span className={`px-4 py-1.5 text-xs font-bold rounded-full uppercase tracking-widest ${booking.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : booking.status === 'APPROVED' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    {booking.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground bg-secondary/30 p-5 rounded-2xl border border-border">
                  <div className="flex items-center gap-3">
                    <div className="bg-card p-2 rounded-lg shadow-sm"><Calendar size={18} className="text-accent" /></div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Date</p>
                      <span className="font-bold text-foreground text-base">{booking.slot?.slotDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-card p-2 rounded-lg shadow-sm"><Clock size={18} className="text-accent" /></div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Time</p>
                      <span className="font-bold text-foreground text-base">{booking.slot?.startTime?.substring(0, 5)} - {booking.slot?.endTime?.substring(0, 5)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-card p-2 rounded-lg shadow-sm"><User size={18} className="text-accent" /></div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Player Name</p>
                      <span className="font-bold text-foreground text-base">{booking.bookedForName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-card p-2 rounded-lg shadow-sm"><Phone size={18} className="text-accent" /></div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Contact</p>
                      <span className="font-bold text-foreground text-base">{booking.bookedForPhone}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {booking.status === 'PENDING' && (
                <div className="flex lg:flex-col gap-3 w-full lg:w-auto mt-4 lg:mt-0 pt-4 lg:pt-0 border-t border-border lg:border-t-0 lg:border-l lg:pl-6">
                  <button onClick={() => handleAction(booking.id, 'approve')} className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-4 lg:py-3 rounded-xl font-bold hover:bg-green-600 transition-colors shadow-sm">
                    <Check size={20} /> Approve
                  </button>
                  <button onClick={() => handleAction(booking.id, 'reject')} className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-red-500 text-white px-6 py-4 lg:py-3 rounded-xl font-bold hover:bg-red-600 transition-colors shadow-sm">
                    <X size={20} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-secondary/30 border border-border rounded-3xl p-16 text-center text-muted-foreground shadow-sm">
          <Calendar size={64} className="mx-auto mb-6 opacity-20" />
          <p className="text-xl font-semibold text-foreground">No bookings found</p>
          <p className="text-lg mt-2">You have no booking requests across your courts at this time.</p>
        </div>
      )}
    </div>
  );
};

export default BookingRequests;
