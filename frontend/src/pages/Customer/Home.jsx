import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Search as SearchIcon, MapPin, Globe, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const [courts, setCourts] = useState([]);
  const [realCourts, setRealCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [searchCity, setSearchCity] = useState('');
  const [searchSport, setSearchSport] = useState('');
  const navigate = useNavigate();

  const fetchAllCourts = async () => {
    try {
      const res = await api.get('/courts/search');
      setCourts(res.data);
    } catch (err) {
      console.error("Failed to fetch all courts fallback", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchWithIPLocation = async () => {
      // Try freeipapi.com first (reliable and CORS friendly)
      try {
        const response = await fetch('https://freeipapi.com/api/json');
        const data = await response.json();
        if (data.latitude && data.longitude) {
          setLocation({ lat: data.latitude, lng: data.longitude });
          fetchNearbyCourts(data.latitude, data.longitude);
          return;
        }
      } catch (err) {
        console.warn("FreeIPAPI failed, trying ipapi.co...", err);
      }

      // Try ipapi.co as second choice
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.latitude && data.longitude) {
          setLocation({ lat: data.latitude, lng: data.longitude });
          fetchNearbyCourts(data.latitude, data.longitude);
          return;
        }
      } catch (err) {
        console.error("IP fallback failed entirely", err);
        fetchAllCourts();
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation({ lat, lng });
          fetchNearbyCourts(lat, lng);
        },
        (error) => {
          console.warn("Geolocation blocked, falling back to IP location", error);
          fetchWithIPLocation();
        },
        { timeout: 4000 }
      );
    } else {
      fetchWithIPLocation();
    }
  }, []);

  const fetchNearbyCourts = async (lat, lng) => {
    try {
      // Fetch both our DB courts and real-world map courts
      const [dbRes, realRes] = await Promise.allSettled([
        api.get(`/courts/nearby?lat=${lat}&lng=${lng}&radius=50000`),
        api.get(`/courts/nearby-real?lat=${lat}&lng=${lng}&radius=5000`)
      ]);

      let dbCourts = [];
      if (dbRes.status === 'fulfilled') {
        dbCourts = dbRes.value.data;
      }

      // If no nearby partner courts are found in the 50km radius, load all courts as a fallback
      if (dbCourts.length === 0) {
        try {
          const allRes = await api.get('/courts/search');
          dbCourts = allRes.data;
        } catch (err) {
          console.error("Failed to fetch all courts fallback inside nearby", err);
        }
      }
      setCourts(dbCourts);

      if (realRes.status === 'fulfilled') {
        setRealCourts(realRes.value.data);
      } else {
        setRealCourts([]);
      }
    } catch (err) {
      console.error(err);
      fetchAllCourts();
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/courts/search?city=${searchCity}&sport=${searchSport}`);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-slate-950 text-white py-24 px-8 text-center mt-4 border border-white/10 shadow-2xl">
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black tracking-tight mb-6"
          >
            Find the perfect court. <br/> <span className="text-gray-400">Play anywhere.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 mb-10"
          >
            Discover premium indoor sports facilities and real-world public courts near you instantly.
          </motion.p>
          
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSearch} 
            className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto"
          >
            <div className="flex-[1.5] bg-background text-foreground rounded-2xl flex items-center px-4 shadow-lg relative overflow-hidden group">
              <MapPin size={20} className="text-muted-foreground mr-2 shrink-0" />
              <input 
                type="text" 
                placeholder="City or 'Near Me'" 
                value={searchCity} 
                onChange={(e) => setSearchCity(e.target.value)}
                className="w-full py-4 pr-24 bg-transparent outline-none font-medium"
              />
              <button 
                type="button"
                onClick={() => {
                  setSearchCity("Detecting...");
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      async (pos) => {
                        try {
                          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
                          const data = await res.json();
                          setSearchCity(data.address?.city || data.address?.town || data.address?.state_district || "Near Me");
                          fetchNearbyCourts(pos.coords.latitude, pos.coords.longitude);
                        } catch {
                          setSearchCity("Near Me");
                        }
                      },
                      () => setSearchCity("")
                    );
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-secondary text-secondary-foreground text-xs font-bold px-3 py-2 rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Locate Me
              </button>
            </div>
            <div className="flex-1 bg-background text-foreground rounded-2xl flex items-center px-4 shadow-lg">
              <SearchIcon size={20} className="text-muted-foreground mr-2" />
              <input 
                type="text" 
                placeholder="Sport (e.g. Badminton)" 
                value={searchSport} 
                onChange={(e) => setSearchSport(e.target.value)}
                className="w-full py-4 bg-transparent outline-none font-medium"
              />
            </div>
            <button type="submit" className="bg-accent text-accent-foreground px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg">
              Search
            </button>
          </motion.form>
        </div>
        
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-accent/30 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-purple-500/20 blur-3xl rounded-full"></div>
      </section>

      {/* AuraPlay Partner Courts Section */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-foreground text-background rounded-lg">
            <Activity size={24} />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Partner Courts Near You</h2>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[1,2,3].map(i => (
              <div key={i} className="h-72 w-80 bg-secondary rounded-2xl animate-pulse shrink-0"></div>
            ))}
          </div>
        ) : courts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courts.map(court => (
              <motion.div 
                whileHover={{ y: -8 }}
                key={court.id} 
                className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border cursor-pointer group"
                onClick={() => navigate(`/courts/${court.id}`)}
              >
                <div 
                  className="h-48 bg-secondary bg-cover bg-center group-hover:scale-105 transition-transform duration-500" 
                  style={{ backgroundImage: `url(${court.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1629901925121-8a141c2a42f4?auto=format&fit=crop&q=80'})` }} 
                />
                <div className="p-5 relative bg-card z-10">
                  <div className="absolute -top-6 right-5 bg-foreground text-background text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                    ₹{court.pricePerHour}/hr
                  </div>
                  <h3 className="text-xl font-bold mb-1 line-clamp-1">{court.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-1">{court.city}, {court.state}</p>
                  <div className="flex items-center justify-between">
                    <span className="inline-block bg-secondary text-secondary-foreground text-xs font-semibold px-2 py-1 rounded-md uppercase tracking-wider">
                      {court.sportType}
                    </span>
                    <span className="text-accent font-semibold text-sm">Book Now &rarr;</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-secondary/50 border border-border rounded-2xl p-12 text-center">
            <p className="text-muted-foreground text-lg">No partner courts found nearby. Try searching another city or see public courts below.</p>
          </div>
        )}
      </section>

      {/* Real-World Public Courts Section (Overpass API) */}
      <section className="pt-8 border-t border-border">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-secondary text-foreground rounded-lg">
            <Globe size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Public Facilities (Real-World)</h2>
            <p className="text-muted-foreground mt-1">Fetched live from local maps</p>
          </div>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[1,2,3].map(i => (
              <div key={i} className="h-40 w-full bg-secondary rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : realCourts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {realCourts.slice(0, 9).map(court => (
              <div key={court.id} className="bg-card p-5 rounded-2xl border border-border hover:border-foreground/20 transition-colors flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold line-clamp-1">{court.name}</h3>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium mt-1">{court.sport}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-sm">
                  <span className="text-muted-foreground truncate pr-4">{court.address}</span>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${court.lat},${court.lon}`} 
                    target="_blank" rel="noreferrer"
                    className="text-foreground font-semibold shrink-0 hover:underline"
                  >
                    Directions
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-secondary/50 border border-border rounded-2xl p-8 text-center">
            <p className="text-muted-foreground">
              {location 
                ? "No public real-world sports facilities found within 5km of your location on OpenStreetMap." 
                : "Location access is required to fetch real-world courts, or none are nearby."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
