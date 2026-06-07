package com.auraplays.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "games")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "host_id", nullable = false)
    private User host;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "slot_id", nullable = false)
    private CourtSlot slot;

    @Column(name = "sport_type", nullable = false)
    private String sportType;

    @Column(name = "skill_level_required")
    private String skillLevelRequired; // Any, Beginner, Intermediate, Advanced

    @Column(name = "max_players", nullable = false)
    private int maxPlayers;

    @Column(name = "current_players")
    @Builder.Default
    private int currentPlayers = 1; // Includes host

    @Column(name = "price_per_player")
    private double pricePerPlayer;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
