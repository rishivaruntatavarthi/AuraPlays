import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { MapPin, Save, X, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

const ManageCourt = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '', description: '', sportType: '', address: '',
    city: '', state: '', latitude: 0, longitude: 0, pricePerHour: 0,
    isAutoApproveEnabled: true
  });
  
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      api.get(`/courts/${id}`)
        .then(res => setFormData({
          ...res.data,
          latitude: res.data.latitude || 0,
          longitude: res.data.longitude || 0
        }))
        .catch(err => console.error(err));
    }
  }, [id, isEditing]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleGetLocation = () => {
    setLocationLoading(true);

    const fallbackToIPLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.latitude && data.longitude) {
          setFormData(prev => ({
            ...prev,
            latitude: data.latitude,
            longitude: data.longitude,
            city: data.city || prev.city,
            state: data.region || prev.state
          }));
        } else {
          throw new Error("Invalid IP location data");
        }
      } catch (err) {
        console.error("IP Location Fallback Error:", err);
        alert("Could not fetch location automatically. Please enter coordinates manually.");
      } finally {
        setLocationLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          setLocationLoading(false);
        },
        (error) => {
          console.warn("Geolocation permission denied or failed. Falling back to IP location...", error);
          fallbackToIPLocation();
        },
        { timeout: 5000 } // Add a 5 second timeout so it falls back quickly if blocked
      );
    } else {
      fallbackToIPLocation();
    }
  };

  const [selectedImage, setSelectedImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        pricePerHour: parseFloat(formData.pricePerHour)
      };

      let courtId = id;
      if (isEditing) {
        await api.put(`/courts/${id}`, payload);
      } else {
        const res = await api.post('/courts', payload);
        courtId = res.data.id;
      }

      if (selectedImage && courtId) {
        const imgData = new FormData();
        imgData.append('file', selectedImage);
        await api.post(`/courts/${courtId}/images`, imgData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      navigate('/owner');
    } catch (err) {
      if (err.response?.data?.errors) {
        const errorMessages = Object.entries(err.response.data.errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join('\n');
        alert(`Validation failed:\n${errorMessages}`);
      } else {
        alert(err.response?.data?.message || err.message || 'Operation failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-3xl shadow-lg overflow-hidden"
      >
        <div className="bg-foreground text-background p-8">
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <MapPin size={28} />
            {isEditing ? 'Edit Court Listing' : 'Add New Court'}
          </h2>
          <p className="text-background/80 mt-2">Provide the details of your sports facility to list it on AuraPlay.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-foreground/80">Court Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:ring-2 focus:ring-foreground focus:border-transparent transition-all outline-none font-medium"
                placeholder="e.g. SmashZone Arena"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-foreground/80">Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                rows="4" 
                required 
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:ring-2 focus:ring-foreground focus:border-transparent transition-all outline-none font-medium resize-none"
                placeholder="Describe your court's amenities, flooring type, etc."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80">Sport Type</label>
              <input 
                type="text" 
                name="sportType" 
                value={formData.sportType} 
                onChange={handleChange} 
                placeholder="e.g. Badminton, Tennis" 
                required 
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:ring-2 focus:ring-foreground focus:border-transparent transition-all outline-none font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80">Price Per Hour (₹)</label>
              <input 
                type="number" 
                name="pricePerHour" 
                value={formData.pricePerHour} 
                onChange={handleChange} 
                required 
                min="0" 
                step="0.01" 
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:ring-2 focus:ring-foreground focus:border-transparent transition-all outline-none font-medium"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-foreground/80">Street Address</label>
              <input 
                type="text" 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:ring-2 focus:ring-foreground focus:border-transparent transition-all outline-none font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80">City</label>
              <input 
                type="text" 
                name="city" 
                value={formData.city} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:ring-2 focus:ring-foreground focus:border-transparent transition-all outline-none font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80">State</label>
              <input 
                type="text" 
                name="state" 
                value={formData.state} 
                onChange={handleChange} 
                required 
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:ring-2 focus:ring-foreground focus:border-transparent transition-all outline-none font-medium"
              />
            </div>

            {/* GPS Coordinates Section */}
            <div className="md:col-span-2 mt-4 p-5 bg-secondary/50 border border-border rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Navigation size={18} className="text-accent" />
                  GPS Coordinates
                </h3>
                <button 
                  type="button" 
                  onClick={handleGetLocation}
                  disabled={locationLoading}
                  className="text-xs bg-accent text-accent-foreground px-3 py-1.5 rounded-lg font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-1"
                >
                  {locationLoading ? 'Fetching...' : 'Get Current Location'}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Latitude</label>
                  <input 
                    type="number" 
                    name="latitude" 
                    value={formData.latitude} 
                    onChange={handleChange} 
                    required 
                    step="any" 
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-foreground focus:border-transparent transition-all outline-none font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Longitude</label>
                  <input 
                    type="number" 
                    name="longitude" 
                    value={formData.longitude} 
                    onChange={handleChange} 
                    required 
                    step="any" 
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-foreground focus:border-transparent transition-all outline-none font-mono text-sm"
                  />
                </div>
              </div>
            </div>
            
            {/* Court Image Section */}
            <div className="md:col-span-2 mt-4 p-5 bg-secondary/30 border border-border rounded-2xl">
              <h3 className="font-semibold flex items-center gap-2 mb-2 text-foreground">
                Court Image
              </h3>
              
              {/* Existing Image Preview */}
              {formData.images && formData.images.length > 0 && !selectedImage && (
                <div className="mb-4 relative w-full h-48 rounded-xl overflow-hidden border border-border bg-secondary">
                  <img 
                    src={formData.images[0].imageUrl} 
                    alt="Current Court" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full font-bold backdrop-blur-sm">
                    Current Image
                  </div>
                </div>
              )}

              {/* Selected New Image Preview */}
              {selectedImage && (
                <div className="mb-4 relative w-full h-48 rounded-xl overflow-hidden border border-border bg-secondary">
                  <img 
                    src={URL.createObjectURL(selectedImage)} 
                    alt="New Court Preview" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs px-2.5 py-1 rounded-full font-bold shadow-md">
                    New Selected Image (Preview)
                  </div>
                  <button 
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-destructive text-white p-1.5 rounded-full backdrop-blur-sm transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files[0])}
                className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-accent-foreground hover:file:bg-accent/80 transition-all cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-2">Upload a high-quality photo of your court. This will be shown to customers.</p>
            </div>

            {/* Auto Approve Settings */}
            <div className="md:col-span-2 mt-4 p-5 bg-secondary/30 border border-border rounded-2xl flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Automatic Booking Approval</h3>
                <p className="text-sm text-muted-foreground mt-1">If enabled, bookings are instantly confirmed. If disabled, you must manually approve requests.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="isAutoApproveEnabled"
                  checked={formData.isAutoApproveEnabled || false}
                  onChange={(e) => setFormData({...formData, isAutoApproveEnabled: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>
          </div>
          
          <div className="mt-10 flex gap-4 pt-6 border-t border-border">
            <button 
              type="button" 
              onClick={() => navigate('/owner')} 
              className="flex-1 py-4 bg-secondary text-foreground rounded-xl font-bold hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
            >
              <X size={20} /> Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-[2] py-4 bg-foreground text-background rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
            >
              <Save size={20} /> {loading ? 'Saving...' : (isEditing ? 'Update Court' : 'Publish Court')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ManageCourt;
