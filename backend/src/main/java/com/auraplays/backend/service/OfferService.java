package com.auraplays.backend.service;

import com.auraplays.backend.dto.request.OfferRequest;
import com.auraplays.backend.entity.Offer;

import java.util.List;

public interface OfferService {
    Offer createOffer(OfferRequest request, String ownerEmail);
    List<Offer> getCourtOffers(Long courtId);
}
