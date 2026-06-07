import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AddOffer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    courtId: id, title: '', description: '', bonusMinutes: 0, minHours: 0, validFrom: '', validTo: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/offers/court/${id}`, {
        ...formData,
        validFrom: formData.validFrom ? new Date(formData.validFrom).toISOString() : null,
        validTo: formData.validTo ? new Date(formData.validTo).toISOString() : null,
      });
      alert('Offer added successfully');
      navigate('/owner');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add offer');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="bg-card border border-border rounded-3xl p-8 shadow-lg relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-accent opacity-10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-secondary opacity-20 blur-3xl rounded-full pointer-events-none"></div>

        <div className="relative z-10">
          <h2 className="text-4xl font-black tracking-tight mb-2">Create New Offer</h2>
          <p className="text-muted-foreground mb-8 text-lg">Set up discounts or bonus time to attract more players to your court.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-bold text-foreground">Offer Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  required 
                  placeholder="e.g. Weekend Special, Summer Discount"
                  className="w-full p-4 rounded-xl border border-border bg-background/50 font-medium shadow-sm outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
              </div>
              
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-bold text-foreground">Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  required 
                  rows="3"
                  placeholder="Describe the details of your offer..."
                  className="w-full p-4 rounded-xl border border-border bg-background/50 font-medium shadow-sm outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-foreground">Bonus Minutes (Optional)</label>
                <input 
                  type="number" 
                  value={formData.bonusMinutes} 
                  onChange={e => setFormData({...formData, bonusMinutes: e.target.value})} 
                  min="0"
                  className="w-full p-4 rounded-xl border border-border bg-background/50 font-medium shadow-sm outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-foreground">Minimum Hours Required</label>
                <input 
                  type="number" 
                  value={formData.minHours} 
                  onChange={e => setFormData({...formData, minHours: e.target.value})} 
                  min="0"
                  className="w-full p-4 rounded-xl border border-border bg-background/50 font-medium shadow-sm outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-foreground">Valid From</label>
                <input 
                  type="datetime-local" 
                  value={formData.validFrom} 
                  onChange={e => setFormData({...formData, validFrom: e.target.value})} 
                  className="w-full p-4 rounded-xl border border-border bg-background/50 font-medium shadow-sm outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-foreground">Valid To</label>
                <input 
                  type="datetime-local" 
                  value={formData.validTo} 
                  onChange={e => setFormData({...formData, validTo: e.target.value})} 
                  className="w-full p-4 rounded-xl border border-border bg-background/50 font-medium shadow-sm outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border mt-8">
              <button 
                type="submit" 
                className="flex-1 bg-accent text-accent-foreground py-4 rounded-xl font-bold shadow-lg hover:shadow-accent/30 hover:-translate-y-0.5 transition-all text-lg"
              >
                Publish Offer
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/owner')} 
                className="flex-1 bg-secondary text-foreground py-4 rounded-xl font-bold border border-border hover:bg-secondary/80 transition-colors text-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddOffer;
