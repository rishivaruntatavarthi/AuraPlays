package com.auraplays.backend.service;

import com.auraplays.backend.dto.request.BookingRequest;
import com.auraplays.backend.entity.Booking;

import java.util.List;

public interface BookingService {
    Booking createBookingRequest(BookingRequest request, String customerEmail);
    Booking approveBooking(Long bookingId, String ownerEmail);
    Booking rejectBooking(Long bookingId, String ownerEmail);
    List<Booking> getMyBookings(String customerEmail);
    List<Booking> getCourtBookings(Long courtId, String ownerEmail);
    List<Booking> getPendingNotifications(String customerEmail);
}
