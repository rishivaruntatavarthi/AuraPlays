package com.auraplays.backend.controller;

import com.auraplays.backend.dto.request.CourtRequest;
import com.auraplays.backend.dto.request.SlotRequest;
import com.auraplays.backend.entity.Court;
import com.auraplays.backend.entity.CourtSlot;
import com.auraplays.backend.service.CourtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/courts")
@RequiredArgsConstructor
public class CourtController {

    private final CourtService courtService;
    private final com.auraplays.backend.service.OverpassService overpassService;

    @GetMapping("/nearby")
    public ResponseEntity<List<Court>> getNearbyCourts(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam double radius) {
        return ResponseEntity.ok(courtService.getNearbyCourts(lat, lng, radius));
    }

    @GetMapping("/nearby-real")
    public ResponseEntity<List<com.auraplays.backend.dto.response.RealCourtDTO>> getNearbyRealCourts(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "5000") int radius) {
        return ResponseEntity.ok(overpassService.getNearbyCourts(lat, lng, radius));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Court>> searchCourts(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String sport) {
        return ResponseEntity.ok(courtService.searchCourts(city, sport));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Court> getCourtDetails(@PathVariable Long id) {
        return ResponseEntity.ok(courtService.getCourtDetails(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('COURT_OWNER')")
    public ResponseEntity<Court> createCourt(
            @Valid @RequestBody CourtRequest request,
            Principal principal) {
        return new ResponseEntity<>(courtService.createCourt(request, principal.getName()), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COURT_OWNER')")
    public ResponseEntity<Court> updateCourt(
            @PathVariable Long id,
            @Valid @RequestBody CourtRequest request,
            Principal principal) {
        return ResponseEntity.ok(courtService.updateCourt(id, request, principal.getName()));
    }

    @PostMapping("/{id}/images")
    @PreAuthorize("hasRole('COURT_OWNER')")
    public ResponseEntity<String> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            Principal principal) {
        courtService.uploadCourtImage(id, file, principal.getName());
        return ResponseEntity.ok("Image uploaded successfully");
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('COURT_OWNER')")
    public ResponseEntity<List<Court>> getMyCourts(Principal principal) {
        return ResponseEntity.ok(courtService.getMyCourts(principal.getName()));
    }

    @PostMapping("/{id}/slots")
    @PreAuthorize("hasRole('COURT_OWNER')")
    public ResponseEntity<List<CourtSlot>> createSlots(
            @PathVariable Long id,
            @Valid @RequestBody List<SlotRequest> requests,
            Principal principal) {
        return new ResponseEntity<>(courtService.createSlots(id, requests, principal.getName()), HttpStatus.CREATED);
    }

    @GetMapping("/{id}/slots")
    public ResponseEntity<List<CourtSlot>> getAvailableSlots(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(courtService.getAvailableSlots(id, date));
    }
    @GetMapping("/{id}/all-slots")
    @PreAuthorize("hasRole('COURT_OWNER')")
    public ResponseEntity<List<CourtSlot>> getSlotsForDate(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Principal principal) {
        return ResponseEntity.ok(courtService.getSlotsForDate(id, date, principal.getName()));
    }

    @DeleteMapping("/{id}/slots/{slotId}")
    @PreAuthorize("hasRole('COURT_OWNER')")
    public ResponseEntity<String> deleteSlot(
            @PathVariable Long id,
            @PathVariable Long slotId,
            Principal principal) {
        courtService.deleteSlot(id, slotId, principal.getName());
        return ResponseEntity.ok("Slot deleted successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COURT_OWNER')")
    public ResponseEntity<String> deleteCourt(
            @PathVariable Long id,
            Principal principal) {
        courtService.deleteCourt(id, principal.getName());
        return ResponseEntity.ok("Court deleted successfully");
    }
}
