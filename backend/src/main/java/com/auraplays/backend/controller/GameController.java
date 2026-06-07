package com.auraplays.backend.controller;

import com.auraplays.backend.dto.request.GameRequest;
import com.auraplays.backend.entity.Game;
import com.auraplays.backend.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/games")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    @PostMapping("/host")
    public ResponseEntity<Game> hostGame(@RequestBody GameRequest request, Authentication authentication) {
        return ResponseEntity.ok(gameService.hostGame(request, authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<List<Game>> getAllGames() {
        return ResponseEntity.ok(gameService.getAllGames());
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinGame(@PathVariable Long id, Authentication authentication) {
        gameService.joinGame(id, authentication.getName());
        return ResponseEntity.ok().build();
    }
}
