import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, LogOut, User, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="sticky top-0 z-50 glass"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-2xl font-black tracking-tighter text-foreground group">
          <div className="p-0.5 rounded-lg group-hover:scale-110 transition-transform bg-transparent">
            <img src="/logo.png" alt="AuraPlay Logo" className="w-8 h-8 object-contain rounded-lg shadow-sm" />
          </div>
          <span className="bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">AuraPlay</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-secondary text-foreground/80 hover:text-foreground transition-colors"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          
          <div className="h-6 w-px bg-border mx-2 hidden sm:block"></div>
          
          {user ? (
            <div className="flex items-center gap-4">
              {user.role === 'CUSTOMER' && (
                <Link to="/my-bookings" className="text-sm font-medium text-foreground/80 hover:text-foreground hidden sm:block transition-colors">
                  My Bookings
                </Link>
              )}
              {user.role === 'COURT_OWNER' && (
                <Link to="/owner" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              )}
              {user.role === 'ADMIN' && (
                <Link to="/admin" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                  Admin Panel
                </Link>
              )}
              
              <div className="flex items-center gap-3 bg-secondary/50 pl-3 pr-1 py-1 rounded-full border border-border/50">
                <Link to={['CUSTOMER', 'COURT_OWNER'].includes(user.role) ? '/profile' : '#'} className="flex items-center gap-2 text-sm font-semibold">
                  <div className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center">
                    <User size={14} />
                  </div>
                  <span className="hidden sm:block pr-2">{user.name.split(' ')[0]}</span>
                </Link>
                
                <button 
                  onClick={handleLogout} 
                  className="p-1.5 rounded-full bg-background hover:bg-destructive/10 text-destructive transition-colors"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                Log in
              </Link>
              <Link to="/register" className="text-sm font-semibold bg-foreground text-background px-4 py-2 rounded-full hover:scale-105 transition-transform shadow-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
