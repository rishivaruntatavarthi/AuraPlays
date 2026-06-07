package com.auraplays.backend.controller;

import com.auraplays.backend.dto.request.ReviewRequest;
import com.auraplays.backend.entity.Review;
import com.auraplays.backend.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Review> addReview(
            @Valid @RequestBody ReviewRequest request,
            Principal principal) {
        return new ResponseEntity<>(reviewService.addReview(request, principal.getName()), HttpStatus.CREATED);
    }

    @GetMapping("/court/{courtId}")
    public ResponseEntity<List<Review>> getCourtReviews(@PathVariable Long courtId) {
        return ResponseEntity.ok(reviewService.getCourtReviews(courtId));
    }
}
