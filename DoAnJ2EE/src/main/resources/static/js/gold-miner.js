// Gold Miner Game Logic

class GoldMinerGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameRunning = false;
        this.currentScore = 0;
        this.soundEnabled = true;
        
        // Game settings
        this.gameWidth = 800;
        this.gameHeight = 400;
        this.timeLimit = 120; // 2 minutes (120 seconds)
        this.timeLeft = this.timeLimit;
        
        // Miner properties
        this.miner = {
            x: this.gameWidth / 2,
            y: 80,
            hookX: this.gameWidth / 2,
            hookY: 80,
            hookLength: 0,
            maxHookLength: 500, // Increased hook length
            hookSpeed: 3,
            isExtending: false,
            isRetracting: false,
            hasItem: false,
            caughtItem: null,
            angle: 0, // Angle in radians (0 = straight down)
            rotationSpeed: 0.05 // Speed of rotation
        };
        
        // Items array
        this.items = [];
        this.itemTypes = {
            GOLD_SMALL: { value: 50, time: 1, color: '#FFD700', size: 15 },
            GOLD_MEDIUM: { value: 100, time: 2, color: '#FFD700', size: 25 },
            GOLD_LARGE: { value: 250, time: 3, color: '#FFD700', size: 35 },
            DIAMOND: { value: 500, time: 2, color: '#00CED1', size: 20 },
            STONE_SMALL: { value: 0, time: 1, color: '#696969', size: 15 },
            STONE_LARGE: { value: 0, time: 2, color: '#696969', size: 35 },
            BOMB: { value: -50, time: 1, color: '#FF0000', size: 20 }
        };
        
        // Statistics
        this.stats = {
            goldCount: 0,
            diamondCount: 0,
            stoneCount: 0
        };
        
        // Audio elements
        this.hookSound = null;
        this.goldSound = null;
        this.stoneSound = null;
        this.bombSound = null;
        this.timeSound = null;
        
        // Initialize game
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.createAudioElements();
        this.setupEventListeners();
        this.generateItems();
        this.gameLoop();
        this.startTimer();
    }
    
    setupCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = this.gameWidth;
        this.canvas.height = this.gameHeight;
    }
    
    createAudioElements() {
        // Create simple audio tones using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Hook sound (mechanical sound)
        this.hookSound = this.createTone(audioContext, 400, 0.1);
        
        // Gold sound (high pitch success)
        this.goldSound = this.createTone(audioContext, 800, 0.2);
        
        // Stone sound (low pitch thud)
        this.stoneSound = this.createTone(audioContext, 200, 0.1);
        
        // Bomb sound (explosion-like)
        this.bombSound = this.createTone(audioContext, 100, 0.3);
        
        // Time warning sound
        this.timeSound = this.createTone(audioContext, 600, 0.1);
    }
    
    createTone(audioContext, frequency, duration) {
        return () => {
            if (!this.soundEnabled) return;
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        };
    }
    
    setupEventListeners() {
        const startBtn = document.getElementById('startBtn');
        const resetBtn = document.getElementById('resetBtn');
        const saveBtn = document.getElementById('saveBtn');
        const soundBtn = document.getElementById('soundBtn');
        
        if (startBtn) startBtn.addEventListener('click', () => this.startGame());
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetGame());
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveScore());
        if (soundBtn) soundBtn.addEventListener('click', () => this.toggleSound());
        
        // Keyboard and mouse controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        if (this.canvas) this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }
    
    handleKeyPress(e) {
        if (this.gameRunning && !this.miner.isExtending && !this.miner.isRetracting) {
            if (e.code === 'Space') {
                e.preventDefault();
                this.dropHook();
            } else if (e.code === 'KeyQ') {
                // Rotate left
                this.miner.angle -= this.miner.rotationSpeed;
                this.updateHookPosition();
            } else if (e.code === 'KeyE') {
                // Rotate right
                this.miner.angle += this.miner.rotationSpeed;
                this.updateHookPosition();
            }
        }
    }
    
    handleClick(e) {
        if (this.gameRunning && !this.miner.isExtending && !this.miner.isRetracting) {
            this.dropHook();
        }
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const soundBtn = document.getElementById('soundBtn');
        if (soundBtn) {
            if (this.soundEnabled) {
                soundBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            } else {
                soundBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            }
        }
    }
    
    startGame() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.currentScore = 0;
            this.timeLeft = this.timeLimit;
            this.stats = { goldCount: 0, diamondCount: 0, stoneCount: 0 };
            this.miner.hookLength = 0;
            this.miner.isExtending = false;
            this.miner.isRetracting = false;
            this.miner.hasItem = false;
            this.miner.caughtItem = null;
            this.generateItems();
            
            const startBtn = document.getElementById('startBtn');
            if (startBtn) {
                startBtn.disabled = true;
                startBtn.innerHTML = '<i class="fas fa-pause me-1"></i>Đang Chạy';
            }
            
            const gameOver = document.getElementById('gameOver');
            if (gameOver) gameOver.style.display = 'none';
            
            this.updateDisplay();
        }
    }
    
    resetGame() {
        this.gameRunning = false;
        this.currentScore = 0;
        this.timeLeft = this.timeLimit;
        this.stats = { goldCount: 0, diamondCount: 0, stoneCount: 0 };
        this.miner.hookLength = 0;
        this.miner.isExtending = false;
        this.miner.isRetracting = false;
        this.miner.hasItem = false;
        this.miner.caughtItem = null;
        this.generateItems();
        
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.innerHTML = '<i class="fas fa-play me-1"></i>Bắt Đầu';
        }
        
        const gameOver = document.getElementById('gameOver');
        if (gameOver) gameOver.style.display = 'none';
        
        this.updateDisplay();
    }
    
    updateHookPosition() {
        // Calculate hook position based on angle and length
        this.miner.hookX = this.miner.x + Math.sin(this.miner.angle) * this.miner.hookLength;
        this.miner.hookY = this.miner.y + Math.cos(this.miner.angle) * this.miner.hookLength;
    }
    
    dropHook() {
        if (!this.miner.isExtending && !this.miner.isRetracting) {
            this.miner.isExtending = true;
            if (this.hookSound) this.hookSound();
        }
    }
    
    generateItems() {
        this.items = [];
        
        // Generate items randomly in underground area
        for (let i = 0; i < 25; i++) {
            const itemType = this.getRandomItemType();
            const item = {
                x: Math.random() * (this.gameWidth - 50) + 25,
                y: Math.random() * (this.gameHeight - 250) + 200, // Items in underground area
                type: itemType,
                ...this.itemTypes[itemType]
            };
            this.items.push(item);
        }
    }
    
    getRandomItemType() {
        const rand = Math.random();
        if (rand < 0.3) return 'GOLD_SMALL';
        if (rand < 0.45) return 'GOLD_MEDIUM';
        if (rand < 0.5) return 'GOLD_LARGE';
        if (rand < 0.55) return 'DIAMOND';
        if (rand < 0.8) return 'STONE_SMALL';
        if (rand < 0.95) return 'STONE_LARGE';
        return 'BOMB';
    }
    
    updateHook() {
        if (this.miner.isExtending) {
            this.miner.hookLength += this.miner.hookSpeed;
            this.updateHookPosition();
            
            // Check collision with items
            for (let i = this.items.length - 1; i >= 0; i--) {
                const item = this.items[i];
                const distance = Math.sqrt(
                    Math.pow(this.miner.hookX - item.x, 2) + 
                    Math.pow(this.miner.hookY - item.y, 2)
                );
                
                if (distance < item.size + 5) {
                    this.miner.caughtItem = item;
                    this.miner.hasItem = true;
                    this.miner.isExtending = false;
                    this.miner.isRetracting = true;
                    this.items.splice(i, 1);
                    
                    // Play sound based on item type
                    if (item.type.includes('GOLD') || item.type === 'DIAMOND') {
                        if (this.goldSound) this.goldSound();
                    } else if (item.type.includes('STONE')) {
                        if (this.stoneSound) this.stoneSound();
                    } else if (item.type === 'BOMB') {
                        if (this.bombSound) this.bombSound();
                    }
                    break;
                }
            }
            
            // Check if hook reached max length
            if (this.miner.hookLength >= this.miner.maxHookLength) {
                this.miner.isExtending = false;
                this.miner.isRetracting = true;
            }
        }
        
        if (this.miner.isRetracting) {
            this.miner.hookLength -= this.miner.hookSpeed;
            this.updateHookPosition();
            
            if (this.miner.hasItem && this.miner.caughtItem) {
                this.miner.caughtItem.x = this.miner.hookX;
                this.miner.caughtItem.y = this.miner.hookY;
            }
            
            // Check if hook returned to miner
            if (this.miner.hookLength <= 0) {
                this.miner.hookLength = 0;
                this.updateHookPosition();
                this.miner.isRetracting = false;
                
                if (this.miner.hasItem && this.miner.caughtItem) {
                    this.processItem(this.miner.caughtItem);
                    this.miner.hasItem = false;
                    this.miner.caughtItem = null;
                }
            }
        }
    }
    
    processItem(item) {
        this.currentScore += item.value;
        
        // Update statistics
        if (item.type.includes('GOLD')) {
            this.stats.goldCount++;
        } else if (item.type === 'DIAMOND') {
            this.stats.diamondCount++;
        } else if (item.type.includes('STONE')) {
            this.stats.stoneCount++;
        }
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        const scoreElement = document.getElementById('currentScore');
        const goldElement = document.getElementById('goldCount');
        const diamondElement = document.getElementById('diamondCount');
        const stoneElement = document.getElementById('stoneCount');
        const timeElement = document.getElementById('timeLeft');
        
        if (scoreElement) scoreElement.textContent = this.currentScore;
        if (goldElement) goldElement.textContent = this.stats.goldCount;
        if (diamondElement) diamondElement.textContent = this.stats.diamondCount;
        if (stoneElement) stoneElement.textContent = this.stats.stoneCount;
        if (timeElement) timeElement.textContent = this.timeLeft;
    }
    
    startTimer() {
        const timer = setInterval(() => {
            if (this.gameRunning) {
                this.timeLeft--;
                
                // Play warning sound when time is low
                if (this.timeLeft <= 10 && this.timeSound) {
                    this.timeSound();
                }
                
                if (this.timeLeft <= 0) {
                    this.gameOver();
                    clearInterval(timer);
                }
                
                this.updateDisplay();
            }
        }, 1000);
    }
    
    gameOver() {
        this.gameRunning = false;
        
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.innerHTML = '<i class="fas fa-play me-1"></i>Bắt Đầu';
        }
        
        const gameOver = document.getElementById('gameOver');
        const finalScore = document.getElementById('finalScore');
        if (gameOver) {
            if (finalScore) finalScore.textContent = this.currentScore;
            gameOver.style.display = 'block';
        }
    }
    
    drawMiner() {
        this.ctx.save();
        
        // Draw mining platform
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(this.miner.x - 40, this.miner.y + 10, 80, 15);
        
        // Draw platform supports
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(this.miner.x - 35, this.miner.y + 25, 10, 20);
        this.ctx.fillRect(this.miner.x + 25, this.miner.y + 25, 10, 20);
        
        // Draw miner body
        this.ctx.fillStyle = '#CD853F';
        this.ctx.fillRect(this.miner.x - 15, this.miner.y - 5, 30, 35);
        
        // Draw miner head
        this.ctx.fillStyle = '#F4A460';
        this.ctx.beginPath();
        this.ctx.arc(this.miner.x, this.miner.y - 10, 12, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw miner hat
        this.ctx.fillStyle = '#8B4513';
        this.ctx.beginPath();
        this.ctx.arc(this.miner.x, this.miner.y - 20, 15, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw hat brim
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(this.miner.x - 18, this.miner.y - 15, 36, 5);
        
        // Draw miner eyes
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(this.miner.x - 5, this.miner.y - 12, 2, 0, Math.PI * 2);
        this.ctx.arc(this.miner.x + 5, this.miner.y - 12, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw miner arms
        this.ctx.fillStyle = '#F4A460';
        this.ctx.fillRect(this.miner.x - 20, this.miner.y + 5, 8, 15);
        this.ctx.fillRect(this.miner.x + 12, this.miner.y + 5, 8, 15);
        
        // Draw mining machine
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(this.miner.x - 25, this.miner.y - 2, 50, 8);
        
        // Draw hook line with rotation
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(this.miner.x, this.miner.y);
        this.ctx.lineTo(this.miner.hookX, this.miner.hookY);
        this.ctx.stroke();
        
        // Draw hook
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.beginPath();
        this.ctx.arc(this.miner.hookX, this.miner.hookY, 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw hook details
        this.ctx.strokeStyle = '#1a1a1a';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(this.miner.hookX, this.miner.hookY, 6, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Draw rotation indicator (direction arrow)
        this.ctx.strokeStyle = '#FF0000';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(this.miner.x, this.miner.y);
        this.ctx.lineTo(
            this.miner.x + Math.sin(this.miner.angle) * 40,
            this.miner.y + Math.cos(this.miner.angle) * 40
        );
        this.ctx.stroke();
        
        // Draw arrow head
        this.ctx.fillStyle = '#FF0000';
        this.ctx.beginPath();
        this.ctx.moveTo(
            this.miner.x + Math.sin(this.miner.angle) * 40,
            this.miner.y + Math.cos(this.miner.angle) * 40
        );
        this.ctx.lineTo(
            this.miner.x + Math.sin(this.miner.angle - 0.3) * 30,
            this.miner.y + Math.cos(this.miner.angle - 0.3) * 30
        );
        this.ctx.lineTo(
            this.miner.x + Math.sin(this.miner.angle + 0.3) * 30,
            this.miner.y + Math.cos(this.miner.angle + 0.3) * 30
        );
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawItems() {
        this.ctx.save();
        
        for (let item of this.items) {
            if (item.type.includes('GOLD')) {
                this.drawGoldItem(item);
            } else if (item.type === 'DIAMOND') {
                this.drawDiamondItem(item);
            } else if (item.type.includes('STONE')) {
                this.drawStoneItem(item);
            } else if (item.type === 'BOMB') {
                this.drawBombItem(item);
            }
        }
        
        this.ctx.restore();
    }
    
    drawGoldItem(item) {
        // Gold nugget with shine effect
        const gradient = this.ctx.createRadialGradient(item.x, item.y, 0, item.x, item.y, item.size);
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(0.7, '#FFA500');
        gradient.addColorStop(1, '#B8860B');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Gold shine
        this.ctx.strokeStyle = '#FFF';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(item.x - item.size * 0.3, item.y - item.size * 0.3, item.size * 0.4, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Gold border
        this.ctx.strokeStyle = '#B8860B';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    drawDiamondItem(item) {
        // Diamond shape
        this.ctx.fillStyle = item.color;
        this.ctx.beginPath();
        this.ctx.moveTo(item.x, item.y - item.size);
        this.ctx.lineTo(item.x + item.size * 0.7, item.y - item.size * 0.3);
        this.ctx.lineTo(item.x + item.size * 0.7, item.y + item.size * 0.3);
        this.ctx.lineTo(item.x, item.y + item.size);
        this.ctx.lineTo(item.x - item.size * 0.7, item.y + item.size * 0.3);
        this.ctx.lineTo(item.x - item.size * 0.7, item.y - item.size * 0.3);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Diamond shine
        this.ctx.strokeStyle = '#FFF';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(item.x, item.y - item.size * 0.5);
        this.ctx.lineTo(item.x, item.y + item.size * 0.5);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(item.x - item.size * 0.5, item.y);
        this.ctx.lineTo(item.x + item.size * 0.5, item.y);
        this.ctx.stroke();
        
        // Diamond border
        this.ctx.strokeStyle = '#00BFFF';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(item.x, item.y - item.size);
        this.ctx.lineTo(item.x + item.size * 0.7, item.y - item.size * 0.3);
        this.ctx.lineTo(item.x + item.size * 0.7, item.y + item.size * 0.3);
        this.ctx.lineTo(item.x, item.y + item.size);
        this.ctx.lineTo(item.x - item.size * 0.7, item.y + item.size * 0.3);
        this.ctx.lineTo(item.x - item.size * 0.7, item.y - item.size * 0.3);
        this.ctx.closePath();
        this.ctx.stroke();
    }
    
    drawStoneItem(item) {
        // Stone with texture
        this.ctx.fillStyle = item.color;
        this.ctx.beginPath();
        this.ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Stone texture lines
        this.ctx.strokeStyle = '#1a1a1a';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            const angle = (Math.PI * 2 * i) / 3;
            this.ctx.beginPath();
            this.ctx.moveTo(
                item.x + Math.cos(angle) * item.size * 0.8,
                item.y + Math.sin(angle) * item.size * 0.8
            );
            this.ctx.lineTo(
                item.x + Math.cos(angle + Math.PI) * item.size * 0.8,
                item.y + Math.sin(angle + Math.PI) * item.size * 0.8
            );
            this.ctx.stroke();
        }
        
        // Stone border
        this.ctx.strokeStyle = '#1a1a1a';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    drawBombItem(item) {
        // Bomb body
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bomb fuse
        this.ctx.strokeStyle = '#FF4500';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(item.x, item.y - item.size);
        this.ctx.lineTo(item.x + item.size * 0.5, item.y - item.size * 1.5);
        this.ctx.stroke();
        
        // Bomb fuse tip
        this.ctx.fillStyle = '#FF4500';
        this.ctx.beginPath();
        this.ctx.arc(item.x + item.size * 0.5, item.y - item.size * 1.5, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bomb highlight
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    drawBackground() {
        // Sky gradient
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, 150);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(1, '#B0E0E6');
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(0, 0, this.gameWidth, 150);
        
        // Draw clouds
        this.drawClouds();
        
        // Ground surface
        const groundGradient = this.ctx.createLinearGradient(0, 150, 0, 200);
        groundGradient.addColorStop(0, '#8FBC8F');
        groundGradient.addColorStop(1, '#556B2F');
        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(0, 150, this.gameWidth, 50);
        
        // Underground layers
        this.drawUndergroundLayers();
        
        // Draw grass and surface details
        this.drawSurfaceDetails();
    }
    
    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        // Cloud 1
        this.ctx.beginPath();
        this.ctx.arc(100, 60, 25, 0, Math.PI * 2);
        this.ctx.arc(125, 60, 30, 0, Math.PI * 2);
        this.ctx.arc(150, 60, 25, 0, Math.PI * 2);
        this.ctx.arc(125, 45, 20, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Cloud 2
        this.ctx.beginPath();
        this.ctx.arc(600, 40, 20, 0, Math.PI * 2);
        this.ctx.arc(620, 40, 25, 0, Math.PI * 2);
        this.ctx.arc(640, 40, 20, 0, Math.PI * 2);
        this.ctx.arc(620, 25, 15, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Cloud 3
        this.ctx.beginPath();
        this.ctx.arc(400, 80, 15, 0, Math.PI * 2);
        this.ctx.arc(415, 80, 20, 0, Math.PI * 2);
        this.ctx.arc(430, 80, 15, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawUndergroundLayers() {
        // Layer 1 - Top soil
        const soilGradient = this.ctx.createLinearGradient(0, 200, 0, 250);
        soilGradient.addColorStop(0, '#8B4513');
        soilGradient.addColorStop(1, '#654321');
        this.ctx.fillStyle = soilGradient;
        this.ctx.fillRect(0, 200, this.gameWidth, 50);
        
        // Layer 2 - Clay
        const clayGradient = this.ctx.createLinearGradient(0, 250, 0, 300);
        clayGradient.addColorStop(0, '#D2691E');
        clayGradient.addColorStop(1, '#A0522D');
        this.ctx.fillStyle = clayGradient;
        this.ctx.fillRect(0, 250, this.gameWidth, 50);
        
        // Layer 3 - Rock
        const rockGradient = this.ctx.createLinearGradient(0, 300, 0, 400);
        rockGradient.addColorStop(0, '#696969');
        rockGradient.addColorStop(1, '#2F4F4F');
        this.ctx.fillStyle = rockGradient;
        this.ctx.fillRect(0, 300, this.gameWidth, 100);
        
        // Draw rock patterns
        this.drawRockPatterns();
    }
    
    drawRockPatterns() {
        this.ctx.strokeStyle = '#1a1a1a';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * this.gameWidth;
            const y = Math.random() * 100 + 300;
            const size = Math.random() * 20 + 10;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }
    
    drawSurfaceDetails() {
        // Draw grass patches
        this.ctx.fillStyle = '#228B22';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * this.gameWidth;
            const y = 150 + Math.random() * 20;
            const width = Math.random() * 30 + 10;
            const height = Math.random() * 15 + 5;
            
            this.ctx.fillRect(x, y, width, height);
        }
        
        // Draw some small rocks on surface
        this.ctx.fillStyle = '#696969';
        for (let i = 0; i < 8; i++) {
            const x = Math.random() * this.gameWidth;
            const y = 150 + Math.random() * 30;
            const size = Math.random() * 8 + 3;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawScore() {
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Điểm: ${this.currentScore}`, 10, 30);
        this.ctx.fillText(`Thời gian: ${this.timeLeft}s`, 10, 55);
    }
    
    gameLoop() {
        if (this.gameRunning) {
            this.updateHook();
        }
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
        
        // Draw everything
        this.drawBackground();
        this.drawItems();
        this.drawMiner();
        this.drawScore();
        
        // Continue loop
        requestAnimationFrame(() => this.gameLoop());
    }
    
    saveScore() {
        const gameId = document.getElementById('saveBtn')?.getAttribute('data-game-id');
        if (!gameId) return;
        
        fetch('/game/save-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `gameId=${gameId}&score=${this.currentScore}`
        })
        .then(response => response.text())
        .then(data => {
            alert('Điểm số đã được lưu thành công!');
            setTimeout(() => {
                location.reload();
            }, 1000);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Có lỗi xảy ra khi lưu điểm số!');
        });
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new GoldMinerGame();
}); 