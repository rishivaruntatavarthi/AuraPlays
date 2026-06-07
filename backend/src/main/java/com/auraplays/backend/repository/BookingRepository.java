package com.auraplays.backend.repository;

import com.auraplays.backend.entity.Booking;
import com.auraplays.backend.entity.Court;
import com.auraplays.backend.entity.User;
import com.auraplays.backend.entity.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    List<Booking> findByCustomerOrderByCreatedAtDesc(User customer);

    @Query("SELECT b FROM Booking b WHERE b.slot.court.id = :courtId ORDER BY b.createdAt DESC")
    List<Booking> findByCourtId(@Param("courtId") Long courtId);

    List<Booking> findByCustomerAndStatusAndNotifiedFalse(User customer, BookingStatus status);
    
    List<Booking> findBySlotIdAndStatus(Long slotId, BookingStatus status);
}
