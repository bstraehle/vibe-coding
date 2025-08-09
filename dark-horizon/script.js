/**
 * DarkHorizon game logic.
 *
 * This file implements the Dark Horizon game, a browser-based arcade shooter.
 * The player controls a ship, shoots asteroids, and collects stars for points.
 */

import { CONFIG } from './constants.js';
import { Asteroid, Background, Bullet, Explosion, Nebula, Particle, Player, Star } from './entities.js';

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
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');

        this.highScore = Number(localStorage.getItem('spaceVoyagerHighScore')) || 0;
        this.score = 0;

        this.gameRunning = false;

        this.keys = {};
        this.mousePos = { x: 0, y: 0 };

        this.player = this.createPlayer();
        this.asteroids = [];
        this.bullets = [];
        this.engineTrail = [];
        this.explosions = [];
        this.particles = [];
        this.starField = [];
        this.stars = [];

        this.bulletSpeed = CONFIG.SPEEDS.BULLET;
        this.asteroidSpeed = this.isMobile() ? CONFIG.SPEEDS.ASTEROID_MOBILE : CONFIG.SPEEDS.ASTEROID_DESKTOP;
        this.starSpeed = CONFIG.SPEEDS.STAR;

        this.lastShot = 0;
        this.shotCooldown = CONFIG.GAME.SHOT_COOLDOWN;

        this.time = 0;

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleStartClick = this.handleStartClick.bind(this);
        this.handleRestartClick = this.handleRestartClick.bind(this);
        this.handleStartKeyDown = this.handleStartKeyDown.bind(this);
        this.handleRestartKeyDown = this.handleRestartKeyDown.bind(this);
        this.resizeCanvas = this.resizeCanvas.bind(this);
        this.shoot = this.shoot.bind(this);

        this.init();
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
        this.updateHighScore();
        this.initStarField();
        this.drawAnimatedStarField();
        this.setupEventListeners();
        this.startBtn.focus();
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
     * Create the animated background starfield.
     */
    initStarField() {
        this.starField = Array.from({ length: CONFIG.GAME.STARFIELD_COUNT }, () => ({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.5 + 0.1,
            brightness: Math.random() * 0.5 + 0.5
        }));
    }

    /**
     * Set up keyboard, mouse, touch, and button event listeners.
     */
    setupEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        // Mouse events
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('click', this.shoot);
        // Touch events for mobile
        this.canvas.addEventListener('touchmove', this.handleTouchMove);
        this.canvas.addEventListener('touchstart', this.handleTouchStart);
        // Window resize
        window.addEventListener('resize', this.resizeCanvas);
        // Button events
        this.startBtn.addEventListener('click', this.handleStartClick);
        this.restartBtn.addEventListener('click', this.handleRestartClick);
        // Keyboard accessibility for buttons
        this.startBtn.addEventListener('keydown', this.handleStartKeyDown);
        this.restartBtn.addEventListener('keydown', this.handleRestartKeyDown);
    }

    /**
     * Handle keydown events for movement and shooting.
     */
    handleKeyDown(e) {
        if (document.activeElement === this.startBtn || document.activeElement === this.restartBtn) return;
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
    handleStartClick() {
        this.startGame();
        this.startBtn.focus();
    }

    /**
     * Restart the game from game over screen.
     */
    handleRestartClick() {
        this.hideGameOver();
        this.startGame();
        this.startBtn.focus();
    }

    /**
     * Keyboard accessibility for restart button.
     */
    handleStartKeyDown(e) {
        if (e.code === 'Enter' || e.code === 'Space') {
            e.preventDefault();
            this.startGame();
            this.startBtn.focus();
        }
    }

    /**
     * Keyboard accessibility for play again button.
     */
    handleRestartKeyDown(e) {
        if (e.code === 'Enter' || e.code === 'Space') {
            e.preventDefault();
            this.hideGameOver();
            this.startGame();
            this.startBtn.focus();
        }
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
     * Start or restart the game, reset state and scores.
     */
    startGame() {
        this.score = 0;
        this.gameRunning = true;
        this.asteroids = [];
        this.bullets = [];
        this.engineTrail = [];
        this.explosions = [];
        this.particles = [];
        this.stars = [];
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
     * End the game and show the game over screen.
     */
    gameOver() {
        this.gameRunning = false;
        this.updateHighScore();
        this.showGameOver();
    }
    
    /**
     * Display the game over screen and final score.
     */
    showGameOver() {
        document.getElementById('finalScore').textContent = this.score;
        this.gameOverScreen.classList.remove('hidden');
        
        setTimeout(() => {
            this.restartBtn.focus();
        }, 100);
    }
    
    /**
     * Hide the game over screen.
     */
    hideGameOver() {
        this.gameOverScreen.classList.add('hidden');
    }

    /**
     * Update the displayed current score.
     */
    updateScore() {
        document.getElementById('currentScore').textContent = this.score;
    }

    /**
     * Update all game objects and check collisions.
     */
    update() {
        this.updateAsteroids();
        this.updateBullets();
        this.updateEngineTrail();
        this.updateExplosions();
        this.updateParticles();
        this.updateStars();
        this.spawnObjects();
        this.checkCollisions();
        this.player.update(this.keys, this.mousePos, this.canvas);
    }

    /**
     * Move asteroids and remove those off-screen.
     */
    updateAsteroids() {
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const asteroid = this.asteroids[i];
            asteroid.update();
            if (asteroid.y > this.canvas.height) {
                this.asteroids.splice(i, 1);
            }
        }
    }

    /**
     * Move bullets and remove those off-screen.
     */
    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update();
            if (bullet.y + bullet.height < 0) {
                this.bullets.splice(i, 1);
            }
        }
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
     * Update explosion animations and remove finished ones.
     */
    updateExplosions() {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            explosion.update();
            if (explosion.life <= 0) {
                this.explosions.splice(i, 1);
            }
        }
    }

    /**
     * Update all particles (movement, fading, gravity).
     */
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update();
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * Move collectible stars and remove those off-screen.
     */
    updateStars() {
        for (let i = this.stars.length - 1; i >= 0; i--) {
            const star = this.stars[i];
            star.update();
            if (star.y > this.canvas.height) {
                this.stars.splice(i, 1);
            }
        }
    }

    /**
     * Randomly spawn asteroids and collectible stars.
     */
    spawnObjects() {
        if (Math.random() < CONFIG.GAME.ASTEROID_SPAWN_RATE) this.asteroids.push(this.createAsteroid());
        if (Math.random() < CONFIG.GAME.STAR_SPAWN_RATE) this.stars.push(this.createStar());
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
                    this.particles.push(new Particle(
                        star.x + star.width / 2,
                        star.y + star.height / 2,
                        Math.cos((Math.PI * 2 * p) / 12) * (Math.random() * 3 + 2),
                        Math.sin((Math.PI * 2 * p) / 12) * (Math.random() * 3 + 2),
                        20,
                        20,
                        Math.random() * 2 + 1,
                        CONFIG.COLORS.STAR.BASE
                    ));
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
     * Create a new asteroid object with random size and speed.
     */
    createAsteroid() {
        const width = CONFIG.ASTEROID.MIN_SIZE + Math.random() * CONFIG.ASTEROID.SIZE_VARIATION;
        const height = CONFIG.ASTEROID.MIN_SIZE + Math.random() * CONFIG.ASTEROID.SIZE_VARIATION;
        const speed = this.asteroidSpeed + Math.random() * CONFIG.ASTEROID.SPEED_VARIATION;
        return new Asteroid(
            Math.random() * (this.canvas.width - CONFIG.ASTEROID.HORIZONTAL_MARGIN),
            CONFIG.ASTEROID.SPAWN_Y,
            width,
            height,
            speed
        );
    }

    /**
     * Create a new bullet object at the player's position.
     */
    createBullet() {
        return new Bullet(
            this.player.x + this.player.width / 2 + CONFIG.BULLET.SPAWN_OFFSET,
            this.player.y,
            CONFIG.BULLET.WIDTH,
            CONFIG.BULLET.HEIGHT,
            this.bulletSpeed
        );
    }

    /**
     * Create explosion and particle effects at given position.
     */
    createExplosion(x, y) {
        for (let i = 0; i < CONFIG.EXPLOSION.PARTICLE_COUNT; i++) {
            this.particles.push(new Particle(
                x,
                y,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                CONFIG.EXPLOSION.PARTICLE_LIFE,
                CONFIG.EXPLOSION.PARTICLE_LIFE,
                Math.random() * CONFIG.EXPLOSION.PARTICLE_SIZE_VARIATION + CONFIG.EXPLOSION.PARTICLE_SIZE_MIN,
                `hsl(0, 0%, ${Math.random() * 40 + 40}%)`
            ));
        }
        this.explosions.push(new Explosion(
            x - CONFIG.EXPLOSION.OFFSET,
            y - CONFIG.EXPLOSION.OFFSET,
            CONFIG.EXPLOSION.SIZE,
            CONFIG.EXPLOSION.SIZE,
            CONFIG.EXPLOSION.LIFE,
            CONFIG.EXPLOSION.LIFE
        ));
    }

    /**
     * Create a new player object with default position and size.
     */
    createPlayer() {
        return new Player(
            0,
            0,
            CONFIG.SIZES.PLAYER,
            CONFIG.SIZES.PLAYER,
            CONFIG.SPEEDS.PLAYER
        );
    }

    /**
     * Create a new collectible star object with random size and speed.
     */
    createStar() {
        const width = CONFIG.STAR.MIN_SIZE + Math.random() * CONFIG.STAR.SIZE_VARIATION;
        const height = CONFIG.STAR.MIN_SIZE + Math.random() * CONFIG.STAR.SIZE_VARIATION;
        const speed = this.starSpeed + Math.random();
        return new Star(
            Math.random() * (this.canvas.width - CONFIG.STAR.HORIZONTAL_MARGIN),
            CONFIG.STAR.SPAWN_Y,
            width,
            height,
            speed
        );
    }

    /**
     * Draw all game objects and background for the current frame.
     */
    draw() {
        Background.draw(this.ctx, this.canvas);
        Nebula.draw(this.ctx, this.canvas);
        this.drawAnimatedStarField();
        this.player.draw(this.ctx);
        this.drawAsteroids();
        this.drawBullets();
        this.drawCollectibleStars();
        this.drawExplosions();
        this.drawParticles();
        this.player.drawEngineTrail(this.ctx, this.engineTrail);
    }
    
    /**
     * Draw the animated starfield background.
     */
    drawAnimatedStarField() {
        this.ctx.fillStyle = CONFIG.COLORS.STAR.GRAD_IN;
        this.starField.forEach(star => {
            star.y += star.speed;
            if (star.y > this.canvas.height) {
                star.y = -5;
                star.x = Math.random() * this.canvas.width;
            }
            const twinkle = Math.sin(this.time * 0.01 + star.x) * 0.3 + 0.7;
            this.ctx.globalAlpha = star.brightness * twinkle;
            this.ctx.shadowColor = CONFIG.COLORS.STAR.GRAD_IN;
            this.ctx.shadowBlur = star.size * 2;
            this.ctx.fillRect(star.x, star.y, star.size, star.size);
            this.ctx.shadowBlur = 0;
        });
        this.ctx.globalAlpha = 1;
    }

    /**
     * Draw all asteroids with craters and outlines.
     */
    drawAsteroids() {
        this.asteroids.forEach(asteroid => {
            asteroid.draw(this.ctx);
        });
    }

    /**
     * Draw all bullets and their trails.
     */
    drawBullets() {
        this.bullets.forEach(bullet => {
            bullet.draw(this.ctx);
        });
    }

    /**
     * Draw collectible stars with pulsing and glow effects.
     */
    drawCollectibleStars() {
        this.stars.forEach(star => {
            star.draw(this.ctx, this.time);
        });
    }
    
    /**
     * Draw explosion effects with animated gradients.
     */
    drawExplosions() {
        this.explosions.forEach(explosion => {
            explosion.draw(this.ctx);
        });
    }

    /**
     * Draw all particles with fading and glow effects.
     */
    drawParticles() {
        this.particles.forEach(particle => {
            particle.draw(this.ctx);
        });
        this.ctx.globalAlpha = 1;
    }
}

window.addEventListener('load', () => {
    new DarkHorizon();
});