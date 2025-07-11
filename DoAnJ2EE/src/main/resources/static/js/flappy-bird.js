// Flappy Bird Game Logic

class FlappyBirdGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameRunning = false;
        this.currentScore = 0;
        this.soundEnabled = true;
        
        // Bird properties
        this.bird = {
            x: 100,
            y: 200,
            velocity: 0,
            gravity: 0.4,
            jumpPower: -6.5,
            size: 20
        };
        
        // Pipes array
        this.pipes = [];
        this.pipeWidth = 60;
        this.pipeGap = 150;
        this.pipeSpeed = 1.5;
        
        // Game settings
        this.gameWidth = 800;
        this.gameHeight = 400;
        this.groundHeight = 50;
        
        // Audio elements
        this.jumpSound = null;
        this.hitSound = null;
        this.scoreSound = null;
        this.bgMusic = null;
        
        // Initialize game
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.createAudioElements();
        this.createClouds();
        this.setupEventListeners();
        this.gameLoop();
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
        
        // Jump sound (high pitch beep)
        this.jumpSound = this.createTone(audioContext, 800, 0.1);
        
        // Hit sound (low pitch beep)
        this.hitSound = this.createTone(audioContext, 200, 0.3);
        
        // Score sound (medium pitch beep)
        this.scoreSound = this.createTone(audioContext, 600, 0.1);
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
    
    createClouds() {
        const cloudsContainer = document.getElementById('clouds');
        if (!cloudsContainer) return;
        
        for (let i = 0; i < 5; i++) {
            const cloud = document.createElement('div');
            cloud.className = 'cloud';
            cloud.style.width = Math.random() * 60 + 40 + 'px';
            cloud.style.height = Math.random() * 30 + 20 + 'px';
            cloud.style.top = Math.random() * 200 + 'px';
            cloud.style.animationDuration = (Math.random() * 20 + 10) + 's';
            cloud.style.animationDelay = Math.random() * 10 + 's';
            cloudsContainer.appendChild(cloud);
        }
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
        if (e.code === 'Space' && this.gameRunning) {
            e.preventDefault();
            this.jump();
        }
    }
    
    handleClick(e) {
        if (this.gameRunning) {
            this.jump();
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
            this.bird.y = 200;
            this.bird.velocity = 0;
            this.pipes = [];
            
            const startBtn = document.getElementById('startBtn');
            if (startBtn) {
                startBtn.disabled = true;
                startBtn.innerHTML = '<i class="fas fa-pause me-1"></i>Đang Chạy';
            }
            
            const gameOver = document.getElementById('gameOver');
            if (gameOver) gameOver.style.display = 'none';
            
            this.updateScoreDisplay();
        }
    }
    
    resetGame() {
        this.gameRunning = false;
        this.currentScore = 0;
        this.bird.y = 200;
        this.bird.velocity = 0;
        this.pipes = [];
        
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.innerHTML = '<i class="fas fa-play me-1"></i>Bắt Đầu';
        }
        
        const gameOver = document.getElementById('gameOver');
        if (gameOver) gameOver.style.display = 'none';
        
        this.updateScoreDisplay();
    }
    
    jump() {
        if (this.gameRunning) {
            this.bird.velocity = this.bird.jumpPower;
            if (this.jumpSound) this.jumpSound();
        }
    }
    
    updateScoreDisplay() {
        const scoreElement = document.getElementById('currentScore');
        if (scoreElement) {
            scoreElement.textContent = this.currentScore;
        }
    }
    
    createPipe() {
        const gapY = Math.random() * (this.gameHeight - this.pipeGap - this.groundHeight - 100) + 50;
        this.pipes.push({
            x: this.gameWidth,
            gapY: gapY,
            passed: false
        });
    }
    
    updatePipes() {
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            this.pipes[i].x -= this.pipeSpeed;
            
            // Check if bird passed pipe
            if (!this.pipes[i].passed && this.pipes[i].x + this.pipeWidth < this.bird.x) {
                this.pipes[i].passed = true;
                this.currentScore++;
                if (this.scoreSound) this.scoreSound();
                this.updateScoreDisplay();
            }
            
            // Remove pipes that are off screen
            if (this.pipes[i].x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
            }
        }
        
        // Create new pipe every 150 frames
        if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < this.gameWidth - 300) {
            this.createPipe();
        }
    }
    
    checkCollision() {
        // Check ground collision
        if (this.bird.y + this.bird.size > this.gameHeight - this.groundHeight) {
            return true;
        }
        
        // Check ceiling collision
        if (this.bird.y < 0) {
            return true;
        }
        
        // Check pipe collision
        for (let pipe of this.pipes) {
            if (this.bird.x + this.bird.size > pipe.x && this.bird.x < pipe.x + this.pipeWidth) {
                if (this.bird.y < pipe.gapY || this.bird.y + this.bird.size > pipe.gapY + this.pipeGap) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    gameOver() {
        this.gameRunning = false;
        if (this.hitSound) this.hitSound();
        
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
    
    drawBird() {
        this.ctx.save();
        
        // Bird body
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.arc(this.bird.x, this.bird.y, this.bird.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bird eye
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(this.bird.x + 8, this.bird.y - 5, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bird wing
        this.ctx.fillStyle = '#FFA500';
        this.ctx.beginPath();
        this.ctx.ellipse(this.bird.x - 5, this.bird.y + 5, 8, 4, Math.PI / 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Bird beak
        this.ctx.fillStyle = '#FF6347';
        this.ctx.beginPath();
        this.ctx.moveTo(this.bird.x + this.bird.size, this.bird.y);
        this.ctx.lineTo(this.bird.x + this.bird.size + 8, this.bird.y - 3);
        this.ctx.lineTo(this.bird.x + this.bird.size + 8, this.bird.y + 3);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawPipes() {
        this.ctx.fillStyle = '#228B22';
        
        for (let pipe of this.pipes) {
            // Top pipe
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.gapY);
            
            // Bottom pipe
            this.ctx.fillRect(pipe.x, pipe.gapY + this.pipeGap, this.pipeWidth, this.gameHeight - pipe.gapY - this.pipeGap - this.groundHeight);
            
            // Pipe caps
            this.ctx.fillStyle = '#006400';
            this.ctx.fillRect(pipe.x - 5, pipe.gapY - 20, this.pipeWidth + 10, 20);
            this.ctx.fillRect(pipe.x - 5, pipe.gapY + this.pipeGap, this.pipeWidth + 10, 20);
            this.ctx.fillStyle = '#228B22';
        }
    }
    
    drawGround() {
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, this.gameHeight - this.groundHeight, this.gameWidth, this.groundHeight);
        
        // Grass on ground
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, this.gameHeight - this.groundHeight, this.gameWidth, 10);
    }
    
    drawBackground() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.gameHeight);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
    }
    
    drawScore() {
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Điểm: ${this.currentScore}`, this.gameWidth / 2, 30);
    }
    
    gameLoop() {
        if (this.gameRunning) {
            // Update bird
            this.bird.velocity += this.bird.gravity;
            this.bird.y += this.bird.velocity;
            
            // Update pipes
            this.updatePipes();
            
            // Check collision
            if (this.checkCollision()) {
                this.gameOver();
            }
        }
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
        
        // Draw everything
        this.drawBackground();
        this.drawPipes();
        this.drawGround();
        this.drawBird();
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
    new FlappyBirdGame();
}); 