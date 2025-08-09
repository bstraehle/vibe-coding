/**
 * DarkHorizon game logic.
 *
 * This file implements the Dark Horizon game, a browser-based arcade shooter.
 * The player controls a ship, collects stars, and shoots asteroids for points.
 */

import { CONFIG } from './constants.js';
import { Asteroid, Background, Bullet, EngineTrail, Explosion, Nebula, Particle, Player, Star, StarField } from './entities.js';

/**
 * Main game class for DarkHorizon.
 * Handles game state, rendering, input, and logic for the arcade shooter.
 * @class
 */
class DarkHorizon {
    /**
     * Initialize game state and UI elements.
     * Sets up UI, game variables, and event listeners.
     */
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameInfo = document.getElementById('gameInfo');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');

        this.highScore = Number(localStorage.getItem('darkHorizonHighScore')) || 0;
        this.score = 0;
        this.updateHighScore();

        this.keys = {};
        this.mousePos = { x: 0, y: 0 };

        this.asteroidSpeed = this.isMobile() ? CONFIG.SPEEDS.ASTEROID_MOBILE : CONFIG.SPEEDS.ASTEROID_DESKTOP;
        this.bulletSpeed = CONFIG.SPEEDS.BULLET;
        this.starSpeed = CONFIG.SPEEDS.STAR;

        this.lastShot = 0;
        this.shotCooldown = CONFIG.GAME.SHOT_COOLDOWN;

        this.gameRunning = false;

        this.time = 0;

        this.player = new Player(
            0,
            0,
            CONFIG.SIZES.PLAYER,
            CONFIG.SIZES.PLAYER,
            CONFIG.SPEEDS.PLAYER
        );

        this.engineTrail = new EngineTrail();

        this.resizeCanvas();
        this.starField = StarField.init(this.canvas);
        this.drawBackground();
        
        this.asteroids = [];
        this.bullets = [];
        this.explosions = [];
        this.particles = [];
        this.stars = [];

        this.bindEventHandlers();
        this.setupEventListeners();

        this.startBtn.focus();
    }

    /**
     * Detect if the user is on a mobile device.
     * @returns {boolean} True if mobile device detected, else false.
     */
    isMobile() {
        return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Mobi|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Bind all event handler methods to the current instance.
     */
    bindEventHandlers() {
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
        // Button events
        this.startBtn.addEventListener('click', this.handleStartClick);
        this.restartBtn.addEventListener('click', this.handleRestartClick);
        // Keyboard accessibility for buttons
        this.startBtn.addEventListener('keydown', this.handleStartKeyDown);
        this.restartBtn.addEventListener('keydown', this.handleRestartKeyDown);
        // Window resize
        window.addEventListener('resize', this.resizeCanvas);
    }

    /**
     * Handle keydown events.
     * @param {KeyboardEvent} e - The keyboard event.
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
     * Handle keyup events.
     * @param {KeyboardEvent} e - The keyboard event.
     */
    handleKeyUp(e) {
        this.keys[e.code] = false;
    }

    /**
     * Track mouse position.
     * @param {MouseEvent} e - The mouse event.
     */
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos.x = e.clientX - rect.left;
        this.mousePos.y = e.clientY - rect.top;
    }

    /**
     * Track touch position (mobile).
     * @param {TouchEvent} e - The touch event.
     */
    handleTouchMove(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        this.mousePos.x = touch.clientX - rect.left;
        this.mousePos.y = touch.clientY - rect.top;
    }

    /**
     * Handle touch start event (mobile).
     * @param {TouchEvent} e - The touch event.
     */
    handleTouchStart(e) {
        e.preventDefault();
        this.shoot();
    }

    /**
     * Start the game when start button is clicked.
     */
    handleStartClick() {
        this.startGame();
        this.startBtn.focus();
    }

    /**
     * Restart the game when restart button is clicked.
     */
    handleRestartClick() {
        this.hideGameOver();
        this.startGame();
        this.startBtn.focus();
    }

    /**
     * Keyboard accessibility for start button.
     * @param {KeyboardEvent} e - The keyboard event.
     */
    handleStartKeyDown(e) {
        if (e.code === 'Enter' || e.code === 'Space') {
            e.preventDefault();
            this.startGame();
            this.startBtn.focus();
        }
    }

    /**
     * Keyboard accessibility for restart button.
     * @param {KeyboardEvent} e - The keyboard event.
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
     * Resize the game canvas and reposition the player.
     */
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.player.x = this.canvas.width / 2 - this.player.width / 2;
        this.player.y = this.canvas.height - this.player.height - 100;
    }
   
    /**
     * Start or restart the game, reset scores and state.
     */
    startGame() {
        this.gameRunning = true;

        this.score = 0;
        this.updateScore();
                
        this.asteroids = [];
        this.bullets = [];
        this.explosions = [];
        this.particles = [];
        this.stars = [];

        this.hideGameInfo();

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
     * End the game.
     */
    gameOver() {
        this.gameRunning = false;
        this.updateHighScore();
        this.showGameOver();
    }
    
    /**
     * Show the game over screen.
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
     * Hide the game info.
     */
    hideGameInfo() {
        this.gameInfo.classList.add('hidden');
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
            localStorage.setItem('darkHorizonHighScore', this.highScore);
        }
        document.getElementById('highScore').textContent = this.highScore;
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
            this.engineTrail.add(this.player);
        }
        this.engineTrail.update();
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
     * @param {{x: number, y: number, width: number, height: number}} rect1 - First rectangle.
     * @param {{x: number, y: number, width: number, height: number}} rect2 - Second rectangle.
     * @returns {boolean} True if collision detected, else false.
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
     * @returns {Asteroid} A new asteroid instance.
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
     * @returns {Bullet} A new bullet instance.
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
     * @param {number} x - X coordinate of explosion center.
     * @param {number} y - Y coordinate of explosion center.
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
     * Create a new collectible star object with random size and speed.
     * @returns {Star} A new star instance.
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
        this.drawBackground();
        this.drawAsteroids();
        this.drawBullets();
        this.drawCollectibleStars();
        this.drawExplosions();
        this.drawParticles();
        this.player.draw(this.ctx);
        this.engineTrail.draw(this.ctx);
    }

    /**
     * Draw the background.
     */
    drawBackground() {
        Background.draw(this.ctx, this.canvas);
        Nebula.draw(this.ctx, this.canvas);
        StarField.draw(this.ctx, this.canvas, this.starField, this.time);
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