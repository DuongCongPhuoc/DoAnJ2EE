// Snake Game Logic

class SnakeGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameRunning = false;
        this.currentScore = 0;
        this.soundEnabled = true;
        
        // Game settings
        this.gridSize = 20;
        this.gridWidth = 20;
        this.gridHeight = 20;
        this.gameWidth = this.gridWidth * this.gridSize;
        this.gameHeight = this.gridHeight * this.gridSize;
        
        // Snake properties
        this.snake = [
            { x: 10, y: 10 }
        ];
        this.direction = { x: 0, y: -1 }; // Start moving up
        this.nextDirection = { x: 0, y: -1 };
        
        // Food properties
        this.food = this.generateFood();
        
        // Game state
        this.snakeLength = 1;
        this.foodEaten = 0;
        this.gameSpeed = 1;
        this.gameTime = 0;
        this.gameTimer = null;
        this.gameLoop = null;
        
        // Audio elements
        this.eatSound = null;
        this.gameOverSound = null;
        this.moveSound = null;
        
        // Initialize game
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.createAudioElements();
        this.setupEventListeners();
        this.drawGame();
        this.updateDisplay();
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
        
        // Eat sound (high pitch success)
        this.eatSound = this.createTone(audioContext, 800, 0.1);
        
        // Game over sound (low pitch failure)
        this.gameOverSound = this.createTone(audioContext, 200, 0.5);
        
        // Move sound (gentle click)
        this.moveSound = this.createTone(audioContext, 400, 0.05);
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
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning) return;
        
        switch (e.code) {
            case 'ArrowUp':
            case 'KeyW':
                if (this.direction.y === 0) {
                    this.nextDirection = { x: 0, y: -1 };
                }
                break;
            case 'ArrowDown':
            case 'KeyS':
                if (this.direction.y === 0) {
                    this.nextDirection = { x: 0, y: 1 };
                }
                break;
            case 'ArrowLeft':
            case 'KeyA':
                if (this.direction.x === 0) {
                    this.nextDirection = { x: -1, y: 0 };
                }
                break;
            case 'ArrowRight':
            case 'KeyD':
                if (this.direction.x === 0) {
                    this.nextDirection = { x: 1, y: 0 };
                }
                break;
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
            this.snake = [{ x: 10, y: 10 }];
            this.direction = { x: 0, y: -1 };
            this.nextDirection = { x: 0, y: -1 };
            this.food = this.generateFood();
            this.snakeLength = 1;
            this.foodEaten = 0;
            this.gameSpeed = 1;
            this.gameTime = 0;
            
            const startBtn = document.getElementById('startBtn');
            if (startBtn) {
                startBtn.disabled = true;
                startBtn.innerHTML = '<i class="fas fa-pause me-1"></i>Đang Chạy';
            }
            
            const gameOver = document.getElementById('gameOver');
            if (gameOver) gameOver.style.display = 'none';
            
            this.startTimer();
            this.startGameLoop();
            this.updateDisplay();
        }
    }
    
    resetGame() {
        this.gameRunning = false;
        this.currentScore = 0;
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 0, y: -1 };
        this.nextDirection = { x: 0, y: -1 };
        this.food = this.generateFood();
        this.snakeLength = 1;
        this.foodEaten = 0;
        this.gameSpeed = 1;
        this.gameTime = 0;
        
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.innerHTML = '<i class="fas fa-play me-1"></i>Bắt Đầu';
        }
        
        const gameOver = document.getElementById('gameOver');
        if (gameOver) gameOver.style.display = 'none';
        
        this.updateDisplay();
        this.drawGame();
    }
    
    startTimer() {
        this.gameTimer = setInterval(() => {
            if (this.gameRunning) {
                this.gameTime++;
                this.updateDisplay();
            }
        }, 1000);
    }
    
    startGameLoop() {
        const baseSpeed = 150; // milliseconds
        const speedIncrement = 5; // milliseconds per food eaten
        
        this.gameLoop = setInterval(() => {
            if (this.gameRunning) {
                this.updateGame();
                this.drawGame();
            }
        }, Math.max(50, baseSpeed - (this.foodEaten * speedIncrement)));
    }
    
    updateGame() {
        // Update direction
        this.direction = { ...this.nextDirection };
        
        // Calculate new head position
        const head = this.snake[0];
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y
        };
        
        // Check wall collision
        if (newHead.x < 0 || newHead.x >= this.gridWidth || 
            newHead.y < 0 || newHead.y >= this.gridHeight) {
            this.gameOver();
            return;
        }
        
        // Check self collision
        for (let segment of this.snake) {
            if (segment.x === newHead.x && segment.y === newHead.y) {
                this.gameOver();
                return;
            }
        }
        
        // Add new head
        this.snake.unshift(newHead);
        
        // Check food collision
        if (newHead.x === this.food.x && newHead.y === this.food.y) {
            this.eatFood();
        } else {
            // Remove tail if no food eaten
            this.snake.pop();
            if (this.moveSound) this.moveSound();
        }
    }
    
    eatFood() {
        this.foodEaten++;
        this.snakeLength = this.snake.length;
        this.currentScore += 10 * this.gameSpeed;
        this.gameSpeed = Math.floor(this.foodEaten / 5) + 1;
        
        // Generate new food
        this.food = this.generateFood();
        
        // Play eat sound
        if (this.eatSound) this.eatSound();
        
        // Restart game loop with new speed
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.startGameLoop();
        }
        
        this.updateDisplay();
    }
    
    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.gridWidth),
                y: Math.floor(Math.random() * this.gridHeight)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        
        return food;
    }
    
    gameOver() {
        this.gameRunning = false;
        
        if (this.gameOverSound) this.gameOverSound();
        
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
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
    
    updateDisplay() {
        const scoreElement = document.getElementById('currentScore');
        const snakeLengthElement = document.getElementById('snakeLength');
        const foodEatenElement = document.getElementById('foodEaten');
        const gameSpeedElement = document.getElementById('gameSpeed');
        const gameTimeElement = document.getElementById('gameTime');
        
        if (scoreElement) scoreElement.textContent = this.currentScore;
        if (snakeLengthElement) snakeLengthElement.textContent = this.snakeLength;
        if (foodEatenElement) foodEatenElement.textContent = this.foodEaten;
        if (gameSpeedElement) gameSpeedElement.textContent = this.gameSpeed;
        if (gameTimeElement) gameTimeElement.textContent = this.formatTime(this.gameTime);
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    drawGame() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
        
        // Draw background grid
        this.drawGrid();
        
        // Draw snake
        this.drawSnake();
        
        // Draw food
        this.drawFood();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#34495e';
        this.ctx.lineWidth = 1;
        
        // Draw vertical lines
        for (let x = 0; x <= this.gameWidth; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.gameHeight);
            this.ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = 0; y <= this.gameHeight; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.gameWidth, y);
            this.ctx.stroke();
        }
    }
    
    drawSnake() {
        this.ctx.fillStyle = '#27ae60';
        this.ctx.strokeStyle = '#2ecc71';
        this.ctx.lineWidth = 2;
        
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            // Draw snake body
            this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);
            this.ctx.strokeRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);
            
            // Draw snake head with different color
            if (i === 0) {
                this.ctx.fillStyle = '#2ecc71';
                this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
                
                // Draw eyes
                this.ctx.fillStyle = '#000';
                this.ctx.beginPath();
                this.ctx.arc(x + 6, y + 6, 2, 0, Math.PI * 2);
                this.ctx.arc(x + 14, y + 6, 2, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.fillStyle = '#27ae60';
            }
        }
    }
    
    drawFood() {
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        
        // Draw food with gradient effect
        const gradient = this.ctx.createRadialGradient(
            x + this.gridSize / 2, y + this.gridSize / 2, 0,
            x + this.gridSize / 2, y + this.gridSize / 2, this.gridSize / 2
        );
        gradient.addColorStop(0, '#e74c3c');
        gradient.addColorStop(1, '#c0392b');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(
            x + this.gridSize / 2,
            y + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // Draw food shine
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(
            x + this.gridSize / 2 - 3,
            y + this.gridSize / 2 - 3,
            3,
            0,
            Math.PI * 2
        );
        this.ctx.stroke();
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
    new SnakeGame();
}); 