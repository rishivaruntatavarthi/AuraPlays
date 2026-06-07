package com.auraplays.backend.repository;

import com.auraplays.backend.entity.Court;
import com.auraplays.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourtRepository extends JpaRepository<Court, Long> {
    
    List<Court> findByOwner(User owner);
    
    java.util.Optional<Court> findByName(String name);

    @Query(value = "SELECT DISTINCT c.* FROM courts c " +
           "LEFT JOIN court_slots cs ON cs.court_id = c.id " +
           "WHERE (LOWER(c.city) LIKE LOWER(CONCAT('%', :city, '%')) " +
           "OR LOWER(c.state) LIKE LOWER(CONCAT('%', :city, '%')) " +
           "OR LOWER(c.address) LIKE LOWER(CONCAT('%', :city, '%'))) " +
           "AND (LOWER(c.sport_type) LIKE LOWER(CONCAT('%', :sportType, '%')) " +
           "OR LOWER(cs.sport_type) LIKE LOWER(CONCAT('%', :sportType, '%')))", 
           nativeQuery = true)
    List<Court> findByCityContainingIgnoreCaseAndSportTypeContainingIgnoreCase(
            @Param("city") String city, 
            @Param("sportType") String sportType
    );

    // Haversine formula query for nearby courts
    @Query(value = "SELECT c.*, " +
            "( 6371 * acos( cos( radians(:lat) ) * cos( radians( c.latitude ) ) " +
            "* cos( radians( c.longitude ) - radians(:lng) ) + sin( radians(:lat) ) " +
            "* sin( radians( c.latitude ) ) ) ) AS distance " +
            "FROM courts c " +
            "WHERE c.court_status = 'ACTIVE' " +
            "HAVING distance <= :radius " +
            "ORDER BY distance", nativeQuery = true)
    List<Court> findNearbyCourts(@Param("lat") double lat, @Param("lng") double lng, @Param("radius") double radiusKm);
}
