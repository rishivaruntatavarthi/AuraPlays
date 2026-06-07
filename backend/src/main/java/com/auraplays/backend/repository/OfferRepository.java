package com.auraplays.backend.repository;

import com.auraplays.backend.entity.Court;
import com.auraplays.backend.entity.Offer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Long> {
    List<Offer> findByCourtAndIsActiveTrue(Court court);
}
