package com.auraplays.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingRequest {
    @NotNull
    private Long slotId;
    @NotBlank
    private String bookedForName;
    @NotBlank
    private String bookedForPhone;
}
