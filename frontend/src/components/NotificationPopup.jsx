import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationPopup = ({ booking, onClose }) => {
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed top-6 right-6 bg-green-500 text-white p-4 rounded-2xl shadow-2xl z-[1000] flex items-start gap-4 max-w-sm border border-green-400"
      >
        <CheckCircle2 size={24} className="mt-0.5 shrink-0" />
        <div className="flex-1">
          <h4 className="font-bold text-lg mb-1">Booking Approved!</h4>
          <p className="text-sm text-green-50 leading-relaxed">
            Your booking for <span className="font-semibold">{booking.slot.court.name}</span> on <span className="font-semibold">{booking.slot.slotDate}</span> at <span className="font-semibold">{booking.slot.startTime.substring(0, 5)}</span> has been approved.
          </p>
        </div>
        <button 
          onClick={onClose} 
          className="p-1 hover:bg-white/20 rounded-full transition-colors shrink-0"
        >
          <X size={18} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default NotificationPopup;
