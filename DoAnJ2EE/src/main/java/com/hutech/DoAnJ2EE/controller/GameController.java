package com.hutech.DoAnJ2EE.controller;

import com.hutech.DoAnJ2EE.model.Game;
import com.hutech.DoAnJ2EE.service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
public class GameController {

    @Autowired
    private GameService gameService;

    @GetMapping("/")
    public String home(Model model) {
        List<Game> games = gameService.getAllGames();
        model.addAttribute("games", games);
        return "index";
    }

    @GetMapping("/game/{id}")
    public String playGame(@PathVariable Long id, Model model) {
        Game game = gameService.getGameById(id);
        model.addAttribute("game", game);
        
        // Check if it's Flappy Bird game (ID 1)
        if (id == 1) {
            return "flappy-bird";
        }
        
        // Check if it's Gold Miner game (ID 2)
        if (id == 2) {
            return "gold-miner";
        }
        
        // Check if it's Chess game (ID 3)
        if (id == 3) {
            return "chess";
        }
        
        // Check if it's Snake game (ID 4)
        if (id == 4) {
            return "snake";
        }
        
        // Check if it's Duck Hunt game (ID 5)
        if (id == 5) {
            return "duck-hunt";
        }
        
        return "game";
    }

    @PostMapping("/game/save-score")
    @ResponseBody
    public String saveScore(@RequestParam Long gameId, @RequestParam int score) {
        gameService.saveScore(gameId, score);
        return "Điểm số đã được lưu!";
    }

    @GetMapping("/leaderboard")
    public String leaderboard(Model model) {
        List<Game> topGames = gameService.getTopGames();
        model.addAttribute("topGames", topGames);
        return "leaderboard";
    }
} 