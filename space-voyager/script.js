class SpaceGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.restartBtn = document.getElementById('restartBtn');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        
        this.score = 0;
        this.highScore = localStorage.getItem('spaceVoyagerHighScore') || 0;
        this.gameRunning = false;
        this.keys = {};
        this.mousePos = { x: 0, y: 0 };
        
        // Game objects
        this.player = {
            x: 0,
            y: 0,
            width: 30,
            height: 30,
            speed: 8
        };
        
        this.bullets = [];
        this.asteroids = [];
        this.stars = [];
        this.explosions = [];
        this.particles = []; // New particle system
        this.engineTrail = []; // Engine trail particles
        
        this.bulletSpeed = 8;
        this.asteroidSpeed = 1.2;
        this.starSpeed = 1;
        
        this.lastShot = 0;
        this.shotCooldown = 200; // milliseconds
        
        // Animation variables
        this.starField = [];
        this.time = 0;
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        this.setupEventListeners();
        this.updateHighScore();
        this.initStarField();
        // Don't start game automatically - wait for button click
        // this.startGame();
        
        // Focus the restart button for keyboard accessibility
        this.restartBtn.focus();
    }
    
    initStarField() {
        this.starField = [];
        for (let i = 0; i < 150; i++) {
            this.starField.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 0.5 + 0.1,
                brightness: Math.random() * 0.5 + 0.5
            });
        }
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.player.x = this.canvas.width / 2 - this.player.width / 2;
        this.player.y = this.canvas.height - this.player.height - 100;
        this.initStarField();
    }
    
    setupEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', (e) => {
            // Don't handle game controls if a button is focused
            if (document.activeElement === this.restartBtn || document.activeElement === this.playAgainBtn) {
                return;
            }
            
            this.keys[e.code] = true;
            if (e.code === 'Space') {
                e.preventDefault();
                this.shoot();
            }
            // Reset mouse position when keyboard is used to avoid interference
            if (e.code.startsWith('Arrow') || ['KeyA', 'KeyD', 'KeyW', 'KeyS'].includes(e.code)) {
                this.mousePos.x = 0;
                this.mousePos.y = 0;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePos.x = e.clientX - rect.left;
            this.mousePos.y = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('click', () => {
            this.shoot();
        });
        
        // Touch events for mobile
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.mousePos.x = touch.clientX - rect.left;
            this.mousePos.y = touch.clientY - rect.top;
        });
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.shoot();
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
        
        // Button events
        this.restartBtn.addEventListener('click', () => {
            this.startGame();
            // Focus the restart button for keyboard accessibility
            this.restartBtn.focus();
        });
        
        this.playAgainBtn.addEventListener('click', () => {
            this.hideGameOver();
            this.startGame();
            // Focus the restart button for keyboard accessibility
            this.restartBtn.focus();
        });
        
        // Keyboard accessibility for buttons
        this.restartBtn.addEventListener('keydown', (e) => {
            console.log('Restart button keydown:', e.code);
            if (e.code === 'Enter' || e.code === 'Space') {
                e.preventDefault();
                console.log('Restart button activated');
                this.startGame();
                // Focus the restart button for keyboard accessibility
                this.restartBtn.focus();
            }
        });
        
        this.playAgainBtn.addEventListener('keydown', (e) => {
            console.log('Play again button keydown:', e.code);
            if (e.code === 'Enter' || e.code === 'Space') {
                e.preventDefault();
                console.log('Play again button activated');
                this.hideGameOver();
                this.startGame();
                // Focus the restart button for keyboard accessibility
                this.restartBtn.focus();
            }
        });
        
        // Pause/resume functionality when restart button is focused during gameplay
        this.restartBtn.addEventListener('focus', () => {
            if (this.gameRunning) {
                this.gameRunning = false;
                console.log('Game paused');
            }
        });
        
        this.restartBtn.addEventListener('blur', () => {
            if (!this.gameRunning && this.score > 0) {
                this.gameRunning = true;
                this.gameLoop();
                console.log('Game resumed');
            }
        });
    }
    
    startGame() {
        this.score = 0;
        this.gameRunning = true;
        this.bullets = [];
        this.asteroids = [];
        this.stars = [];
        this.explosions = [];
        this.particles = []; // Clear particles on game start
        this.engineTrail = []; // Clear engine trail on game start
        
        // Hide the game info panel to maximize game area
        document.querySelector('.game-info').style.display = 'none';
        
        this.updateScore();
        this.hideGameOver();
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.time++;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        this.updatePlayer();
        this.updateBullets();
        this.updateAsteroids();
        this.updateStars();
        this.updateExplosions();
        this.updateParticles();
        this.updateEngineTrail();
        this.spawnObjects();
        this.checkCollisions();
    }
    
    updatePlayer() {
        // Check if any keyboard keys are pressed
        const keyboardPressed = this.keys['ArrowLeft'] || this.keys['KeyA'] || 
                               this.keys['ArrowRight'] || this.keys['KeyD'] || 
                               this.keys['ArrowUp'] || this.keys['KeyW'] || 
                               this.keys['ArrowDown'] || this.keys['KeyS'];
        
        // Keyboard controls (priority over mouse when keys are pressed)
        if (keyboardPressed) {
            if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
                this.player.x -= this.player.speed;
            }
            if (this.keys['ArrowRight'] || this.keys['KeyD']) {
                this.player.x += this.player.speed;
            }
            if (this.keys['ArrowUp'] || this.keys['KeyW']) {
                this.player.y -= this.player.speed;
            }
            if (this.keys['ArrowDown'] || this.keys['KeyS']) {
                this.player.y += this.player.speed;
            }
        } else {
            // Mouse/touch controls (only when no keyboard is pressed)
            if (this.mousePos.x > 0 && this.mousePos.y > 0) {
                const targetX = this.mousePos.x - this.player.width / 2;
                const targetY = this.mousePos.y - this.player.height / 2;
                
                this.player.x += (targetX - this.player.x) * 0.1;
                this.player.y += (targetY - this.player.y) * 0.1;
            }
        }
        
        // Keep player in bounds
        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
        this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, this.player.y));
    }
    
    shoot() {
        const now = Date.now();
        if (now - this.lastShot < this.shotCooldown) return;
        
        this.bullets.push({
            x: this.player.x + this.player.width / 2 - 2,
            y: this.player.y,
            width: 4,
            height: 15,
            speed: this.bulletSpeed
        });
        
        this.lastShot = now;
    }
    
    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.y -= bullet.speed;
            
            if (bullet.y + bullet.height < 0) {
                this.bullets.splice(i, 1);
            }
        }
    }
    
    updateAsteroids() {
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const asteroid = this.asteroids[i];
            asteroid.y += asteroid.speed;
            
            if (asteroid.y > this.canvas.height) {
                this.asteroids.splice(i, 1);
            }
        }
    }
    
    updateStars() {
        for (let i = this.stars.length - 1; i >= 0; i--) {
            const star = this.stars[i];
            star.y += star.speed;
            
            if (star.y > this.canvas.height) {
                this.stars.splice(i, 1);
            }
        }
    }
    
    updateExplosions() {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            explosion.life -= 1;
            
            if (explosion.life <= 0) {
                this.explosions.splice(i, 1);
            }
        }
    }
    
    spawnObjects() {
        // Spawn asteroids
        if (Math.random() < 0.02) {
            this.asteroids.push({
                x: Math.random() * (this.canvas.width - 40),
                y: -40,
                width: 30 + Math.random() * 20,
                height: 30 + Math.random() * 20,
                speed: this.asteroidSpeed + Math.random() * 2
            });
        }
        
        // Spawn stars
        if (Math.random() < 0.01) {
            this.stars.push({
                x: Math.random() * (this.canvas.width - 20),
                y: -20,
                width: 15 + Math.random() * 10,
                height: 15 + Math.random() * 10,
                speed: this.starSpeed + Math.random()
            });
        }
    }
    
    checkCollisions() {
        // Bullet vs Asteroid collisions
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            for (let j = this.asteroids.length - 1; j >= 0; j--) {
                const asteroid = this.asteroids[j];
                
                if (this.checkCollision(bullet, asteroid)) {
                    this.bullets.splice(i, 1);
                    this.asteroids.splice(j, 1);
                    this.score += 10;
                    this.createExplosion(asteroid.x + asteroid.width / 2, asteroid.y + asteroid.height / 2);
                    break;
                }
            }
        }
        
        // Player vs Asteroid collisions
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const asteroid = this.asteroids[i];
            
            if (this.checkCollision(this.player, asteroid)) {
                this.gameOver();
                return;
            }
        }
        
        // Player vs Star collisions
        for (let i = this.stars.length - 1; i >= 0; i--) {
            const star = this.stars[i];
            if (this.checkCollision(this.player, star)) {
                // Star catch animation: burst of yellow particles
                for (let p = 0; p < 12; p++) {
                    this.particles.push({
                        x: star.x + star.width / 2,
                        y: star.y + star.height / 2,
                        vx: Math.cos((Math.PI * 2 * p) / 12) * (Math.random() * 3 + 2),
                        vy: Math.sin((Math.PI * 2 * p) / 12) * (Math.random() * 3 + 2),
                        life: 20,
                        maxLife: 20,
                        size: Math.random() * 2 + 1,
                        color: 'rgba(255, 215, 0, 1)'
                    });
                }
                this.stars.splice(i, 1);
                this.score += 20;
            }
        }
        
        this.updateScore();
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    createExplosion(x, y) {
        // Create explosion particles
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 30,
                maxLife: 30,
                size: Math.random() * 4 + 2,
                color: `hsl(0, 0%, ${Math.random() * 40 + 40}%)` // random gray
            });
        }
        
        // Create explosion effect
        this.explosions.push({
            x: x - 25,
            y: y - 25,
            width: 50,
            height: 50,
            life: 15,
            maxLife: 15
        });
    }
    
    gameOver() {
        this.gameRunning = false;
        this.updateHighScore();
        this.showGameOver();
    }
    
    updateScore() {
        document.getElementById('currentScore').textContent = this.score;
    }
    
    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('spaceVoyagerHighScore', this.highScore);
        }
        document.getElementById('highScore').textContent = this.highScore;
    }
    
    showGameOver() {
        document.getElementById('finalScore').textContent = this.score;
        this.gameOverScreen.classList.remove('hidden');
        
        // Keep the game info panel hidden for full-screen experience
        // document.querySelector('.game-info').style.display = 'block';
        
        // Focus the play again button for keyboard accessibility
        setTimeout(() => {
            this.playAgainBtn.focus();
        }, 100);
    }
    
    hideGameOver() {
        this.gameOverScreen.classList.add('hidden');
    }
    
    draw() {
        // Clear canvas with gradient background
        this.drawBackground();
        
        // Draw animated starfield
        this.drawAnimatedStarField();
        
        // Draw game objects
        this.drawPlayer();
        this.drawBullets();
        this.drawAsteroids();
        this.drawCollectibleStars();
        this.drawExplosions();
        this.drawParticles();
        this.drawEngineTrail();
    }
    
    drawBackground() {
        // Create gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#111');
        gradient.addColorStop(0.5, '#222');
        gradient.addColorStop(1, '#000');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Add nebula effect
        this.drawNebula();
    }
    
    drawNebula() {
        this.ctx.save();
        this.ctx.globalAlpha = 0.1;
        
        // Create nebula gradients
        const nebula1 = this.ctx.createRadialGradient(
            this.canvas.width * 0.3, this.canvas.height * 0.2, 0,
            this.canvas.width * 0.3, this.canvas.height * 0.2, 200
        );
        nebula1.addColorStop(0, 'rgba(80, 80, 80, 0.3)');
        nebula1.addColorStop(1, 'rgba(80, 80, 80, 0)');
        
        const nebula2 = this.ctx.createRadialGradient(
            this.canvas.width * 0.7, this.canvas.height * 0.8, 0,
            this.canvas.width * 0.7, this.canvas.height * 0.8, 150
        );
        nebula2.addColorStop(0, 'rgba(40, 40, 40, 0.3)');
        nebula2.addColorStop(1, 'rgba(40, 40, 40, 0)');
        
        this.ctx.fillStyle = nebula1;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = nebula2;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.restore();
    }
    
    drawAnimatedStarField() {
        this.ctx.fillStyle = '#ffffff';
        
        this.starField.forEach(star => {
            // Animate star movement
            star.y += star.speed;
            if (star.y > this.canvas.height) {
                star.y = -5;
                star.x = Math.random() * this.canvas.width;
            }
            
            // Twinkle effect
            const twinkle = Math.sin(this.time * 0.01 + star.x) * 0.3 + 0.7;
            this.ctx.globalAlpha = star.brightness * twinkle;
            
            // Draw star with glow effect
            this.ctx.shadowColor = '#ffffff';
            this.ctx.shadowBlur = star.size * 2;
            this.ctx.fillRect(star.x, star.y, star.size, star.size);
            this.ctx.shadowBlur = 0;
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    drawPlayer() {
        const centerX = this.player.x + this.player.width / 2;
        const centerY = this.player.y + this.player.height / 2;
        
        // Draw engine glow
        this.drawEngineGlow(centerX, this.player.y + this.player.height);
        
        // Draw ship body with gradient
        // Mean color scheme: dark red and metallic gray
        const shipGradient = this.ctx.createLinearGradient(
            this.player.x, this.player.y,
            this.player.x, this.player.y + this.player.height
        );
        shipGradient.addColorStop(0, '#6b0000'); // dark red
        shipGradient.addColorStop(0.5, '#222'); // metallic gray
        shipGradient.addColorStop(1, '#111'); // black

        this.ctx.fillStyle = shipGradient;
        // Mean attack ship: sharp nose, swept wings, tail fins, cockpit
        this.ctx.beginPath();
        // Sharp nose
        this.ctx.moveTo(centerX, this.player.y);
        // Left forward wing
        this.ctx.lineTo(this.player.x - 10, this.player.y + this.player.height * 0.55);
        // Left swept wing
        this.ctx.lineTo(this.player.x + this.player.width * 0.15, this.player.y + this.player.height * 0.7);
        // Left tail fin
        this.ctx.lineTo(this.player.x + this.player.width * 0.25, this.player.y + this.player.height);
        // Center tail
        this.ctx.lineTo(centerX, this.player.y + this.player.height * 0.95);
        // Right tail fin
        this.ctx.lineTo(this.player.x + this.player.width * 0.75, this.player.y + this.player.height);
        // Right swept wing
        this.ctx.lineTo(this.player.x + this.player.width * 0.85, this.player.y + this.player.height * 0.7);
        // Right forward wing
        this.ctx.lineTo(this.player.x + this.player.width + 10, this.player.y + this.player.height * 0.55);
        // Back to nose
        this.ctx.lineTo(centerX, this.player.y);
        this.ctx.closePath();
        this.ctx.fill();

        // Add ship outline
        this.ctx.strokeStyle = '#b20000'; // blood red outline
        this.ctx.lineWidth = 2.5;
        this.ctx.stroke();

        // Draw cockpit (smaller, more aggressive)
        this.ctx.fillStyle = '#b20000'; // cockpit: blood red
        this.ctx.beginPath();
        this.ctx.ellipse(centerX, this.player.y + this.player.height * 0.32, 4, 3, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw gun barrels (attack look)
        this.ctx.fillStyle = '#b20000'; // gun barrels: blood red
        this.ctx.fillRect(centerX - 2, this.player.y - 8, 4, 10);

        // Add glow effect
        this.ctx.shadowColor = '#222';
        this.ctx.shadowBlur = 12;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }
    
    drawEngineGlow(x, y) {
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 20);
        gradient.addColorStop(0, 'rgba(255, 100, 100, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 150, 100, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x - 20, y, 40, 30);
    }
    
    drawBullets() {
        this.bullets.forEach(bullet => {
            // Draw bullet glow
            this.ctx.shadowColor = '#ff6b6b';
            this.ctx.shadowBlur = 8;
            
            // Bullet gradient
            const bulletGradient = this.ctx.createLinearGradient(
                bullet.x, bullet.y,
                bullet.x, bullet.y + bullet.height
            );
            bulletGradient.addColorStop(0, '#ff6b6b');
            bulletGradient.addColorStop(0.5, '#ff8e8e');
            bulletGradient.addColorStop(1, '#ff4444');
            
            this.ctx.fillStyle = bulletGradient;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            
            // Add bullet trail
            this.ctx.fillStyle = 'rgba(255, 107, 107, 0.5)';
            this.ctx.fillRect(bullet.x, bullet.y + bullet.height, bullet.width, 10);
            
            this.ctx.shadowBlur = 0;
        });
    }
    
    drawAsteroids() {
        this.asteroids.forEach(asteroid => {
            const centerX = asteroid.x + asteroid.width / 2;
            const centerY = asteroid.y + asteroid.height / 2;
            const radius = asteroid.width / 2;
            
            // Create asteroid gradient
            const asteroidGradient = this.ctx.createRadialGradient(
                centerX - radius * 0.3, centerY - radius * 0.3, 0,
                centerX, centerY, radius
            );
            asteroidGradient.addColorStop(0, '#888');
            asteroidGradient.addColorStop(0.6, '#555');
            asteroidGradient.addColorStop(1, '#222');
            
            this.ctx.fillStyle = asteroidGradient;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add crater details
            this.ctx.fillStyle = '#555';
            for (let i = 0; i < 3; i++) {
                const craterX = centerX + (Math.random() - 0.5) * radius * 0.8;
                const craterY = centerY + (Math.random() - 0.5) * radius * 0.8;
                const craterSize = Math.random() * radius * 0.3 + 2;
                
                this.ctx.beginPath();
                this.ctx.arc(craterX, craterY, craterSize, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Add asteroid outline
            this.ctx.strokeStyle = '#222';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
    }
    
    drawStars() {
        this.ctx.fillStyle = '#ffd700';
        this.stars.forEach(star => {
            this.drawStar(star.x + star.width / 2, star.y + star.height / 2, star.width / 2);
        });
    }
    
    drawStar(x, y, size) {
        this.ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const x1 = x + size * Math.cos(angle);
            const y1 = y + size * Math.sin(angle);
            
            if (i === 0) {
                this.ctx.moveTo(x1, y1);
            } else {
                this.ctx.lineTo(x1, y1);
            }
            
            const innerAngle = angle + Math.PI / 5;
            const x2 = x + size * 0.4 * Math.cos(innerAngle);
            const y2 = y + size * 0.4 * Math.sin(innerAngle);
            this.ctx.lineTo(x2, y2);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawExplosions() {
        this.explosions.forEach(explosion => {
            const alpha = explosion.life / explosion.maxLife;
            const scale = 1 + (1 - alpha) * 2;
            
            // Create explosion gradient
            const explosionGradient = this.ctx.createRadialGradient(
                explosion.x + explosion.width / 2, explosion.y + explosion.height / 2, 0,
                explosion.x + explosion.width / 2, explosion.y + explosion.height / 2, explosion.width / 2 * scale
            );
            explosionGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
            explosionGradient.addColorStop(0.3, `rgba(255, 200, 100, ${alpha * 0.8})`);
            explosionGradient.addColorStop(0.7, `rgba(255, 100, 50, ${alpha * 0.6})`);
            explosionGradient.addColorStop(1, `rgba(255, 50, 0, 0)`);
            
            this.ctx.fillStyle = explosionGradient;
            this.ctx.beginPath();
            this.ctx.arc(
                explosion.x + explosion.width / 2,
                explosion.y + explosion.height / 2,
                explosion.width / 2 * scale,
                0, Math.PI * 2
            );
            this.ctx.fill();
        });
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            
            // Add gravity effect
            particle.vy += 0.1;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            this.ctx.globalAlpha = alpha;
            
            // Draw particle with glow
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = particle.size;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    updateEngineTrail() {
        // Add engine trail particles
        if (this.gameRunning) {
            const centerX = this.player.x + this.player.width / 2;
            const trailY = this.player.y + this.player.height;
            
            this.engineTrail.push({
                x: centerX + (Math.random() - 0.5) * 4,
                y: trailY,
                life: 20,
                size: Math.random() * 3 + 1
            });
        }
        
        // Update existing trail particles
        for (let i = this.engineTrail.length - 1; i >= 0; i--) {
            const particle = this.engineTrail[i];
            particle.y += 2;
            particle.life--;
            
            if (particle.life <= 0) {
                this.engineTrail.splice(i, 1);
            }
        }
    }
    
    drawEngineTrail() {
        this.engineTrail.forEach(particle => {
            const alpha = particle.life / 20;
            this.ctx.globalAlpha = alpha;
            
            // Create trail gradient
            const trailGradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size * 2
            );
            trailGradient.addColorStop(0, 'rgba(255, 100, 100, 0.8)');
            trailGradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
            
            this.ctx.fillStyle = trailGradient;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.globalAlpha = 1;
    }

    drawCollectibleStars() {
        this.stars.forEach(star => {
            const centerX = star.x + star.width / 2;
            const centerY = star.y + star.height / 2;
            const size = star.width / 2;
            
            // Add pulsing animation
            const pulse = Math.sin(this.time * 0.01) * 0.2 + 0.8;
            const scaledSize = size * pulse;
            
            // Star glow effect
            this.ctx.shadowColor = '#ffd700';
            this.ctx.shadowBlur = 15;
            
            // Draw star with gradient
            const starGradient = this.ctx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, scaledSize
            );
            starGradient.addColorStop(0, '#ffffff');
            starGradient.addColorStop(0.3, '#ffd700');
            starGradient.addColorStop(1, '#ffa500');
            
            this.ctx.fillStyle = starGradient;
            this.drawStar(centerX, centerY, scaledSize);
            
            this.ctx.shadowBlur = 0;
        });
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new SpaceGame();
}); 