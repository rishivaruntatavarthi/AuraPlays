import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, ArrowRight, Mail, Lock, User, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', role: 'CUSTOMER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl flex rounded-3xl overflow-hidden shadow-2xl bg-card border border-border">
        {/* Left Side - Brand/Image */}
        <div className="hidden lg:flex lg:w-1/2 bg-foreground p-12 flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-2 text-3xl font-black tracking-tighter text-background group">
              <div className="bg-background text-foreground p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                <Activity size={28} strokeWidth={3} />
              </div>
              <span>Aura<span className="text-gray-400">Play</span></span>
            </Link>
          </div>
          
          <div className="relative z-10 text-background mt-24">
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Elevate your <br/> sports experience.
            </h1>
            <p className="text-xl text-gray-400">
              Create an account to book courts, manage games, or list your own venues to thousands of players.
            </p>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute top-1/4 -right-16 w-64 h-64 bg-background rounded-full opacity-5 blur-3xl"></div>
        </div>

        {/* Right Side - Register Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="lg:hidden flex items-center gap-2 text-2xl font-black tracking-tighter text-foreground mb-8">
              <div className="bg-foreground text-background p-1 rounded-md">
                <Activity size={20} strokeWidth={3} />
              </div>
              <span>AuraPlay</span>
            </div>

            <h2 className="text-3xl font-bold mb-2">Create an account</h2>
            <p className="text-muted-foreground mb-8">Sign up in seconds to start booking.</p>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="bg-destructive/10 text-destructive text-sm p-4 rounded-xl mb-6 border border-destructive/20"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                      <User size={18} />
                    </div>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name} 
                      onChange={handleChange} 
                      required 
                      className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl focus:ring-2 focus:ring-foreground focus:border-transparent transition-all outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                      <Phone size={18} />
                    </div>
                    <input 
                      type="text" 
                      name="phone"
                      value={formData.phone} 
                      onChange={handleChange} 
                      className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl focus:ring-2 focus:ring-foreground focus:border-transparent transition-all outline-none"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                    className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl focus:ring-2 focus:ring-foreground focus:border-transparent transition-all outline-none"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                    className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-xl focus:ring-2 focus:ring-foreground focus:border-transparent transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">I want to...</label>
                <select 
                  name="role" 
                  value={formData.role} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-xl focus:ring-2 focus:ring-foreground focus:border-transparent transition-all outline-none appearance-none"
                >
                  <option value="CUSTOMER">Book courts as a Player</option>
                  <option value="COURT_OWNER">List my courts as an Owner</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-foreground text-background py-3.5 rounded-xl font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:hover:scale-100 mt-6"
              >
                {loading ? 'Creating account...' : 'Create Account'} <ArrowRight size={18} />
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-muted-foreground text-sm">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-foreground hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;
