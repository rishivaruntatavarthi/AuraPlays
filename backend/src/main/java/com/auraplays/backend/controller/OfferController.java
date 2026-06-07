package com.auraplays.backend.controller;

import com.auraplays.backend.dto.request.OfferRequest;
import com.auraplays.backend.entity.Offer;
import com.auraplays.backend.service.OfferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.security.Principal;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
public class OfferController {

    private final OfferService offerService;

    @PostMapping
    @PreAuthorize("hasRole('COURT_OWNER')")
    public ResponseEntity<Offer> createOffer(
            @Valid @RequestBody OfferRequest request,
            Principal principal) {
        return new ResponseEntity<>(offerService.createOffer(request, principal.getName()), HttpStatus.CREATED);
    }

    @GetMapping("/court/{courtId}")
    public ResponseEntity<List<Offer>> getCourtOffers(@PathVariable Long courtId) {
        return ResponseEntity.ok(offerService.getCourtOffers(courtId));
    }
}
