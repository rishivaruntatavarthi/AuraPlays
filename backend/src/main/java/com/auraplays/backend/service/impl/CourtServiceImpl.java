package com.auraplays.backend.service.impl;

import com.auraplays.backend.dto.request.CourtRequest;
import com.auraplays.backend.dto.request.SlotRequest;
import com.auraplays.backend.entity.Court;
import com.auraplays.backend.entity.CourtImage;
import com.auraplays.backend.entity.CourtSlot;
import com.auraplays.backend.entity.User;
import com.auraplays.backend.entity.enums.Status;
import com.auraplays.backend.exception.ResourceNotFoundException;
import com.auraplays.backend.exception.UnauthorizedException;
import com.auraplays.backend.repository.CourtImageRepository;
import com.auraplays.backend.repository.CourtRepository;
import com.auraplays.backend.repository.CourtSlotRepository;
import com.auraplays.backend.repository.UserRepository;
import com.auraplays.backend.service.CourtService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CourtServiceImpl implements CourtService {

    private final CourtRepository courtRepository;
    private final UserRepository userRepository;
    private final CourtImageRepository courtImageRepository;
    private final CourtSlotRepository courtSlotRepository;

    @Override
    public Court createCourt(CourtRequest request, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", ownerEmail));

        Court court = Court.builder()
                .owner(owner)
                .name(request.getName())
                .description(request.getDescription())
                .sportType(request.getSportType())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .pricePerHour(request.getPricePerHour())
                .isAutoApproveEnabled(request.isAutoApproveEnabled())
                .status(Status.ACTIVE)
                .build();

        return courtRepository.save(court);
    }

    @Override
    public Court updateCourt(Long courtId, CourtRequest request, String ownerEmail) {
        Court court = getCourtDetails(courtId);
        
        if (!court.getOwner().getEmail().equals(ownerEmail)) {
            throw new UnauthorizedException("You do not have permission to update this court.");
        }

        court.setName(request.getName());
        court.setDescription(request.getDescription());
        court.setSportType(request.getSportType());
        court.setAddress(request.getAddress());
        court.setCity(request.getCity());
        court.setState(request.getState());
        court.setLatitude(request.getLatitude());
        court.setLongitude(request.getLongitude());
        court.setPricePerHour(request.getPricePerHour());
        court.setAutoApproveEnabled(request.isAutoApproveEnabled());

        return courtRepository.save(court);
    }

    @Override
    public void uploadCourtImage(Long courtId, MultipartFile file, String ownerEmail) {
        Court court = getCourtDetails(courtId);
        
        if (!court.getOwner().getEmail().equals(ownerEmail)) {
            throw new UnauthorizedException("You do not have permission to upload images for this court.");
        }

        try {
            // For MVP: Base64 encode the image
            String base64Image = Base64.getEncoder().encodeToString(file.getBytes());
            String imageUrl = "data:" + file.getContentType() + ";base64," + base64Image;

            // Clear existing images to ensure the new one replaces them
            if (court.getImages() != null) {
                court.getImages().clear();
            } else {
                court.setImages(new ArrayList<>());
            }

            CourtImage courtImage = CourtImage.builder()
                    .court(court)
                    .imageUrl(imageUrl)
                    .isPrimary(true)
                    .build();

            court.getImages().add(courtImage);
            courtRepository.save(court);
        } catch (Exception e) {
            throw new RuntimeException("Failed to process image upload", e);
        }
    }

    @Override
    public List<Court> getMyCourts(String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", ownerEmail));
        return courtRepository.findByOwner(owner);
    }

    @Override
    public List<Court> getNearbyCourts(double lat, double lng, double radiusKm) {
        return courtRepository.findNearbyCourts(lat, lng, radiusKm);
    }

    @Override
    public List<Court> searchCourts(String city, String sportType) {
        if (city == null) city = "";
        if (sportType == null) sportType = "";
        return courtRepository.findByCityContainingIgnoreCaseAndSportTypeContainingIgnoreCase(city, sportType);
    }

    @Override
    public Court getCourtDetails(Long id) {
        return courtRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Court", "id", id));
    }

    @Override
    public List<CourtSlot> createSlots(Long courtId, List<SlotRequest> requests, String ownerEmail) {
        Court court = getCourtDetails(courtId);
        
        if (!court.getOwner().getEmail().equals(ownerEmail)) {
            throw new UnauthorizedException("You do not have permission to create slots for this court.");
        }

        List<CourtSlot> createdSlots = new ArrayList<>();
        for (SlotRequest req : requests) {
            String sportType = req.getSportType();
            if (sportType == null || sportType.trim().isEmpty()) {
                sportType = court.getSportType();
            }
            CourtSlot slot = CourtSlot.builder()
                    .court(court)
                    .slotDate(req.getSlotDate())
                    .startTime(req.getStartTime())
                    .endTime(req.getEndTime())
                    .sportType(sportType)
                    .isAvailable(true)
                    .build();
            createdSlots.add(slot);
        }

        return courtSlotRepository.saveAll(createdSlots);
    }

    @Override
    public List<CourtSlot> getAvailableSlots(Long courtId, LocalDate date) {
        Court court = getCourtDetails(courtId);
        return courtSlotRepository.findAvailableSlots(court, date);
    }

    @Override
    public List<CourtSlot> getSlotsForDate(Long courtId, LocalDate date, String ownerEmail) {
        Court court = getCourtDetails(courtId);
        if (!court.getOwner().getEmail().equals(ownerEmail)) {
            throw new UnauthorizedException("You do not have permission to view all slots for this court.");
        }
        return courtSlotRepository.findByCourtAndSlotDateOrderByStartTimeAsc(court, date);
    }

    @Override
    public void deleteSlot(Long courtId, Long slotId, String ownerEmail) {
        Court court = getCourtDetails(courtId);
        if (!court.getOwner().getEmail().equals(ownerEmail)) {
            throw new UnauthorizedException("You do not have permission to delete slots for this court.");
        }
        CourtSlot slot = courtSlotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("CourtSlot", "id", slotId));
        
        if (!slot.getCourt().getId().equals(courtId)) {
            throw new com.auraplays.backend.exception.BadRequestException("Slot does not belong to this court.");
        }
        
        courtSlotRepository.delete(slot);
    }

    @Override
    public void deleteCourt(Long courtId, String ownerEmail) {
        Court court = getCourtDetails(courtId);
        if (!court.getOwner().getEmail().equals(ownerEmail)) {
            throw new UnauthorizedException("You do not have permission to delete this court.");
        }
        courtRepository.delete(court);
    }
}
