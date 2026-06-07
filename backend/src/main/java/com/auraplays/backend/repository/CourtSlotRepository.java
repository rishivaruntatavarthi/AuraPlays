package com.auraplays.backend.repository;

import com.auraplays.backend.entity.Court;
import com.auraplays.backend.entity.CourtSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface CourtSlotRepository extends JpaRepository<CourtSlot, Long> {
    @Query("SELECT s FROM CourtSlot s WHERE s.court = :court AND s.slotDate = :slotDate AND s.isAvailable = true")
    List<CourtSlot> findAvailableSlots(@org.springframework.data.repository.query.Param("court") Court court, @org.springframework.data.repository.query.Param("slotDate") LocalDate slotDate);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM CourtSlot s WHERE s.id = :id")
    java.util.Optional<CourtSlot> findByIdForUpdate(@org.springframework.data.repository.query.Param("id") Long id);

    List<CourtSlot> findByCourtAndSlotDateOrderByStartTimeAsc(Court court, LocalDate slotDate);

    @Query("SELECT s FROM CourtSlot s WHERE s.court = :court AND s.slotDate = :date AND s.isAvailable = true AND s.startTime < :endTime AND s.endTime > :startTime")
    List<CourtSlot> findOverlappingAvailableSlots(
            @org.springframework.data.repository.query.Param("court") Court court,
            @org.springframework.data.repository.query.Param("date") LocalDate date,
            @org.springframework.data.repository.query.Param("startTime") LocalTime startTime,
            @org.springframework.data.repository.query.Param("endTime") LocalTime endTime
    );
}
