package com.auraplays.backend.dto.request;

import lombok.Data;

@Data
public class GameRequest {
    private String title;
    private Long slotId;
    private String sportType;
    private String skillLevelRequired;
    private int maxPlayers;
    private double pricePerPlayer;
}
