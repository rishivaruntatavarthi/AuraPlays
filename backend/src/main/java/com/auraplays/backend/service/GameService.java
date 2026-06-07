package com.auraplays.backend.service;

import com.auraplays.backend.dto.request.GameRequest;
import com.auraplays.backend.entity.Game;
import com.auraplays.backend.entity.GamePlayer;
import com.auraplays.backend.entity.CourtSlot;
import com.auraplays.backend.entity.User;
import com.auraplays.backend.exception.ResourceNotFoundException;
import com.auraplays.backend.exception.BadRequestException;
import com.auraplays.backend.repository.CourtSlotRepository;
import com.auraplays.backend.repository.GamePlayerRepository;
import com.auraplays.backend.repository.GameRepository;
import com.auraplays.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GameService {

    private final GameRepository gameRepository;
    private final GamePlayerRepository gamePlayerRepository;
    private final CourtSlotRepository courtSlotRepository;
    private final UserRepository userRepository;

    @Transactional
    public Game hostGame(GameRequest request, String hostEmail) {
        User host = userRepository.findByEmail(hostEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", hostEmail));

        CourtSlot slot = courtSlotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("CourtSlot", "id", request.getSlotId()));

        Game game = Game.builder()
                .title(request.getTitle())
                .host(host)
                .slot(slot)
                .sportType(request.getSportType())
                .skillLevelRequired(request.getSkillLevelRequired())
                .maxPlayers(request.getMaxPlayers())
                .currentPlayers(1)
                .pricePerPlayer(request.getPricePerPlayer())
                .build();

        Game savedGame = gameRepository.save(game);

        // Host automatically joins
        GamePlayer gamePlayer = GamePlayer.builder()
                .game(savedGame)
                .player(host)
                .build();
        gamePlayerRepository.save(gamePlayer);

        // Award Karma to host
        host.setKarmaPoints(host.getKarmaPoints() + 50);
        userRepository.save(host);

        return savedGame;
    }

    public List<Game> getAllGames() {
        return gameRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public void joinGame(Long gameId, String playerEmail) {
        User player = userRepository.findByEmail(playerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", playerEmail));

        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new ResourceNotFoundException("Game", "id", gameId));

        if (game.getCurrentPlayers() >= game.getMaxPlayers()) {
            throw new BadRequestException("Game is already full!");
        }

        if (gamePlayerRepository.existsByGameAndPlayer(game, player)) {
            throw new BadRequestException("You have already joined this game!");
        }

        GamePlayer gamePlayer = GamePlayer.builder()
                .game(game)
                .player(player)
                .build();
        gamePlayerRepository.save(gamePlayer);

        game.setCurrentPlayers(game.getCurrentPlayers() + 1);
        gameRepository.save(game);

        // Award Karma to player
        player.setKarmaPoints(player.getKarmaPoints() + 20);
        userRepository.save(player);
    }
}
