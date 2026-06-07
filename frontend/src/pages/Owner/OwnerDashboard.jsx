import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { PlusCircle, Edit, Calendar, BookOpen, Tag, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const OwnerDashboard = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/courts/my')
      .then(res => setCourts(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteCourt = async (courtId) => {
    if (window.confirm('Are you sure you want to delete this court? This action cannot be undone.')) {
      try {
        await api.delete(`/courts/${courtId}`);
        setCourts(courts.filter(c => c.id !== courtId));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete court');
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">Owner Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your venues, slots, and bookings.</p>
        </div>
        <button onClick={() => navigate('/owner/court/new')} className="bg-accent text-accent-foreground px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5 transition-all w-full sm:w-auto justify-center">
          <PlusCircle size={20} /> Add New Court
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
        <h2 className="text-2xl font-bold">My Courts</h2>
        <span className="bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full">{courts.length} venues</span>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin w-10 h-10 border-4 border-accent border-t-transparent rounded-full" />
        </div>
      ) : courts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courts.map((court, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={court.id} 
              className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col"
            >
              {/* Cover Image */}
              <div 
                className="h-32 bg-secondary relative bg-cover bg-center"
                style={{ backgroundImage: `url(${court.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1629901925121-8a141c2a42f4?auto=format&fit=crop&q=80'})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <button 
                  onClick={() => handleDeleteCourt(court.id)}
                  className="absolute top-3 right-3 bg-black/40 hover:bg-destructive text-white p-2 rounded-full transition-colors backdrop-blur-sm z-20"
                  title="Delete Court"
                >
                  <Trash2 size={18} />
                </button>
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <h3 className="text-xl font-bold text-white truncate drop-shadow-md">{court.name}</h3>
                  <p className="text-white/90 text-sm truncate font-medium drop-shadow-md">{court.city}, {court.state}</p>
                </div>
              </div>
              
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Link to={`/owner/court/${court.id}/edit`} className="flex flex-col items-center justify-center gap-2 bg-secondary/50 hover:bg-secondary text-foreground p-3 rounded-xl transition-colors border border-border">
                    <Edit size={20} className="text-accent" />
                    <span className="text-xs font-semibold">Edit Info</span>
                  </Link>
                  <Link to={`/owner/court/${court.id}/slots`} className="flex flex-col items-center justify-center gap-2 bg-secondary/50 hover:bg-secondary text-foreground p-3 rounded-xl transition-colors border border-border">
                    <Calendar size={20} className="text-accent" />
                    <span className="text-xs font-semibold">Time Slots</span>
                  </Link>
                  <Link to={`/owner/court/${court.id}/offers/new`} className="flex flex-col items-center justify-center gap-2 bg-secondary/50 hover:bg-secondary text-foreground p-3 rounded-xl transition-colors border border-border col-span-2">
                    <Tag size={20} className="text-accent" />
                    <span className="text-xs font-semibold">Manage Offers</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-3xl p-12 text-center shadow-sm">
          <BookOpen size={64} className="mx-auto text-muted mb-4 opacity-50" />
          <p className="text-xl font-semibold text-foreground">You haven't added any courts yet.</p>
          <p className="text-muted-foreground mt-2 mb-6">Start earning by listing your sports venue today.</p>
          <button onClick={() => navigate('/owner/court/new')} className="bg-accent text-accent-foreground px-8 py-3 rounded-xl font-bold shadow-lg hover:-translate-y-0.5 transition-all">
            Add Your First Court
          </button>
        </div>
      )}

      <div className="mt-12 text-center pb-8">
        <Link to="/owner/bookings" className="inline-flex items-center gap-3 bg-secondary text-foreground border border-border px-8 py-4 rounded-2xl font-bold shadow-sm hover:bg-secondary/80 hover:shadow-md transition-all text-lg">
          <BookOpen size={24} className="text-accent" /> Manage All Bookings
        </Link>
      </div>
    </div>
  );
};

export default OwnerDashboard;
