import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Trash2 } from 'lucide-react';

const ManageSlots = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [sportType, setSportType] = useState('');
  const [existingSlots, setExistingSlots] = useState([]);

  useEffect(() => {
    if (date) {
      fetchSlots();
    }
  }, [date, id]);

  const fetchSlots = async () => {
    try {
      const res = await api.get(`/courts/${id}/all-slots?date=${date}`);
      setExistingSlots(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/courts/${id}/slots`, [{
        slotDate: date,
        startTime: startTime + ':00',
        endTime: endTime + ':00',
        sportType: sportType || null
      }]);
      alert('Slot added successfully');
      setStartTime('');
      setEndTime('');
      setSportType('');
      fetchSlots(); // refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add slot');
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm("Are you sure you want to delete this slot?")) return;
    try {
      await api.delete(`/courts/${id}/slots/${slotId}`);
      alert('Slot deleted successfully');
      fetchSlots(); // refresh list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete slot');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-card border border-border rounded-3xl p-8 shadow-sm">
      <h2 className="text-3xl font-black tracking-tight mb-6">Manage Time Slots</h2>
      
      <div className="mb-6">
        <label className="text-sm font-semibold mb-2 block text-muted-foreground">Select Date to Manage</label>
        <input 
          type="date" 
          value={date} 
          onChange={e => setDate(e.target.value)} 
          required 
          className="w-full p-4 rounded-xl border bg-background text-foreground font-medium shadow-sm focus:ring-2 focus:ring-accent outline-none transition-all"
        />
      </div>

      {date && (
        <>
          <div className="mb-8 p-6 bg-secondary/30 rounded-2xl border border-border">
            <h3 className="text-xl font-bold mb-4">Existing Slots on {date}</h3>
            {existingSlots.length > 0 ? (
              <ul className="space-y-3">
                {existingSlots.map(slot => (
                  <li key={slot.id} className="flex justify-between items-center p-4 bg-card rounded-xl border border-border shadow-sm">
                    <span className="font-bold text-lg">
                      {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)} 
                      {slot.sportType && <span className="text-accent ml-2 text-sm uppercase tracking-wider">{slot.sportType}</span>}
                      <span className="text-sm text-muted-foreground font-medium ml-2">{slot.available ? '' : '(Booked)'}</span>
                    </span>
                    <button 
                      onClick={() => handleDeleteSlot(slot.id)} 
                      className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4 italic">No slots exist for this date.</p>
            )}
          </div>

          <form onSubmit={handleAddSlot} className="border-t border-border pt-8">
            <h3 className="text-xl font-bold mb-4">Add New Slot</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-muted-foreground">Start Time</label>
                <input 
                  type="time" 
                  value={startTime} 
                  onChange={e => setStartTime(e.target.value)} 
                  required 
                  className="p-4 rounded-xl border bg-background font-medium shadow-sm outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-muted-foreground">End Time</label>
                <input 
                  type="time" 
                  value={endTime} 
                  onChange={e => setEndTime(e.target.value)} 
                  required 
                  className="p-4 rounded-xl border bg-background font-medium shadow-sm outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-sm font-semibold text-muted-foreground">Sport Type (Optional)</label>
                <input 
                  type="text" 
                  value={sportType} 
                  onChange={e => setSportType(e.target.value)} 
                  placeholder="e.g. Badminton, Cricket"
                  className="p-4 rounded-xl border bg-background font-medium shadow-sm outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button type="submit" className="flex-1 bg-accent text-accent-foreground py-4 rounded-xl font-bold shadow-lg hover:-translate-y-0.5 transition-all text-lg">
                Add Slot
              </button>
              <button type="button" onClick={() => navigate('/owner')} className="flex-1 bg-secondary text-foreground py-4 rounded-xl font-bold border border-border hover:bg-secondary/80 transition-colors text-lg">
                Back to Dashboard
              </button>
            </div>
          </form>
        </>
      )}
      
      {!date && (
        <button type="button" onClick={() => navigate('/owner')} className="w-full bg-secondary text-foreground py-4 rounded-xl font-bold border border-border mt-4 hover:bg-secondary/80 transition-colors text-lg">
          Back to Dashboard
        </button>
      )}
    </div>
  );
};

export default ManageSlots;
