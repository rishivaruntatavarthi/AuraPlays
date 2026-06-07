package com.auraplays.backend.repository;

import com.auraplays.backend.entity.Court;
import com.auraplays.backend.entity.Review;
import com.auraplays.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByCourtOrderByCreatedAtDesc(Court court);
    
    boolean existsByCourtAndCustomer(Court court, User customer);
}
