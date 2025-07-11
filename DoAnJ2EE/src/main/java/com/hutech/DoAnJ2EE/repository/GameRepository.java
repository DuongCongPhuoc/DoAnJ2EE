package com.hutech.DoAnJ2EE.repository;

import com.hutech.DoAnJ2EE.model.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {
    
    List<Game> findByIsActiveTrue();
    
    List<Game> findByCategory(String category);
    
    @Query("SELECT g FROM Game g WHERE g.isActive = true ORDER BY g.highScore DESC")
    List<Game> findTopGamesByHighScore();
    
    @Query("SELECT g FROM Game g WHERE g.isActive = true ORDER BY g.playCount DESC")
    List<Game> findTopGamesByPlayCount();
} 