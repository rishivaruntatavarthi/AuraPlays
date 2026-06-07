package com.auraplays.backend.service.impl;

import com.auraplays.backend.dto.request.ReviewRequest;
import com.auraplays.backend.entity.Court;
import com.auraplays.backend.entity.Review;
import com.auraplays.backend.entity.User;
import com.auraplays.backend.entity.Booking;
import com.auraplays.backend.entity.enums.BookingStatus;
import com.auraplays.backend.exception.BadRequestException;
import com.auraplays.backend.exception.DuplicateResourceException;
import com.auraplays.backend.exception.ResourceNotFoundException;
import com.auraplays.backend.repository.BookingRepository;
import com.auraplays.backend.repository.CourtRepository;
import com.auraplays.backend.repository.ReviewRepository;
import com.auraplays.backend.repository.UserRepository;
import com.auraplays.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final CourtRepository courtRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    @Override
    public Review addReview(ReviewRequest request, String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", customerEmail));

        Court court = courtRepository.findById(request.getCourtId())
                .orElseThrow(() -> new ResourceNotFoundException("Court", "id", request.getCourtId()));

        if (reviewRepository.existsByCourtAndCustomer(court, customer)) {
            throw new DuplicateResourceException("You have already reviewed this court.");
        }

        // Check if customer has a CONFIRMED or COMPLETED booking for this court
        List<Booking> customerBookings = bookingRepository.findByCustomerOrderByCreatedAtDesc(customer);
        boolean hasCompletedBooking = customerBookings.stream()
                .anyMatch(b -> b.getSlot().getCourt().getId().equals(court.getId()) 
                            && (b.getStatus() == BookingStatus.COMPLETED || b.getStatus() == BookingStatus.CONFIRMED));

        if (!hasCompletedBooking) {
            throw new BadRequestException("You can only review courts you have booked and paid for.");
        }

        Review review = Review.builder()
                .court(court)
                .customer(customer)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        return reviewRepository.save(review);
    }

    @Override
    public List<Review> getCourtReviews(Long courtId) {
        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new ResourceNotFoundException("Court", "id", courtId));
        return reviewRepository.findByCourtOrderByCreatedAtDesc(court);
    }
}
