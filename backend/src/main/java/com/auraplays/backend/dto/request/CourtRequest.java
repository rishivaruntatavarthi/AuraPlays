package com.auraplays.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CourtRequest {
    @NotBlank
    private String name;
    private String description;
    @NotBlank
    private String sportType;
    @NotBlank
    private String address;
    @NotBlank
    private String city;
    @NotBlank
    private String state;
    @NotNull
    private Double latitude;
    @NotNull
    private Double longitude;
    @NotNull
    private BigDecimal pricePerHour;
    
    @com.fasterxml.jackson.annotation.JsonProperty("isAutoApproveEnabled")
    private boolean isAutoApproveEnabled;
}
