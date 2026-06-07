package com.auraplays.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class SlotRequest {
    @NotNull
    private LocalDate slotDate;
    @NotNull
    private LocalTime startTime;
    @NotNull
    private LocalTime endTime;

    private String sportType;
}
