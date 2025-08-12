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
        this.view = { width: 0, height: 0, dpr: 1 };
        this.gameInfo = document.getElementById('gameInfo');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');

        try {
            this.highScore = Number(localStorage.getItem('darkHorizonHighScore')) || 0;
        } catch (_) {
            this.highScore = 0;
        }
        this.score = 0;
        this.updateHighScore();

        this.keys = {};
        this.mousePos = { x: 0, y: 0 };

        this._isMobile = this.isMobile();

        this.asteroidSpeed = this._isMobile ? CONFIG.SPEEDS.ASTEROID_MOBILE : CONFIG.SPEEDS.ASTEROID_DESKTOP;
        this.bulletSpeed = CONFIG.SPEEDS.BULLET;
        this.starSpeed = CONFIG.SPEEDS.STAR;

        this.lastShot = 0;
        this.shotCooldown = CONFIG.GAME.SHOT_COOLDOWN;

        this.gameRunning = false;
        this.paused = false;

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
        this.initBackground();
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
        this.handleResize = this.handleResize.bind(this);
        this.shoot = this.shoot.bind(this);
        this.movementKeys = new Set([
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyD', 'KeyW', 'KeyS'
        ]);
    }

    /**
     * Set up keyboard, mouse, touch, and button event listeners.
     */
    setupEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        // Window resize (debounced via rAF)
        window.addEventListener('resize', this.handleResize);
        // Mouse events
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('click', this.shoot);
        // Touch events for mobile
        this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        // Button events
        this.startBtn.addEventListener('click', this.handleStartClick);
        this.restartBtn.addEventListener('click', this.handleRestartClick);
        // Keyboard accessibility for buttons
        this.startBtn.addEventListener('keydown', this.handleStartKeyDown);
        this.restartBtn.addEventListener('keydown', this.handleRestartKeyDown);
        // Pause toggle
        window.addEventListener('keydown', (e) => {
            if ((e.code === 'Escape' || e.key === 'Escape' || e.key === 'Esc') && this.gameRunning && !e.repeat) {
                e.preventDefault();
                this.togglePause();
                return;
            }
            if (this.paused && this.gameRunning && !e.repeat && (e.code === 'Enter' || e.code === 'Space')) {
                e.preventDefault();
                this.togglePause();
            }
        });
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
        if (this.movementKeys.has(e.code)) {
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
    if (!this.gameRunning || this.paused) return;
        const now = Date.now();
        if (now - this.lastShot < this.shotCooldown) return;
        this.bullets.push(this.createBullet());
        this.lastShot = now;
    }
      
    /**
     * Resize the game canvas and reposition the player.
     */
    resizeCanvas() {
        const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
        this.view.dpr = dpr;
        this.view.width = Math.floor(window.innerWidth);
        this.view.height = Math.floor(window.innerHeight);
        this.canvas.style.width = this.view.width + 'px';
        this.canvas.style.height = this.view.height + 'px';
        this.canvas.width = Math.floor(this.view.width * dpr);
        this.canvas.height = Math.floor(this.view.height * dpr);
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.player.x = this.view.width / 2 - this.player.width / 2;
        this.player.y = this.view.height - this.player.height - CONFIG.PLAYER.SPAWN_Y_OFFSET;
    }

    /**
     * Debounced resize handler to avoid excessive work during window resizing.
     */
    handleResize() {
        if (this._resizeScheduled) return;
            this._resizeScheduled = true;
            requestAnimationFrame(() => {
            this._resizeScheduled = false;
            this.resizeCanvas();
            this.initBackground();
            if (!this.gameRunning) {
                this.drawBackground();
            }
        });
    }
   
    /**
     * Start or restart the game, reset scores and state.
     */
    startGame() {
        this.gameRunning = true;
        this.resetGameState();
        this.hideGameInfo();
        this.initBackground();
        this.gameLoop();
    }

    /**
     * Reset score and clear dynamic entity arrays.
     */
    resetGameState() {
        this.score = 0;
        this.updateScore();
        this.asteroids = [];
        this.bullets = [];
        this.explosions = [];
        this.particles = [];
        this.stars = [];
        this.lastShot = 0;
    }

    /**
     * Main game loop: update and draw each frame.
     */
    gameLoop() {
        if (!this.gameRunning) return;
        this.time++;
        if (!this.paused) {
            this.update();
        }
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * Toggle pause state.
     */
    togglePause() {
        this.paused = !this.paused;
    }

    /**
     * End the game.
     */
    gameOver() {
        this.gameRunning = false;
        this.paused = false;
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
            try {
                localStorage.setItem('darkHorizonHighScore', this.highScore);
            } catch (_) {
                // ignore storage errors (e.g., privacy mode)
            }
        }
        document.getElementById('highScore').textContent = this.highScore;
    }

    /**
     * Update all game objects and check collisions.
     */
    update() {
        if (this.nebulaConfigs) {
            Nebula.update(this.view.width, this.view.height, this.nebulaConfigs, this._isMobile);
        }
        this.updateAsteroids();
        this.updateBullets();
        this.updateEngineTrail();
        this.updateExplosions();
        this.updateParticles();
        this.updateStars();
        this.spawnObjects();
        this.checkCollisions();
        this.player.update(this.keys, this.mousePos, this.view);
    }

    /**
     * Move asteroids and remove those off-screen.
     */
    updateAsteroids() {
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            const asteroid = this.asteroids[i];
            asteroid.update();
            if (asteroid.y > this.view.height) {
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
            if (star.y > this.view.height) {
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
                    this.score += CONFIG.GAME.ASTEROID_SCORE;
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
                for (let p = 0; p < CONFIG.STAR.PARTICLE_BURST; p++) {
                    this.particles.push(new Particle(
                        star.x + star.width / 2,
                        star.y + star.height / 2,
                        Math.cos((Math.PI * 2 * p) / CONFIG.STAR.PARTICLE_BURST) * (Math.random() * 3 + 2),
                        Math.sin((Math.PI * 2 * p) / CONFIG.STAR.PARTICLE_BURST) * (Math.random() * 3 + 2),
                        CONFIG.STAR.PARTICLE_LIFE,
                        CONFIG.STAR.PARTICLE_LIFE,
                        Math.random() * CONFIG.STAR.PARTICLE_SIZE_VARIATION + CONFIG.STAR.PARTICLE_SIZE_MIN, CONFIG.COLORS.STAR.BASE
                    ));
                }
                this.stars.splice(i, 1);
                this.score += CONFIG.GAME.STAR_SCORE;
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
        const minX = CONFIG.ASTEROID.HORIZONTAL_MARGIN / 2;
        const maxX = Math.max(minX, this.view.width - width - CONFIG.ASTEROID.HORIZONTAL_MARGIN / 2);
        const x = minX + Math.random() * (maxX - minX);
        return new Asteroid(x, CONFIG.ASTEROID.SPAWN_Y, width, height, speed);
    }

    /**
     * Create a new bullet object at the player's position.
     * @returns {Bullet} A new bullet instance.
     */
    createBullet() {
        const bx = this.player.x + (this.player.width - CONFIG.BULLET.WIDTH) / 2 + CONFIG.BULLET.SPAWN_OFFSET;
        return new Bullet(bx, this.player.y, CONFIG.BULLET.WIDTH, CONFIG.BULLET.HEIGHT, this.bulletSpeed);
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
        const minX = CONFIG.STAR.HORIZONTAL_MARGIN / 2;
        const maxX = Math.max(minX, this.view.width - width - CONFIG.STAR.HORIZONTAL_MARGIN / 2);
        const x = minX + Math.random() * (maxX - minX);
        return new Star(x, CONFIG.STAR.SPAWN_Y, width, height, speed);
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
     * Init the background.
     */
    initBackground() {
        if (this.gameRunning) {
            this.nebulaConfigs = Nebula.init(this.view.width, this.view.height, this._isMobile);
        }
        this.starField = StarField.init(this.view.width, this.view.height);
    }

    /**
     * Draw the background.
     */
    drawBackground() {
        Background.draw(this.ctx, this.view.width, this.view.height);
        if (this.gameRunning && this.nebulaConfigs) {
            Nebula.draw(this.ctx, this.nebulaConfigs);
        }
        StarField.draw(this.ctx, this.view.width, this.view.height, this.starField, this.time);
        if (this.gameRunning && this.paused) {
            this.ctx.save();
            this.ctx.fillStyle = CONFIG.UI.PAUSE_OVERLAY.BACKDROP;
            this.ctx.fillRect(0, 0, this.view.width, this.view.height);
            this.ctx.fillStyle = CONFIG.UI.PAUSE_OVERLAY.TEXT_COLOR;
            this.ctx.font = CONFIG.UI.PAUSE_OVERLAY.FONT;
            this.ctx.textAlign = CONFIG.UI.PAUSE_OVERLAY.TEXT_ALIGN;
            this.ctx.textBaseline = CONFIG.UI.PAUSE_OVERLAY.TEXT_BASELINE;
            this.ctx.fillText(CONFIG.UI.PAUSE_OVERLAY.MESSAGE, this.view.width / 2, this.view.height / 2);
            this.ctx.restore();
        }
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
