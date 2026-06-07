package com.auraplays.backend.service;

import com.auraplays.backend.dto.request.CourtRequest;
import com.auraplays.backend.dto.request.SlotRequest;
import com.auraplays.backend.entity.Court;
import com.auraplays.backend.entity.CourtSlot;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

public interface CourtService {
    
    Court createCourt(CourtRequest request, String ownerEmail);
    
    Court updateCourt(Long courtId, CourtRequest request, String ownerEmail);
    
    void uploadCourtImage(Long courtId, MultipartFile file, String ownerEmail);
    
    List<Court> getMyCourts(String ownerEmail);
    
    List<Court> getNearbyCourts(double lat, double lng, double radiusKm);
    
    List<Court> searchCourts(String city, String sportType);
    
    Court getCourtDetails(Long id);
    
    List<CourtSlot> createSlots(Long courtId, List<SlotRequest> requests, String ownerEmail);
    
    List<CourtSlot> getAvailableSlots(Long courtId, LocalDate date);
    
    List<CourtSlot> getSlotsForDate(Long courtId, LocalDate date, String ownerEmail);
    
    void deleteSlot(Long courtId, Long slotId, String ownerEmail);
    
    void deleteCourt(Long courtId, String ownerEmail);
}
