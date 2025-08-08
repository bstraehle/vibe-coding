/**
 * DarkHorizon game constants and main logic.
 *
 * This file implements the Dark Horizon game, a browser-based arcade shooter.
 * The player controls a ship, shoots asteroids, and collects stars for points.
 */

// Game configuration constants
const PLAYER_SIZE = 30;
const PLAYER_SPEED = 8;
const BULLET_SPEED = 8;
const ASTEROID_SPEED_DESKTOP = 1.2;
const ASTEROID_SPEED_MOBILE = 0.6;
const STAR_SPEED = 1;
const SHOT_COOLDOWN = 200;
const STARFIELD_COUNT = 150;

// Color constants for game visuals
const COLOR_BG_TOP = '#111';
const COLOR_BG_MID = '#222';
const COLOR_BG_BOTTOM = '#000';
const COLOR_NEBULA1 = 'rgba(80, 80, 80, 0.3)';
const COLOR_NEBULA2 = 'rgba(40, 40, 40, 0.3)';
const COLOR_NEBULA1_OUT = 'rgba(80, 80, 80, 0)';
const COLOR_NEBULA2_OUT = 'rgba(40, 40, 40, 0)';
const COLOR_PLAYER_GRAD_TOP = '#6b0000';
const COLOR_PLAYER_GRAD_MID = '#222';
const COLOR_PLAYER_GRAD_BOTTOM = '#111';
const COLOR_PLAYER_OUTLINE = '#b20000';
const COLOR_PLAYER_COCKPIT = '#b20000';
const COLOR_PLAYER_GUN = '#b20000';
const COLOR_PLAYER_SHADOW = '#222';
const COLOR_ENGINE_GLOW1 = 'rgba(255, 100, 100, 0.8)';
const COLOR_ENGINE_GLOW2 = 'rgba(255, 150, 100, 0.4)';
const COLOR_ENGINE_GLOW3 = 'rgba(255, 200, 100, 0)';
const COLOR_BULLET_SHADOW = '#ff6b6b';
const COLOR_BULLET_GRAD_TOP = '#ff6b6b';
const COLOR_BULLET_GRAD_MID = '#ff8e8e';
const COLOR_BULLET_GRAD_BOTTOM = '#ff4444';
const COLOR_BULLET_TRAIL = 'rgba(255, 107, 107, 0.5)';
const COLOR_ASTEROID_GRAD_IN = '#888';
const COLOR_ASTEROID_GRAD_MID = '#555';
const COLOR_ASTEROID_GRAD_OUT = '#222';
const COLOR_ASTEROID_CRATER = '#555';
const COLOR_ASTEROID_OUTLINE = '#222';
const COLOR_STAR = '#ffd700';
const COLOR_STAR_GRAD_IN = '#ffffff';
const COLOR_STAR_GRAD_MID = '#ffd700';
const COLOR_STAR_GRAD_OUT = '#ffa500';
const COLOR_EXPLOSION_GRAD_IN = 'rgba(255, 255, 255, '; // alpha appended
const COLOR_EXPLOSION_GRAD_MID1 = 'rgba(255, 200, 100, '; // alpha appended
const COLOR_EXPLOSION_GRAD_MID2 = 'rgba(255, 100, 50, '; // alpha appended
const COLOR_EXPLOSION_GRAD_OUT = 'rgba(255, 50, 0, 0)';

/**
 * Main game class for DarkHorizon.
 * Handles game state, rendering, input, and logic.
 */
class DarkHorizon {
    /**
     * Initialize game state and UI elements.
     */
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.restartBtn = document.getElementById('restartBtn');
        this.playAgainBtn = document.getElementById('playAgainBtn');

        this.score = 0;
        this.highScore = Number(localStorage.getItem('spaceVoyagerHighScore')) || 0;
        this.gameRunning = false;
        this.keys = {};
        this.mousePos = { x: 0, y: 0 };

        this.player = this.createPlayer();
        this.bullets = [];
        this.asteroids = [];
        this.stars = [];
        this.explosions = [];
        this.particles = [];
        this.engineTrail = [];

        this.bulletSpeed = BULLET_SPEED;
        this.asteroidSpeed = this.isMobile() ? ASTEROID_SPEED_MOBILE : ASTEROID_SPEED_DESKTOP;
        this.starSpeed = STAR_SPEED;

