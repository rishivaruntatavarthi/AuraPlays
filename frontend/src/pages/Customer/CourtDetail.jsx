import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import SlotPicker from '../../components/SlotPicker';
import { MapPin, Tag, Star, Activity, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const CourtDetail = () => {
  const { id } = useParams();
  const [court, setCourt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [offers, setOffers] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please log in to submit a review.");
    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', { courtId: id, rating: newReview.rating, comment: newReview.comment });
      setReviews(prev => [res.data, ...prev]);
      setNewReview({ rating: 5, comment: '' });
      alert("Review submitted successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    Promise.all([
      api.get(`/courts/${id}`),
      api.get(`/reviews/court/${id}`),
      api.get(`/offers/court/${id}`)
    ])
      .then(([courtRes, reviewRes, offerRes]) => {
        setCourt(courtRes.data);
        setReviews(reviewRes.data);
        setOffers(offerRes.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center h-96">
      <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!court) return <div className="text-center py-20 text-2xl font-bold text-muted-foreground">Court not found</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-12">
      
      {/* Header & Gallery Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-10"
      >
        <div 
          className="h-[400px] lg:h-[500px] bg-secondary rounded-3xl bg-cover bg-center shadow-xl border border-border"
          style={{ backgroundImage: `url(${court.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1629901925121-8a141c2a42f4?auto=format&fit=crop&q=80'})` }} 
        />
        
        <div className="flex flex-col justify-center space-y-6">
          <div>
            <div className="inline-block bg-accent/10 text-accent font-bold px-3 py-1 rounded-full text-sm tracking-wider uppercase mb-4 border border-accent/20">
              {court.sportType}
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-none mb-3">{court.name}</h1>
            <p className="text-xl text-muted-foreground flex items-center gap-2">
              <MapPin size={20} className="text-accent" />
              {court.address}, {court.city}, {court.state}
            </p>
          </div>

          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-foreground">₹{court.pricePerHour}</span>
            <span className="text-muted-foreground font-medium mb-1">/ hour</span>
          </div>

          <p className="text-lg leading-relaxed text-foreground/80 bg-secondary/30 p-6 rounded-2xl border border-border">
            {court.description}
          </p>
        </div>
      </motion.div>

      {/* Offers Banner */}
      {offers.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-accent text-accent-foreground p-6 rounded-2xl shadow-lg flex flex-col md:flex-row items-center gap-4"
        >
          <div className="bg-background/20 p-3 rounded-full">
            <Tag size={28} />
          </div>
          <div>
            <h3 className="font-bold text-xl mb-1">Special Offers Available</h3>
            <ul className="flex flex-wrap gap-4">
              {offers.map(o => (
                <li key={o.id} className="bg-background/10 px-4 py-2 rounded-lg font-medium">
                  {o.title}: {o.description}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      {/* Booking Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="bg-card border border-border p-8 rounded-3xl shadow-sm">
            <h2 className="text-3xl font-bold tracking-tight mb-8 flex items-center gap-3">
              <Clock size={28} className="text-accent" />
              Book a Slot
            </h2>
            <SlotPicker courtId={id} pricePerHour={court.pricePerHour} />
          </div>
        </div>

        {/* Reviews Section */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3 mb-6">
            <Star size={28} className="text-yellow-500 fill-yellow-500" />
            Reviews
          </h2>
          
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="bg-secondary/50 p-6 rounded-2xl border border-border hover:bg-secondary transition-colors">
                  <div className="flex justify-between items-center mb-3">
                    <strong className="font-bold text-lg">{review.customer?.name || 'Anonymous Player'}</strong>
                    <div className="flex gap-1 text-yellow-500">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}
                    </div>
                  </div>
                  <p className="text-foreground/80 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-secondary/50 border border-border rounded-2xl p-8 text-center text-muted-foreground">
              <p>No reviews yet. Be the first to play and review!</p>
            </div>
          )}

          {/* Add Review Form */}
          {user && user.role === 'CUSTOMER' && (
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm mt-8">
              <h3 className="text-xl font-bold mb-4">Write a Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        type="button" 
                        key={star} 
                        onClick={() => setNewReview({...newReview, rating: star})}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star size={32} className={star <= newReview.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Comment</label>
                  <textarea 
                    value={newReview.comment}
                    onChange={e => setNewReview({...newReview, comment: e.target.value})}
                    required
                    rows="3"
                    className="w-full p-4 rounded-xl border border-border bg-background font-medium shadow-sm outline-none focus:ring-2 focus:ring-accent resize-none"
                    placeholder="Share your experience playing here..."
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={submittingReview}
                  className="bg-accent text-accent-foreground px-6 py-3 rounded-xl font-bold shadow-lg hover:-translate-y-0.5 transition-transform disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default CourtDetail;
