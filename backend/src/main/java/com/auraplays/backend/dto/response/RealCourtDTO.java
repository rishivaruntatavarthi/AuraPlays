package com.auraplays.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RealCourtDTO {
    private String id;
    private String name;
    private String sport;
    private double lat;
    private double lon;
    private String address;
}
