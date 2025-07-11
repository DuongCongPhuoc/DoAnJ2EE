// Duck Hunt Game Logic

class DuckHuntGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameRunning = false;
        this.currentScore = 0;
        this.soundEnabled = true;
        
        // Game settings
        this.gameWidth = 600;
        this.gameHeight = 400;
        this.timeLimit = 60; // 60 seconds
        this.timeLeft = this.timeLimit;
        
        // Game state
        this.ducksHit = 0;
        this.shotsFired = 0;
        this.accuracy = 0;
        this.gameTime = 0;
        this.gameTimer = null;
        
        // Birds array
        this.birds = [];
        this.birdTypes = {
            DUCK_SMALL: { value: 10, speed: 2, size: 20, color: '#8B4513', type: 'duck' },
            DUCK_MEDIUM: { value: 25, speed: 1.5, size: 25, color: '#A0522D', type: 'duck' },
            DUCK_LARGE: { value: 50, speed: 1, size: 30, color: '#CD853F', type: 'duck' },
            SPARROW: { value: -5, speed: 3, size: 15, color: '#696969', type: 'sparrow' }
        };
        
        // Shooting
        this.bullets = [];
        this.maxBullets = 3;
        this.reloadTime = 1000; // 1 second
        this.lastShot = 0;
        
        // Audio elements
        this.shotSound = null;
        this.hitSound = null;
        this.missSound = null;
        this.reloadSound = null;
        this.gameOverSound = null;
        
        // Initialize game
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.createAudioElements();
        this.setupEventListeners();
        this.drawBackground();
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
        
        // Shot sound (gunshot)
        this.shotSound = this.createTone(audioContext, 200, 0.1);
        
        // Hit sound (success)
        this.hitSound = this.createTone(audioContext, 600, 0.2);
        
        // Miss sound (failure)
        this.missSound = this.createTone(audioContext, 300, 0.1);
        
        // Reload sound (mechanical)
        this.reloadSound = this.createTone(audioContext, 400, 0.3);
        
        // Game over sound (final)
        this.gameOverSound = this.createTone(audioContext, 150, 0.5);
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
        
        // Mouse events
        if (this.canvas) {
            this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            this.canvas.addEventListener('click', (e) => this.handleMouseClick(e));
        }
    }
    
    handleMouseMove(e) {
        if (!this.gameRunning) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Update crosshair position
        const crosshair = document.getElementById('crosshair');
        if (crosshair) {
            crosshair.style.left = (x - 10) + 'px';
            crosshair.style.top = (y - 10) + 'px';
            crosshair.style.display = 'block';
        }
    }
    
    handleMouseClick(e) {
        if (!this.gameRunning) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.shoot(x, y);
    }
    
    shoot(x, y) {
        const now = Date.now();
        
        // Check reload time
        if (now - this.lastShot < this.reloadTime) {
            return;
        }
        
        this.shotsFired++;
        this.lastShot = now;
        
        // Create bullet
        this.bullets.push({
            x: x,
            y: y,
            radius: 3,
            life: 10
        });
        
        if (this.shotSound) this.shotSound();
        
        // Check hit
        let hit = false;
        for (let i = this.birds.length - 1; i >= 0; i--) {
            const bird = this.birds[i];
            const distance = Math.sqrt(
                Math.pow(x - bird.x, 2) + Math.pow(y - bird.y, 2)
            );
            
            if (distance < bird.size) {
                // Hit!
                this.currentScore += bird.value;
                this.ducksHit++;
                
                if (this.hitSound) this.hitSound();
                
                // Remove bird
                this.birds.splice(i, 1);
                hit = true;
                break;
            }
        }
        
        if (!hit && this.missSound) {
            this.missSound();
        }
        
        this.updateAccuracy();
        this.updateDisplay();
    }
    
    updateAccuracy() {
        if (this.shotsFired > 0) {
            this.accuracy = Math.round((this.ducksHit / this.shotsFired) * 100);
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
            this.ducksHit = 0;
            this.shotsFired = 0;
            this.accuracy = 0;
            this.timeLeft = this.timeLimit;
            this.gameTime = 0;
            this.birds = [];
            this.bullets = [];
            
            const startBtn = document.getElementById('startBtn');
            if (startBtn) {
                startBtn.disabled = true;
                startBtn.innerHTML = '<i class="fas fa-pause me-1"></i>Đang Chạy';
            }
            
            const gameOver = document.getElementById('gameOver');
            if (gameOver) gameOver.style.display = 'none';
            
            this.startTimer();
            this.startBirdSpawner();
            this.gameLoop();
            this.updateDisplay();
        }
    }
    
    resetGame() {
        this.gameRunning = false;
        this.currentScore = 0;
        this.ducksHit = 0;
        this.shotsFired = 0;
        this.accuracy = 0;
        this.timeLeft = this.timeLimit;
        this.gameTime = 0;
        this.birds = [];
        this.bullets = [];
        
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.innerHTML = '<i class="fas fa-play me-1"></i>Bắt Đầu';
        }
        
        const gameOver = document.getElementById('gameOver');
        if (gameOver) gameOver.style.display = 'none';
        
        const crosshair = document.getElementById('crosshair');
        if (crosshair) crosshair.style.display = 'none';
        
        this.updateDisplay();
        this.drawBackground();
    }
    
    startTimer() {
        this.gameTimer = setInterval(() => {
            if (this.gameRunning) {
                this.timeLeft--;
                this.gameTime++;
                
                if (this.timeLeft <= 0) {
                    this.gameOver();
                }
                
                this.updateDisplay();
            }
        }, 1000);
    }
    
    startBirdSpawner() {
        const spawnBird = () => {
            if (this.gameRunning) {
                this.spawnBird();
                const nextSpawn = Math.random() * 2000 + 1000; // 1-3 seconds
                setTimeout(spawnBird, nextSpawn);
            }
        };
        
        spawnBird();
    }
    
    spawnBird() {
        const birdType = this.getRandomBirdType();
        const bird = {
            x: Math.random() * this.gameWidth,
            y: this.gameHeight + 50,
            ...this.birdTypes[birdType],
            direction: Math.random() > 0.5 ? 1 : -1,
            angle: 0
        };
        
        this.birds.push(bird);
    }
    
    getRandomBirdType() {
        const rand = Math.random();
        if (rand < 0.4) return 'DUCK_SMALL';
        if (rand < 0.7) return 'DUCK_MEDIUM';
        if (rand < 0.9) return 'DUCK_LARGE';
        return 'SPARROW';
    }
    
    gameLoop() {
        if (this.gameRunning) {
            this.updateBirds();
            this.updateBullets();
            this.drawGame();
            requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    updateBirds() {
        for (let i = this.birds.length - 1; i >= 0; i--) {
            const bird = this.birds[i];
            
            // Move bird
            bird.x += bird.speed * bird.direction;
            bird.y -= bird.speed * 0.5;
            bird.angle += 0.1;
            
            // Remove if off screen
            if (bird.y < -50 || bird.x < -50 || bird.x > this.gameWidth + 50) {
                this.birds.splice(i, 1);
            }
        }
    }
    
    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.life--;
            
            if (bullet.life <= 0) {
                this.bullets.splice(i, 1);
            }
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        
        if (this.gameOverSound) this.gameOverSound();
        
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
        
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.innerHTML = '<i class="fas fa-play me-1"></i>Bắt Đầu';
        }
        
        const crosshair = document.getElementById('crosshair');
        if (crosshair) crosshair.style.display = 'none';
        
        const gameOver = document.getElementById('gameOver');
        const finalScore = document.getElementById('finalScore');
        if (gameOver) {
            if (finalScore) finalScore.textContent = this.currentScore;
            gameOver.style.display = 'block';
        }
    }
    
    updateDisplay() {
        const scoreElement = document.getElementById('currentScore');
        const ducksHitElement = document.getElementById('ducksHit');
        const shotsFiredElement = document.getElementById('shotsFired');
        const accuracyElement = document.getElementById('accuracy');
        const gameTimeElement = document.getElementById('gameTime');
        
        if (scoreElement) scoreElement.textContent = this.currentScore;
        if (ducksHitElement) ducksHitElement.textContent = this.ducksHit;
        if (shotsFiredElement) shotsFiredElement.textContent = this.shotsFired;
        if (accuracyElement) accuracyElement.textContent = this.accuracy + '%';
        if (gameTimeElement) gameTimeElement.textContent = this.formatTime(this.gameTime);
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    drawBackground() {
        // Sky gradient
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.gameHeight * 0.7);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(1, '#B0E0E6');
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight * 0.7);
        
        // Grass
        const grassGradient = this.ctx.createLinearGradient(0, this.gameHeight * 0.7, 0, this.gameHeight);
        grassGradient.addColorStop(0, '#228B22');
        grassGradient.addColorStop(1, '#006400');
        this.ctx.fillStyle = grassGradient;
        this.ctx.fillRect(0, this.gameHeight * 0.7, this.gameWidth, this.gameHeight * 0.3);
        
        // Draw clouds
        this.drawClouds();
        
        // Draw grass details
        this.drawGrassDetails();
    }
    
    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        // Cloud 1
        this.ctx.beginPath();
        this.ctx.arc(100, 80, 25, 0, Math.PI * 2);
        this.ctx.arc(125, 80, 30, 0, Math.PI * 2);
        this.ctx.arc(150, 80, 25, 0, Math.PI * 2);
        this.ctx.arc(125, 65, 20, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Cloud 2
        this.ctx.beginPath();
        this.ctx.arc(400, 60, 20, 0, Math.PI * 2);
        this.ctx.arc(420, 60, 25, 0, Math.PI * 2);
        this.ctx.arc(440, 60, 20, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawGrassDetails() {
        this.ctx.fillStyle = '#32CD32';
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * this.gameWidth;
            const y = this.gameHeight * 0.7 + Math.random() * 20;
            const width = Math.random() * 30 + 10;
            const height = Math.random() * 15 + 5;
            
            this.ctx.fillRect(x, y, width, height);
        }
    }
    
    drawGame() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
        
        // Draw background
        this.drawBackground();
        
        // Draw birds
        this.drawBirds();
        
        // Draw bullets
        this.drawBullets();
        
        // Draw UI
        this.drawUI();
    }
    
    drawBirds() {
        for (const bird of this.birds) {
            this.ctx.save();
            
            // Bird body
            this.ctx.fillStyle = bird.color;
            this.ctx.beginPath();
            this.ctx.ellipse(bird.x, bird.y, bird.size, bird.size * 0.6, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Bird head
            this.ctx.beginPath();
            this.ctx.arc(bird.x + bird.size * 0.8, bird.y - bird.size * 0.3, bird.size * 0.4, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Bird beak
            this.ctx.fillStyle = '#FFA500';
            this.ctx.beginPath();
            this.ctx.moveTo(bird.x + bird.size * 1.2, bird.y - bird.size * 0.3);
            this.ctx.lineTo(bird.x + bird.size * 1.5, bird.y - bird.size * 0.4);
            this.ctx.lineTo(bird.x + bird.size * 1.5, bird.y - bird.size * 0.2);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Bird wing (animated)
            this.ctx.fillStyle = bird.color;
            this.ctx.beginPath();
            this.ctx.ellipse(
                bird.x - bird.size * 0.3,
                bird.y - bird.size * 0.2,
                bird.size * 0.4,
                bird.size * 0.2,
                bird.angle,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
            
            // Bird eye
            this.ctx.fillStyle = '#000';
            this.ctx.beginPath();
            this.ctx.arc(bird.x + bird.size * 0.9, bird.y - bird.size * 0.4, 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        }
    }
    
    drawBullets() {
        this.ctx.fillStyle = '#FFD700';
        this.ctx.strokeStyle = '#FFA500';
        this.ctx.lineWidth = 2;
        
        for (const bullet of this.bullets) {
            this.ctx.beginPath();
            this.ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        }
    }
    
    drawUI() {
        // Draw time remaining
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Thời gian: ${this.timeLeft}s`, 10, 30);
        
        // Draw score
        this.ctx.fillText(`Điểm: ${this.currentScore}`, 10, 55);
        
        // Draw bullets remaining
        const bulletsRemaining = Math.max(0, this.maxBullets - this.bullets.length);
        this.ctx.fillText(`Đạn: ${bulletsRemaining}`, 10, 80);
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
    new DuckHuntGame();
}); 