package com.auraplays.backend.repository;

import com.auraplays.backend.entity.Game;
import com.auraplays.backend.entity.GamePlayer;
import com.auraplays.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GamePlayerRepository extends JpaRepository<GamePlayer, Long> {
    List<GamePlayer> findByGame(Game game);
    boolean existsByGameAndPlayer(Game game, User player);
}