        this.lastShot = 0;
        this.shotCooldown = SHOT_COOLDOWN;

        this.starField = [];
        this.time = 0;

        this.init();
    }

    /**
     * Create a new player object with default position and size.
     */
    createPlayer() {
        return {
            x: 0,
            y: 0,
            width: PLAYER_SIZE,
            height: PLAYER_SIZE,
            speed: PLAYER_SPEED
        };
    }

    /**
     * Detect if the user is on a mobile device.
     */
    isMobile() {
        return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    /**
     * Initialize canvas, event listeners, scores, and starfield.
     */
    init() {
        this.resizeCanvas();
        this.setupEventListeners();
        this.updateHighScore();
        this.initStarField();
        this.restartBtn.focus();
    }
    
    /**
     * Create the animated background starfield.
     */
    initStarField() {
        this.starField = Array.from({ length: STARFIELD_COUNT }, () => ({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.5 + 0.1,
            brightness: Math.random() * 0.5 + 0.5
        }));
    }
    
    /**
     * Resize the game canvas and reposition the player.
     */
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.player.x = this.canvas.width / 2 - this.player.width / 2;
        this.player.y = this.canvas.height - this.player.height - 100;
        this.initStarField();
    }
    
    /**
     * Set up keyboard, mouse, touch, and button event listeners.
     */
    setupEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('click', () => this.shoot());

        // Touch events for mobile
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));

        // Window resize
        window.addEventListener('resize', () => this.resizeCanvas());

        // Button events
        this.restartBtn.addEventListener('click', () => this.handleRestartClick());
        this.playAgainBtn.addEventListener('click', () => this.handlePlayAgainClick());

        // Keyboard accessibility for buttons
        this.restartBtn.addEventListener('keydown', (e) => this.handleRestartKeyDown(e));
        this.playAgainBtn.addEventListener('keydown', (e) => this.handlePlayAgainKeyDown(e));

        // Pause/resume functionality when restart button is focused during gameplay
        this.restartBtn.addEventListener('focus', () => this.handleRestartFocus());
        this.restartBtn.addEventListener('blur', () => this.handleRestartBlur());
    }

    /**
     * Handle keydown events for movement and shooting.
     */
    handleKeyDown(e) {
        if (document.activeElement === this.restartBtn || document.activeElement === this.playAgainBtn) return;
        this.keys[e.code] = true;
        if (e.code === 'Space') {
            e.preventDefault();
            this.shoot();
        }
        if (e.code.startsWith('Arrow') || ['KeyA', 'KeyD', 'KeyW', 'KeyS'].includes(e.code)) {
            this.mousePos.x = 0;
            this.mousePos.y = 0;
        }
    }

    /**
     * Handle keyup events for movement.
     */
    handleKeyUp(e) {
        this.keys[e.code] = false;
    }

    /**
     * Track mouse position for player movement.
     */
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos.x = e.clientX - rect.left;
        this.mousePos.y = e.clientY - rect.top;
    }

    /**
     * Track touch position for player movement (mobile).
     */
    handleTouchMove(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        this.mousePos.x = touch.clientX - rect.left;
        this.mousePos.y = touch.clientY - rect.top;
    }

    /**
     * Handle touch start event for shooting (mobile).
     */
    handleTouchStart(e) {
        e.preventDefault();
        this.shoot();
    }

    /**
     * Restart the game when restart button is clicked.
     */
    handleRestartClick() {
        this.startGame();
        this.restartBtn.focus();
    }

    /**
     * Restart the game from game over screen.
     */
    handlePlayAgainClick() {
        this.hideGameOver();
        this.startGame();
        this.restartBtn.focus();
    }

    /**
     * Keyboard accessibility for restart button.
     */
    handleRestartKeyDown(e) {
        if (e.code === 'Enter' || e.code === 'Space') {
            e.preventDefault();
            this.startGame();
            this.restartBtn.focus();
        }
    }

    /**
     * Keyboard accessibility for play again button.
     */
    handlePlayAgainKeyDown(e) {
        if (e.code === 'Enter' || e.code === 'Space') {
            e.preventDefault();
            this.hideGameOver();
            this.startGame();
            this.restartBtn.focus();
        }
    }

    /**
     * Pause game when restart button is focused.
     */
    handleRestartFocus() {
        if (this.gameRunning) {
            this.gameRunning = false;
        }
    }

    /**
     * Resume game when restart button loses focus.
     */
    handleRestartBlur() {
        if (!this.gameRunning && this.score > 0) {
            this.gameRunning = true;
            this.gameLoop();
        }
    }
    
    /**
     * Start or restart the game, reset state and scores.
     */
    startGame() {
        this.score = 0;
        this.gameRunning = true;
        this.bullets = [];
        this.asteroids = [];
        this.stars = [];
        this.explosions = [];
        this.particles = [];
        this.engineTrail = [];
        
        document.querySelector('.game-info').style.display = 'none';
        
        this.updateScore();
        this.hideGameOver();
        this.gameLoop();
    }
    
    /**
     * Main game loop: update and draw each frame.
     */
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.time++;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    /**
     * Update all game objects and check collisions.
     */
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
    
    /**
     * Update player position based on input.
     */
    updatePlayer() {
        const keyboardPressed = this.keys['ArrowLeft'] || this.keys['KeyA'] ||
            this.keys['ArrowRight'] || this.keys['KeyD'] ||
            this.keys['ArrowUp'] || this.keys['KeyW'] ||
            this.keys['ArrowDown'] || this.keys['KeyS'];

        if (keyboardPressed) {
            if (this.keys['ArrowLeft'] || this.keys['KeyA']) this.player.x -= this.player.speed;
            if (this.keys['ArrowRight'] || this.keys['KeyD']) this.player.x += this.player.speed;
            if (this.keys['ArrowUp'] || this.keys['KeyW']) this.player.y -= this.player.speed;
            if (this.keys['ArrowDown'] || this.keys['KeyS']) this.player.y += this.player.speed;
        } else if (this.mousePos.x > 0 && this.mousePos.y > 0) {
            const targetX = this.mousePos.x - this.player.width / 2;
            const targetY = this.mousePos.y - this.player.height / 2;
            this.player.x += (targetX - this.player.x) * 0.1;
            this.player.y += (targetY - this.player.y) * 0.1;
        }

        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
        this.player.y = Math.max(0, Math.min(this.canvas.height - this.player.height, this.player.y));
    }
    
    /**
     * Fire a bullet if cooldown allows.
     */
    shoot() {
        const now = Date.now();
        if (now - this.lastShot < this.shotCooldown) return;
        this.bullets.push(this.createBullet());
        this.lastShot = now;
    }

    /**
     * Create a new bullet object at the player's position.
     */
    createBullet() {
        return {
            x: this.player.x + this.player.width / 2 - 2,
            y: this.player.y,
            width: 4,
            height: 15,
            speed: this.bulletSpeed
        };
    }
    
    /**
     * Move bullets and remove those off-screen.
     */
    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.y -= bullet.speed;
            
            if (bullet.y + bullet.height < 0) {
                this.bullets.splice(i, 1);
            }
        }
    }
    
    /**
     * Move asteroids and remove those off-screen.
     */
    updateAsteroids() {
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const asteroid = this.asteroids[i];
            asteroid.y += asteroid.speed;
            
            if (asteroid.y > this.canvas.height) {
                this.asteroids.splice(i, 1);
            }
        }
    }
    
    /**
     * Move collectible stars and remove those off-screen.
     */
    updateStars() {
        for (let i = this.stars.length - 1; i >= 0; i--) {
            const star = this.stars[i];
            star.y += star.speed;
            
            if (star.y > this.canvas.height) {
                this.stars.splice(i, 1);
            }
        }
    }
    
    /**
     * Update explosion animations and remove finished ones.
     */
    updateExplosions() {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            explosion.life -= 1;
            
            if (explosion.life <= 0) {
                this.explosions.splice(i, 1);
            }
        }
    }
    
    /**
     * Randomly spawn asteroids and collectible stars.
     */
    spawnObjects() {
        if (Math.random() < 0.02) this.asteroids.push(this.createAsteroid());
        if (Math.random() < 0.01) this.stars.push(this.createStar());
    }

    /**
     * Create a new asteroid object with random size and speed.
     */
    createAsteroid() {
        return {
            x: Math.random() * (this.canvas.width - 40),
            y: -40,
            width: 30 + Math.random() * 20,
            height: 30 + Math.random() * 20,
            speed: this.asteroidSpeed + Math.random() * 2
        };
    }

    /**
     * Create a new collectible star object with random size and speed.
     */
    createStar() {
        return {
            x: Math.random() * (this.canvas.width - 20),
            y: -20,
            width: 15 + Math.random() * 10,
            height: 15 + Math.random() * 10,
            speed: this.starSpeed + Math.random()
        };
    }
    
    /**
     * Check for collisions between bullets, asteroids, player, and stars.
     */
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
                for (let p = 0; p < 12; p++) {
                    this.particles.push({
                        x: star.x + star.width / 2,
                        y: star.y + star.height / 2,
                        vx: Math.cos((Math.PI * 2 * p) / 12) * (Math.random() * 3 + 2),
                        vy: Math.sin((Math.PI * 2 * p) / 12) * (Math.random() * 3 + 2),
                        life: 20,
                        maxLife: 20,
                        size: Math.random() * 2 + 1,
                        color: COLOR_STAR
                    });
                }

                this.stars.splice(i, 1);
                this.score += 20;
            }
        }
        
        this.updateScore();
    }
    
    /**
     * Axis-aligned bounding box collision detection.
     */
    checkCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }
    
    /**
     * Create explosion and particle effects at given position.
     */
    createExplosion(x, y) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 30,
                maxLife: 30,
                size: Math.random() * 4 + 2,
                color: `hsl(0, 0%, ${Math.random() * 40 + 40}%)`
            });
        }
        
        this.explosions.push({
            x: x - 25,
            y: y - 25,
            width: 50,
            height: 50,
            life: 15,
            maxLife: 15
        });
    }
    
    /**
     * End the game and show the game over screen.
     */
    gameOver() {
        this.gameRunning = false;
        this.updateHighScore();
        this.showGameOver();
    }
    
    /**
     * Update the displayed current score.
     */
    updateScore() {
        document.getElementById('currentScore').textContent = this.score;
    }
    
    /**
     * Update and persist the high score if needed.
     */
    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('spaceVoyagerHighScore', this.highScore);
        }
        document.getElementById('highScore').textContent = this.highScore;
    }
    
    /**
     * Display the game over screen and final score.
     */
    showGameOver() {
        document.getElementById('finalScore').textContent = this.score;
        this.gameOverScreen.classList.remove('hidden');
        
        setTimeout(() => {
            this.playAgainBtn.focus();
        }, 100);
    }
    
    /**
     * Hide the game over screen.
     */
    hideGameOver() {
        this.gameOverScreen.classList.add('hidden');
    }
    
    /**
     * Draw all game objects and background for the current frame.
     */
    draw() {
        this.drawBackground();
        
        this.drawAnimatedStarField();
        
        this.drawPlayer();
        this.drawBullets();
        this.drawAsteroids();
        this.drawCollectibleStars();
        this.drawExplosions();
        this.drawParticles();
        this.drawEngineTrail();
    }
    
    /**
     * Draw the animated background gradient and nebula.
     */
    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);

        gradient.addColorStop(0, COLOR_BG_TOP);
        gradient.addColorStop(0.5, COLOR_BG_MID);
        gradient.addColorStop(1, COLOR_BG_BOTTOM);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawNebula();
    }
    
    /**
     * Draw nebula effects in the background.
     */
    drawNebula() {
        this.ctx.save();
        this.ctx.globalAlpha = 0.1;
        
        const nebula1 = this.ctx.createRadialGradient(
            this.canvas.width * 0.3, this.canvas.height * 0.2, 0,
            this.canvas.width * 0.3, this.canvas.height * 0.2, 200
        );

        nebula1.addColorStop(0, COLOR_NEBULA1);
        nebula1.addColorStop(1, COLOR_NEBULA1_OUT);
        
        const nebula2 = this.ctx.createRadialGradient(
            this.canvas.width * 0.7, this.canvas.height * 0.8, 0,
            this.canvas.width * 0.7, this.canvas.height * 0.8, 150
        );

        nebula2.addColorStop(0, COLOR_NEBULA2);
        nebula2.addColorStop(1, COLOR_NEBULA2_OUT);
        
        this.ctx.fillStyle = nebula1;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = nebula2;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.restore();
    }
    
    /**
     * Draw the animated starfield background.
     */
    drawAnimatedStarField() {
    this.ctx.fillStyle = COLOR_STAR_GRAD_IN;
        
        this.starField.forEach(star => {
            star.y += star.speed;
            if (star.y > this.canvas.height) {
                star.y = -5;
                star.x = Math.random() * this.canvas.width;
            }
            
            const twinkle = Math.sin(this.time * 0.01 + star.x) * 0.3 + 0.7;
            this.ctx.globalAlpha = star.brightness * twinkle;
            
            this.ctx.shadowColor = COLOR_STAR_GRAD_IN;
            this.ctx.shadowBlur = star.size * 2;
            this.ctx.fillRect(star.x, star.y, star.size, star.size);
            this.ctx.shadowBlur = 0;
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    /**
     * Draw the player's ship with gradients and effects.
     */
    drawPlayer() {
        const centerX = this.player.x + this.player.width / 2;
        const centerY = this.player.y + this.player.height / 2;
        
        this.drawEngineGlow(centerX, this.player.y + this.player.height);
        
        const shipGradient = this.ctx.createLinearGradient(
            this.player.x, this.player.y,
            this.player.x, this.player.y + this.player.height
        );

        shipGradient.addColorStop(0, COLOR_PLAYER_GRAD_TOP);
        shipGradient.addColorStop(0.5, COLOR_PLAYER_GRAD_MID);
        shipGradient.addColorStop(1, COLOR_PLAYER_GRAD_BOTTOM);

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
        this.ctx.strokeStyle = COLOR_PLAYER_OUTLINE;
        this.ctx.lineWidth = 2.5;
        this.ctx.stroke();
        // Draw cockpit
        this.ctx.fillStyle = COLOR_PLAYER_COCKPIT;
        this.ctx.beginPath();
        this.ctx.ellipse(centerX, this.player.y + this.player.height * 0.32, 4, 3, 0, 0, Math.PI * 2);
        this.ctx.fill();
        // Draw gun barrels
        this.ctx.fillStyle = COLOR_PLAYER_GUN;
        this.ctx.fillRect(centerX - 2, this.player.y - 8, 4, 10);
        // Add glow effect
        this.ctx.shadowColor = COLOR_PLAYER_SHADOW;
        this.ctx.shadowBlur = 12;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }
    
    /**
     * Draw engine glow effect below the player's ship.
     */
    drawEngineGlow(x, y) {
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 20);
        gradient.addColorStop(0, COLOR_ENGINE_GLOW1);
        gradient.addColorStop(0.5, COLOR_ENGINE_GLOW2);
        gradient.addColorStop(1, COLOR_ENGINE_GLOW3);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x - 20, y, 40, 30);
    }
    
    /**
     * Draw all bullets and their trails.
     */
    drawBullets() {
        this.bullets.forEach(bullet => {
            this.ctx.shadowColor = COLOR_BULLET_SHADOW;
            this.ctx.shadowBlur = 8;
            
            const bulletGradient = this.ctx.createLinearGradient(
                bullet.x, bullet.y,
                bullet.x, bullet.y + bullet.height
            );

            bulletGradient.addColorStop(0, COLOR_BULLET_GRAD_TOP);
            bulletGradient.addColorStop(0.5, COLOR_BULLET_GRAD_MID);
            bulletGradient.addColorStop(1, COLOR_BULLET_GRAD_BOTTOM);
            
            this.ctx.fillStyle = bulletGradient;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            
            this.ctx.fillStyle = COLOR_BULLET_TRAIL;
            this.ctx.fillRect(bullet.x, bullet.y + bullet.height, bullet.width, 10);
            
            this.ctx.shadowBlur = 0;
        });
    }
    
    /**
     * Draw all asteroids with craters and outlines.
     */
    drawAsteroids() {
        this.asteroids.forEach(asteroid => {
            const centerX = asteroid.x + asteroid.width / 2;
            const centerY = asteroid.y + asteroid.height / 2;
            const radius = asteroid.width / 2;
            
            const asteroidGradient = this.ctx.createRadialGradient(
                centerX - radius * 0.3, centerY - radius * 0.3, 0,
                centerX, centerY, radius
            );

            asteroidGradient.addColorStop(0, COLOR_ASTEROID_GRAD_IN);
            asteroidGradient.addColorStop(0.6, COLOR_ASTEROID_GRAD_MID);
            asteroidGradient.addColorStop(1, COLOR_ASTEROID_GRAD_OUT);
            
            this.ctx.fillStyle = asteroidGradient;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = COLOR_ASTEROID_CRATER;

            for (let i = 0; i < 3; i++) {
                const craterX = centerX + (Math.random() - 0.5) * radius * 0.8;
                const craterY = centerY + (Math.random() - 0.5) * radius * 0.8;
                const craterSize = Math.random() * radius * 0.3 + 2;
                
                this.ctx.beginPath();
                this.ctx.arc(craterX, craterY, craterSize, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            this.ctx.strokeStyle = COLOR_ASTEROID_OUTLINE;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
    }
    
    /**
     * Draw collectible stars (not used, see drawCollectibleStars).
     */
    drawStars() {
        this.ctx.fillStyle = COLOR_STAR;
        this.stars.forEach(star => {
            this.drawStar(star.x + star.width / 2, star.y + star.height / 2, star.width / 2);
        });
    }
    
    /**
     * Draw a five-pointed star shape at given position and size.
     */
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
    
    /**
     * Draw explosion effects with animated gradients.
     */
    drawExplosions() {
        this.explosions.forEach(explosion => {
            const alpha = explosion.life / explosion.maxLife;
            const scale = 1 + (1 - alpha) * 2;
            
            const explosionGradient = this.ctx.createRadialGradient(
                explosion.x + explosion.width / 2, explosion.y + explosion.height / 2, 0,
                explosion.x + explosion.width / 2, explosion.y + explosion.height / 2, explosion.width / 2 * scale
            );

            explosionGradient.addColorStop(0, `${COLOR_EXPLOSION_GRAD_IN}${alpha})`);
            explosionGradient.addColorStop(0.3, `${COLOR_EXPLOSION_GRAD_MID1}${alpha * 0.8})`);
            explosionGradient.addColorStop(0.7, `${COLOR_EXPLOSION_GRAD_MID2}${alpha * 0.6})`);
            explosionGradient.addColorStop(1, COLOR_EXPLOSION_GRAD_OUT);
            
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

    /**
     * Update all particles (movement, fading, gravity).
     */
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.vy += 0.1;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    /**
     * Draw all particles with fading and glow effects.
     */
    drawParticles() {
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            this.ctx.globalAlpha = alpha;
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
    
    /**
     * Update engine trail particles behind the player's ship.
     */
    updateEngineTrail() {
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
        
        for (let i = this.engineTrail.length - 1; i >= 0; i--) {
            const particle = this.engineTrail[i];
            particle.y += 2;
            particle.life--;
            
            if (particle.life <= 0) {
                this.engineTrail.splice(i, 1);
            }
        }
    }
    
    /**
     * Draw engine trail particles with glow.
     */
    drawEngineTrail() {
        this.engineTrail.forEach(particle => {
            const alpha = particle.life / 20;
            this.ctx.globalAlpha = alpha;
            
            const trailGradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size * 2
            );

            trailGradient.addColorStop(0, COLOR_ENGINE_GLOW1);
            trailGradient.addColorStop(1, COLOR_ENGINE_GLOW3);
            
            this.ctx.fillStyle = trailGradient;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.globalAlpha = 1;
    }

    /**
     * Draw collectible stars with pulsing and glow effects.
     */
    drawCollectibleStars() {
        this.stars.forEach(star => {
            const centerX = star.x + star.width / 2;
            const centerY = star.y + star.height / 2;
            const size = star.width / 2;
            const pulse = Math.sin(this.time * 0.01) * 0.2 + 0.8;
            const scaledSize = size * pulse;
            
            this.ctx.shadowColor = COLOR_STAR;
            this.ctx.shadowBlur = 15;
            
            const starGradient = this.ctx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, scaledSize
            );

            starGradient.addColorStop(0, COLOR_STAR_GRAD_IN);
            starGradient.addColorStop(0.3, COLOR_STAR_GRAD_MID);
            starGradient.addColorStop(1, COLOR_STAR_GRAD_OUT);
            
            this.ctx.fillStyle = starGradient;
            this.drawStar(centerX, centerY, scaledSize);
            this.ctx.shadowBlur = 0;
        });
    }
}

window.addEventListener('load', () => {
    new DarkHorizon();
});