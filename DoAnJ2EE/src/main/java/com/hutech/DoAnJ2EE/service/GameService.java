package com.hutech.DoAnJ2EE.service;

import com.hutech.DoAnJ2EE.model.Game;
import com.hutech.DoAnJ2EE.repository.GameRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GameService {

    @Autowired
    private GameRepository gameRepository;

    public List<Game> getAllGames() {
        return gameRepository.findByIsActiveTrue();
    }

    public Game getGameById(Long id) {
        return gameRepository.findById(id).orElse(null);
    }

    public List<Game> getGamesByCategory(String category) {
        return gameRepository.findByCategory(category);
    }

    public List<Game> getTopGames() {
        return gameRepository.findTopGamesByHighScore();
    }

    public void saveScore(Long gameId, int score) {
        Game game = gameRepository.findById(gameId).orElse(null);
        if (game != null) {
            if (score > game.getHighScore()) {
                game.setHighScore(score);
            }
            game.setPlayCount(game.getPlayCount() + 1);
            gameRepository.save(game);
        }
    }

    public void initializeGames() {
        if (gameRepository.count() == 0) {
            // Tạo dữ liệu mẫu cho các game
            Game game1 = new Game(
                "Flappy Bird", 
                "Game Flappy Bird huyền thoại - Điều khiển chú chim bay qua các ống", 
                "Arcade", 
                "/images/flappy-bird.jpg", 
                "/games/flappy-bird"
            );
            
            Game game2 = new Game(
                "Đào Vàng", 
                "Game đào vàng kinh điển - Đào vàng và tránh đá để kiếm điểm", 
                "Arcade", 
                "/images/gold-miner.jpg", 
                "/games/gold-miner"
            );
            
            Game game3 = new Game(
                "Cờ Vua", 
                "Game cờ vua kinh điển - Thử thách trí tuệ và chiến thuật", 
                "Strategy", 
                "/images/chess.jpg", 
                "/games/chess"
            );
            
            Game game4 = new Game(
                "Rắn Săn Mồi", 
                "Game rắn săn mồi huyền thoại - Ăn mồi và phát triển", 
                "Arcade", 
                "/images/snake.jpg", 
                "/games/snake"
            );
            
            Game game5 = new Game(
                "Bắn Vịt Trời", 
                "Game bắn vịt trời kinh điển - Nhắm và bắn bằng chuột", 
                "Shooting", 
                "/images/duck-hunt.jpg", 
                "/games/duck-hunt"
            );
            
            Game game6 = new Game(
                "Game Thể Thao", 
                "Các môn thể thao phổ biến như bóng đá, bóng rổ", 
                "Sports", 
                "/images/sports.jpg", 
                "/games/sports"
            );

            gameRepository.save(game1);
            gameRepository.save(game2);
            gameRepository.save(game3);
            gameRepository.save(game4);
            gameRepository.save(game5);
            gameRepository.save(game6);
        }
    }
} 