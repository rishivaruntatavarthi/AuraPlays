import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import api from './services/api';

// Components
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationPopup from './components/NotificationPopup';
import Footer from './components/Footer';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Home from './pages/Customer/Home';
import Search from './pages/Customer/Search';
import CourtDetail from './pages/Customer/CourtDetail';
import MyBookings from './pages/Customer/MyBookings';
import Profile from './pages/Customer/Profile';
import PlayFeed from './pages/Customer/PlayFeed';
import OwnerDashboard from './pages/Owner/OwnerDashboard';
import ManageCourt from './pages/Owner/ManageCourt';
import ManageSlots from './pages/Owner/ManageSlots';
import BookingRequests from './pages/Owner/BookingRequests';
import AddOffer from './pages/Owner/AddOffer';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageUsers from './pages/Admin/ManageUsers';
import ManageCourts from './pages/Admin/ManageCourts';

const AppRoutes = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user && user.role === 'CUSTOMER') {
      // Check for pending notifications
      api.get('/bookings/pending-notification')
        .then(res => {
          if (res.data && res.data.length > 0) {
            setNotifications(res.data);
          }
        })
        .catch(err => console.error("Failed to fetch notifications", err));
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300 relative">
      <Navbar />
      
      {notifications.map(booking => (
        <NotificationPopup 
          key={booking.id} 
          booking={booking} 
          onClose={() => setNotifications(prev => prev.filter(n => n.id !== booking.id))} 
        />
      ))}

      {/* pb-24 on mobile to account for BottomNav */}
      <main className="flex-grow container mx-auto px-4 pt-8 pb-24 sm:pb-8">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/courts/search" element={<Search />} />
          <Route path="/courts/:id" element={<CourtDetail />} />

          {/* Shared Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['CUSTOMER', 'COURT_OWNER']} />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Customer Routes */}
          <Route path="/" element={<Home />} />
          <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/play" element={<PlayFeed />} />
          </Route>

          {/* Owner Routes */}
          <Route element={<ProtectedRoute allowedRoles={['COURT_OWNER']} />}>
            <Route path="/owner" element={<OwnerDashboard />} />
            <Route path="/owner/court/new" element={<ManageCourt />} />
            <Route path="/owner/court/:id/edit" element={<ManageCourt />} />
            <Route path="/owner/court/:id/slots" element={<ManageSlots />} />
            <Route path="/owner/court/:id/offers/new" element={<AddOffer />} />
            <Route path="/owner/bookings" element={<BookingRequests />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/courts" element={<ManageCourts />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      <BottomNav />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
