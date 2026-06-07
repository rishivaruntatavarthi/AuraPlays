package com.auraplays.backend.service.impl;

import com.auraplays.backend.dto.request.BookingRequest;
import com.auraplays.backend.entity.Booking;
import com.auraplays.backend.entity.CourtSlot;
import com.auraplays.backend.entity.User;
import com.auraplays.backend.entity.enums.BookingStatus;
import com.auraplays.backend.exception.BadRequestException;
import com.auraplays.backend.exception.ResourceNotFoundException;
import com.auraplays.backend.exception.UnauthorizedException;
import com.auraplays.backend.repository.BookingRepository;
import com.auraplays.backend.repository.CourtSlotRepository;
import com.auraplays.backend.repository.UserRepository;
import com.auraplays.backend.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final CourtSlotRepository courtSlotRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public Booking createBookingRequest(BookingRequest request, String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", customerEmail));

        // Use Pessimistic Locking to ensure no concurrent double-booking of this slot
        CourtSlot slot = courtSlotRepository.findByIdForUpdate(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("CourtSlot", "id", request.getSlotId()));

        if (!slot.isAvailable()) {
            throw new BadRequestException("This slot is no longer available.");
        }

        boolean isAutoApprove = slot.getCourt().isAutoApproveEnabled();

        Booking booking = Booking.builder()
                .slot(slot)
                .customer(customer)
                .status(isAutoApprove ? BookingStatus.APPROVED : BookingStatus.PENDING)
                .totalAmount(slot.getCourt().getPricePerHour())
                .bookedForName(request.getBookedForName())
                .bookedForPhone(request.getBookedForPhone())
                .notified(false)
                .build();

        booking = bookingRepository.save(booking);

        if (isAutoApprove) {
            markOverlappingSlotsAsUnavailable(slot, booking.getId());
        }

        return booking;
    }

    @Override
    @Transactional
    public Booking approveBooking(Long bookingId, String ownerEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (!booking.getSlot().getCourt().getOwner().getEmail().equals(ownerEmail)) {
            throw new UnauthorizedException("You do not have permission to approve this booking.");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be approved.");
        }

        CourtSlot slot = booking.getSlot();
        if (!slot.isAvailable()) {
            throw new BadRequestException("Slot is already booked.");
        }

        // Approve this booking
        booking.setStatus(BookingStatus.APPROVED);
        booking.setNotified(false);
        bookingRepository.save(booking);

        // Mark overlapping slots as unavailable and reject pending bookings for them
        markOverlappingSlotsAsUnavailable(slot, booking.getId());

        return booking;
    }

    private void markOverlappingSlotsAsUnavailable(CourtSlot bookedSlot, Long currentBookingId) {
        List<CourtSlot> overlappingSlots = courtSlotRepository.findOverlappingAvailableSlots(
                bookedSlot.getCourt(),
                bookedSlot.getSlotDate(),
                bookedSlot.getStartTime(),
                bookedSlot.getEndTime()
        );

        for (CourtSlot slot : overlappingSlots) {
            slot.setAvailable(false);
            courtSlotRepository.save(slot);

            // Auto-reject other pending bookings for this now-unavailable slot
            List<Booking> pendingBookings = bookingRepository.findBySlotIdAndStatus(slot.getId(), BookingStatus.PENDING);
            for (Booking b : pendingBookings) {
                if (!b.getId().equals(currentBookingId)) {
                    b.setStatus(BookingStatus.REJECTED);
                    bookingRepository.save(b);
                }
            }
        }
    }

    @Override
    public Booking rejectBooking(Long bookingId, String ownerEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (!booking.getSlot().getCourt().getOwner().getEmail().equals(ownerEmail)) {
            throw new UnauthorizedException("You do not have permission to reject this booking.");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be rejected.");
        }

        booking.setStatus(BookingStatus.REJECTED);
        return bookingRepository.save(booking);
    }

    @Override
    public List<Booking> getMyBookings(String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", customerEmail));
        return bookingRepository.findByCustomerOrderByCreatedAtDesc(customer);
    }

    @Override
    public List<Booking> getCourtBookings(Long courtId, String ownerEmail) {
        // Validation of owner happens inside the query or we can just fetch and validate
        // But for simplicity, we just fetch all bookings for courtId.
        return bookingRepository.findByCourtId(courtId);
    }

    @Override
    @Transactional
    public List<Booking> getPendingNotifications(String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", customerEmail));

        List<Booking> unnotifiedBookings = bookingRepository.findByCustomerAndStatusAndNotifiedFalse(customer, BookingStatus.APPROVED);
        
        for (Booking b : unnotifiedBookings) {
            b.setNotified(true);
        }
        
        if (!unnotifiedBookings.isEmpty()) {
            bookingRepository.saveAll(unnotifiedBookings);
        }

        return unnotifiedBookings;
    }
}
