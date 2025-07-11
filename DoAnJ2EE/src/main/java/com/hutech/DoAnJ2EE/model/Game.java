package com.hutech.DoAnJ2EE.model;

import jakarta.persistence.*;

@Entity
@Table(name = "games")
public class Game {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(length = 1000)
    private String description;
    
    @Column(nullable = false)
    private String category;
    
    @Column
    private String imageUrl;
    
    @Column
    private String gameUrl;
    
    @Column
    private int highScore;
    
    @Column
    private int playCount;
    
    @Column
    private boolean isActive = true;
    
    // Constructors
    public Game() {}
    
    public Game(String name, String description, String category, String imageUrl, String gameUrl) {
        this.name = name;
        this.description = description;
        this.category = category;
        this.imageUrl = imageUrl;
        this.gameUrl = gameUrl;
        this.highScore = 0;
        this.playCount = 0;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public String getImageUrl() {
        return imageUrl;
    }
    
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    
    public String getGameUrl() {
        return gameUrl;
    }
    
    public void setGameUrl(String gameUrl) {
        this.gameUrl = gameUrl;
    }
    
    public int getHighScore() {
        return highScore;
    }
    
    public void setHighScore(int highScore) {
        this.highScore = highScore;
    }
    
    public int getPlayCount() {
        return playCount;
    }
    
    public void setPlayCount(int playCount) {
        this.playCount = playCount;
    }
    
    public boolean isActive() {
        return isActive;
    }
    
    public void setActive(boolean active) {
        isActive = active;
    }
} 