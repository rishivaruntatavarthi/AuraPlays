package com.auraplays.backend.service.impl;

import com.auraplays.backend.dto.request.OfferRequest;
import com.auraplays.backend.entity.Court;
import com.auraplays.backend.entity.Offer;
import com.auraplays.backend.exception.ResourceNotFoundException;
import com.auraplays.backend.exception.UnauthorizedException;
import com.auraplays.backend.repository.CourtRepository;
import com.auraplays.backend.repository.OfferRepository;
import com.auraplays.backend.service.OfferService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OfferServiceImpl implements OfferService {

    private final OfferRepository offerRepository;
    private final CourtRepository courtRepository;

    @Override
    public Offer createOffer(OfferRequest request, String ownerEmail) {
        Court court = courtRepository.findById(request.getCourtId())
                .orElseThrow(() -> new ResourceNotFoundException("Court", "id", request.getCourtId()));

        if (!court.getOwner().getEmail().equals(ownerEmail)) {
            throw new UnauthorizedException("You do not have permission to create offers for this court.");
        }

        Offer offer = Offer.builder()
                .court(court)
                .title(request.getTitle())
                .description(request.getDescription())
                .bonusMinutes(request.getBonusMinutes())
                .minHours(request.getMinHours())
                .validFrom(request.getValidFrom())
                .validTo(request.getValidTo())
                .isActive(true)
                .build();

        return offerRepository.save(offer);
    }

    @Override
    public List<Offer> getCourtOffers(Long courtId) {
        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new ResourceNotFoundException("Court", "id", courtId));
        return offerRepository.findByCourtAndIsActiveTrue(court);
    }
}
