package com.auraplays.backend.service;

import com.auraplays.backend.dto.request.ReviewRequest;
import com.auraplays.backend.entity.Review;

import java.util.List;

public interface ReviewService {
    Review addReview(ReviewRequest request, String customerEmail);
    List<Review> getCourtReviews(Long courtId);
}
