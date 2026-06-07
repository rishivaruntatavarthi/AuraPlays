package com.auraplays.backend.controller;

import com.auraplays.backend.dto.request.BookingRequest;
import com.auraplays.backend.entity.Booking;
import com.auraplays.backend.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Booking> createBooking(
            @Valid @RequestBody BookingRequest request,
            Principal principal) {
        return new ResponseEntity<>(bookingService.createBookingRequest(request, principal.getName()), HttpStatus.CREATED);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('COURT_OWNER')")
    public ResponseEntity<Booking> approveBooking(
            @PathVariable Long id,
            Principal principal) {
        return ResponseEntity.ok(bookingService.approveBooking(id, principal.getName()));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('COURT_OWNER')")
    public ResponseEntity<Booking> rejectBooking(
            @PathVariable Long id,
            Principal principal) {
        return ResponseEntity.ok(bookingService.rejectBooking(id, principal.getName()));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<Booking>> getMyBookings(Principal principal) {
        return ResponseEntity.ok(bookingService.getMyBookings(principal.getName()));
    }

    @GetMapping("/court/{courtId}")
    @PreAuthorize("hasRole('COURT_OWNER')")
    public ResponseEntity<List<Booking>> getCourtBookings(
            @PathVariable Long courtId,
            Principal principal) {
        return ResponseEntity.ok(bookingService.getCourtBookings(courtId, principal.getName()));
    }

    @GetMapping("/pending-notification")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<Booking>> getPendingNotifications(Principal principal) {
        return ResponseEntity.ok(bookingService.getPendingNotifications(principal.getName()));
    }
}
