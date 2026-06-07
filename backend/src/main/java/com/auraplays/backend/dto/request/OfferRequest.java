package com.auraplays.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class OfferRequest {
    @NotNull
    private Long courtId;
    @NotBlank
    private String title;
    private String description;
    private Integer bonusMinutes;
    private Integer minHours;
    private LocalDateTime validFrom;
    private LocalDateTime validTo;
}
