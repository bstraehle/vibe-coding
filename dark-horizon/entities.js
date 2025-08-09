import { CONFIG } from './constants.js';

/**
 * Represents an asteroid obstacle in the game world, managing its position, movement, and visual appearance.
 */
export class Asteroid {
    /**
     * Creates an instance of Asteroid.
     * @param {number} x - The x position of the asteroid.
     * @param {number} y - The y position of the asteroid.
     * @param {number} width - The width of the asteroid.
     * @param {number} height - The height of the asteroid.
     * @param {number} speed - The speed of the asteroid.
     */
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }
    /**
     * Updates the asteroid's position.
     */
    update() {
        this.y += this.speed;
    }
    /**
     * Draws the asteroid on the canvas.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     */
    draw(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const radius = this.width / 2;
        const asteroidGradient = ctx.createRadialGradient(centerX - radius * 0.3, centerY - radius * 0.3, 0, centerX, centerY, radius);
        asteroidGradient.addColorStop(0, CONFIG.COLORS.ASTEROID.GRAD_IN);
        asteroidGradient.addColorStop(0.6, CONFIG.COLORS.ASTEROID.GRAD_MID);
        asteroidGradient.addColorStop(1, CONFIG.COLORS.ASTEROID.GRAD_OUT);
        ctx.fillStyle = asteroidGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = CONFIG.COLORS.ASTEROID.CRATER;
        for (let i = 0; i < 3; i++) {
            const craterX = centerX + (Math.random() - 0.5) * radius * 0.8;
            const craterY = centerY + (Math.random() - 0.5) * radius * 0.8;
            const craterSize = Math.random() * radius * 0.3 + 2;
            ctx.beginPath();
            ctx.arc(craterX, craterY, craterSize, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.strokeStyle = CONFIG.COLORS.ASTEROID.OUTLINE;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

/**
 * Provides static methods for rendering the main game background gradient.
 */
export class Background {
    /**
     * Draws the background gradient.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {HTMLCanvasElement} canvas - The canvas element.
     */
    static draw(ctx, canvas) {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, CONFIG.COLORS.BACKGROUND.TOP);
        gradient.addColorStop(0.5, CONFIG.COLORS.BACKGROUND.MID);
        gradient.addColorStop(1, CONFIG.COLORS.BACKGROUND.BOTTOM);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

/**
 * Models a projectile fired by the player, including its movement and rendering.
 */
export class Bullet {
    /**
     * Creates an instance of Bullet.
     * @param {number} x - The x position of the bullet.
     * @param {number} y - The y position of the bullet.
     * @param {number} width - The width of the bullet.
     * @param {number} height - The height of the bullet.
     * @param {number} speed - The speed of the bullet.
     */
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }
    /**
     * Updates the bullet's position.
     */
    update() {
        this.y -= this.speed;
    }
    /**
     * Draws the bullet on the canvas.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     */
    draw(ctx) {
    ctx.shadowColor = CONFIG.COLORS.BULLET.SHADOW;
        ctx.shadowBlur = 8;
        const bulletGradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        bulletGradient.addColorStop(0, CONFIG.COLORS.BULLET.GRAD_TOP);
        bulletGradient.addColorStop(0.5, CONFIG.COLORS.BULLET.GRAD_MID);
        bulletGradient.addColorStop(1, CONFIG.COLORS.BULLET.GRAD_BOTTOM);
        ctx.fillStyle = bulletGradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = CONFIG.COLORS.BULLET.TRAIL;
        ctx.fillRect(this.x, this.y + this.height, this.width, 10);
        ctx.shadowBlur = 0;
    }
}

/**
 * Manages and renders the glowing engine trail particles emitted by the player ship.
 */
export class EngineTrail {
    constructor() {
        this.particles = [];
    }
    /**
     * Adds a new particle to the engine trail.
     * @param {Player} player - The player object.
     */
    add(player) {
        const centerX = player.x + player.width / 2;
        const trailY = player.y + player.height;
        this.particles.push({
            x: centerX + (Math.random() - 0.5) * 4,
            y: trailY,
            life: 20,
            size: Math.random() * 3 + 1
        });
    }
    /**
     * Updates all engine trail particles.
     */
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.y += 2;
            particle.life--;
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    /**
     * Draws all engine trail particles.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     */
    draw(ctx) {
        this.particles.forEach(particle => {
            const alpha = particle.life / 20;
            ctx.globalAlpha = alpha;
            const trailGradient = ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size * 2
            );
            trailGradient.addColorStop(0, CONFIG.COLORS.ENGINE.GLOW1);
            trailGradient.addColorStop(1, CONFIG.COLORS.ENGINE.GLOW3);
            ctx.fillStyle = trailGradient;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }
}

/**
 * Handles the visual representation and animation of explosion effects for collisions and object destruction.
 */
export class Explosion {
    /**
     * Creates an instance of Explosion.
     * @param {number} x - The x position of the explosion.
     * @param {number} y - The y position of the explosion.
     * @param {number} width - The width of the explosion.
     * @param {number} height - The height of the explosion.
     * @param {number} life - The current life of the explosion.
     * @param {number} maxLife - The maximum life of the explosion.
     */
    constructor(x, y, width, height, life, maxLife) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.life = life;
        this.maxLife = maxLife;
    }
    /**
     * Updates the explosion's life.
     */
    update() {
        this.life--;
    }
    /**
     * Draws the explosion on the canvas.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     */
    draw(ctx) {
        const alpha = this.life / this.maxLife;
        const scale = 1 + (1 - alpha) * 2;
        const explosionGradient = ctx.createRadialGradient(
            this.x + this.width / 2, this.y + this.height / 2, 0,
            this.x + this.width / 2, this.y + this.height / 2, this.width / 2 * scale
        );
        explosionGradient.addColorStop(0, `${CONFIG.COLORS.EXPLOSION.GRAD_IN}${alpha})`);
        explosionGradient.addColorStop(0.3, `${CONFIG.COLORS.EXPLOSION.GRAD_MID1}${alpha * 0.8})`);
        explosionGradient.addColorStop(0.7, `${CONFIG.COLORS.EXPLOSION.GRAD_MID2}${alpha * 0.6})`);
        explosionGradient.addColorStop(1, CONFIG.COLORS.EXPLOSION.GRAD_OUT);
        ctx.fillStyle = explosionGradient;
        ctx.beginPath();
        ctx.arc(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.width / 2 * scale,
            0, Math.PI * 2
        );
        ctx.fill();
    }
}

/**
 * Class representing nebula visual effects for the game background.
 * Provides static methods to initialize and render nebula gradients.
 *
 * Nebulae are rendered as radial gradients with randomized positions, radii, and colors.
 */
export class Nebula {
    /**
     * Initializes nebula configurations for rendering.
     * Generates an array of nebula objects with randomized position, radius, and color properties.
     *
     * @param {HTMLCanvasElement} canvas - The canvas element used to determine nebula positions and sizes.
     * @returns {Array<Object>} Array of nebula configuration objects, each containing x, y, r, color0, and color1.
     */
    static init(canvas) {
        const nebulaColors = [
            { color0: CONFIG.COLORS.NEBULA.N1, color1: CONFIG.COLORS.NEBULA.N1_OUT },
            { color0: CONFIG.COLORS.NEBULA.N2, color1: CONFIG.COLORS.NEBULA.N2_OUT },
            { color0: CONFIG.COLORS.NEBULA.N3, color1: CONFIG.COLORS.NEBULA.N3_OUT },
            { color0: CONFIG.COLORS.NEBULA.N4, color1: CONFIG.COLORS.NEBULA.N4_OUT }
        ];
        return Array.from({ length: CONFIG.NEBULA.COUNT }, () => {
            const colorSet = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];
            return {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * CONFIG.NEBULA.RADIUS_MAX + CONFIG.NEBULA.RADIUS_MIN,
                color0: colorSet.color0,
                color1: colorSet.color1,
                dx: (Math.random() - 0.5) * 0.7,
                dy: (Math.random() - 0.5) * 0.7,
                dr: (Math.random() - 0.5) * 0.3
            };
        });
    }
    /**
     * Animates nebula by updating position and radius over time.
     * @param {Array<Object>} nebulaConfigs - Array of nebula configuration objects.
     * @param {number} time - Current game time/frame.
     * @param {HTMLCanvasElement} canvas - The canvas element for bounds.
     */
    static update(nebulaConfigs, time, canvas) {
        for (const nebula of nebulaConfigs) {
            nebula.x += nebula.dx;
            nebula.y += nebula.dy;
            nebula.r += nebula.dr;
            if (nebula.x < 0 || nebula.x > canvas.width) nebula.dx *= -1;
            if (nebula.y < 0 || nebula.y > canvas.height) nebula.dy *= -1;
            if (nebula.r < CONFIG.NEBULA.RADIUS_MIN || nebula.r > CONFIG.NEBULA.RADIUS_MAX) nebula.dr *= -1;
        }
    }
    /**
     * Draws nebula gradients on the canvas using the provided nebula configurations.
     * Each nebula is rendered as a radial gradient at its specified position and radius.
     *
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {HTMLCanvasElement} canvas - The canvas element.
     * @param {Array<Object>} nebulaConfigs - Array of nebula configuration objects from Nebula.init().
     */
    static draw(ctx, canvas, nebulaConfigs) {
        ctx.save();
        for (const nebula of nebulaConfigs) {
            const grad = ctx.createRadialGradient(
                nebula.x, nebula.y, 0,
                nebula.x, nebula.y, nebula.r
            );
            grad.addColorStop(0, nebula.color0);
            grad.addColorStop(1, nebula.color1);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.restore();
    }
}

/**
 * Models a single particle used in visual effects such as explosions, trails, or other dynamic elements.
 */
export class Particle {
    /**
     * Creates an instance of Particle.
     * @param {number} x - The x position of the particle.
     * @param {number} y - The y position of the particle.
     * @param {number} vx - The x velocity of the particle.
     * @param {number} vy - The y velocity of the particle.
     * @param {number} life - The current life of the particle.
     * @param {number} maxLife - The maximum life of the particle.
     * @param {number} size - The size of the particle.
     * @param {string} color - The color of the particle.
     */
    constructor(x, y, vx, vy, life, maxLife, size, color) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = maxLife;
        this.size = size;
        this.color = color;
    }
    /**
     * Updates the particle's position and life.
     */
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.vy += 0.1;
    }
    /**
     * Draws the particle on the canvas.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     */
    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.size;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }
}

/**
 * Represents the player-controlled spaceship, including movement, input handling, and rendering.
 */
export class Player {
    /**
     * Creates an instance of Player.
     * @param {number} x - The x position of the player ship.
     * @param {number} y - The y position of the player ship.
     * @param {number} width - The width of the player ship.
     * @param {number} height - The height of the player ship.
     * @param {number} speed - The speed of the player ship.
     */
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }
    /**
     * Updates the player's position based on input or mouse position.
     * @param {Object} input - The input state.
     * @param {{x: number, y: number}} mousePos - The mouse position.
     * @param {HTMLCanvasElement} canvas - The canvas element.
     */
    update(input, mousePos, canvas) {
        const keyboardPressed = input['ArrowLeft'] || input['KeyA'] ||
            input['ArrowRight'] || input['KeyD'] ||
            input['ArrowUp'] || input['KeyW'] ||
            input['ArrowDown'] || input['KeyS'];
        if (keyboardPressed) {
            if (input['ArrowLeft'] || input['KeyA']) this.x -= this.speed;
            if (input['ArrowRight'] || input['KeyD']) this.x += this.speed;
            if (input['ArrowUp'] || input['KeyW']) this.y -= this.speed;
            if (input['ArrowDown'] || input['KeyS']) this.y += this.speed;
        } else if (mousePos.x > 0 && mousePos.y > 0) {
            const targetX = mousePos.x - this.width / 2;
            const targetY = mousePos.y - this.height / 2;
            this.x += (targetX - this.x) * 0.1;
            this.y += (targetY - this.y) * 0.1;
        }
        this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
        this.y = Math.max(0, Math.min(canvas.height - this.height, this.y));
    }
    /**
     * Draws the player ship on the canvas.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     */
    draw(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        Player.drawEngineGlow(ctx, centerX, this.y + this.height);
        const shipGradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        shipGradient.addColorStop(0, CONFIG.COLORS.PLAYER.GRAD_TOP);
        shipGradient.addColorStop(0.5, CONFIG.COLORS.PLAYER.GRAD_MID);
        shipGradient.addColorStop(1, CONFIG.COLORS.PLAYER.GRAD_BOTTOM);
        ctx.fillStyle = shipGradient;
        ctx.beginPath();
        ctx.moveTo(centerX, this.y);
        ctx.lineTo(this.x - 10, this.y + this.height * 0.55);
        ctx.lineTo(this.x + this.width * 0.15, this.y + this.height * 0.7);
        ctx.lineTo(this.x + this.width * 0.25, this.y + this.height);
        ctx.lineTo(centerX, this.y + this.height * 0.95);
        ctx.lineTo(this.x + this.width * 0.75, this.y + this.height);
        ctx.lineTo(this.x + this.width * 0.85, this.y + this.height * 0.7);
        ctx.lineTo(this.x + this.width + 10, this.y + this.height * 0.55);
        ctx.lineTo(centerX, this.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = CONFIG.COLORS.PLAYER.OUTLINE;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.fillStyle = CONFIG.COLORS.PLAYER.COCKPIT;
        ctx.beginPath();
        ctx.ellipse(centerX, this.y + this.height * 0.32, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = CONFIG.COLORS.PLAYER.GUN;
        ctx.fillRect(centerX - 2, this.y - 8, 4, 10);
        ctx.shadowColor = CONFIG.COLORS.PLAYER.SHADOW;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
    /**
     * Draws the engine glow for the player ship.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {number} x - The x position for the glow.
     * @param {number} y - The y position for the glow.
     */
    static drawEngineGlow(ctx, x, y) {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
        gradient.addColorStop(0, CONFIG.COLORS.ENGINE.GLOW1);
        gradient.addColorStop(0.5, CONFIG.COLORS.ENGINE.GLOW2);
        gradient.addColorStop(1, CONFIG.COLORS.ENGINE.GLOW3);
        ctx.fillStyle = gradient;
        ctx.fillRect(x - 20, y, 40, 30);
    }
}

/**
 * Models a single star in the background, including its animation and rendering.
 */
export class Star {
    /**
     * Creates an instance of Star.
     * @param {number} x - The x position of the star.
     * @param {number} y - The y position of the star.
     * @param {number} width - The width of the star.
     * @param {number} height - The height of the star.
     * @param {number} speed - The speed of the star.
     */
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }
    /**
     * Updates the star's position.
     */
    update() {
        this.y += this.speed;
    }
    /**
     * Draws the star on the canvas.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {number} time - The current time for animation.
     */
    draw(ctx, time) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const size = this.width / 2;
        const pulse = Math.sin(time * 0.01) * 0.2 + 0.8;
        const scaledSize = size * pulse;
        ctx.shadowColor = CONFIG.COLORS.STAR.BASE;
        ctx.shadowBlur = 15;
        const starGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, scaledSize);
        starGradient.addColorStop(0, CONFIG.COLORS.STAR.GRAD_IN);
        starGradient.addColorStop(0.3, CONFIG.COLORS.STAR.GRAD_MID);
        starGradient.addColorStop(1, CONFIG.COLORS.STAR.GRAD_OUT);
        ctx.fillStyle = starGradient;
        Star.drawStar(ctx, centerX, centerY, scaledSize);
        ctx.shadowBlur = 0;
    }
    /**
     * Draws a star shape.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {number} x - The x position of the star.
     * @param {number} y - The y position of the star.
     * @param {number} size - The size of the star.
     */
    static drawStar(ctx, x, y, size) {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const x1 = x + size * Math.cos(angle);
            const y1 = y + size * Math.sin(angle);
            if (i === 0) ctx.moveTo(x1, y1);
            else ctx.lineTo(x1, y1);
            const innerAngle = angle + Math.PI / 5;
            const x2 = x + size * 0.4 * Math.cos(innerAngle);
            const y2 = y + size * 0.4 * Math.sin(innerAngle);
            ctx.lineTo(x2, y2);
        }
        ctx.closePath();
        ctx.fill();
    }
}

/**
 * Provides static methods for initializing and rendering the animated star field background.
 */
export class StarField {
    /**
     * Initializes the star field array.
     * @param {HTMLCanvasElement} canvas - The canvas element.
     * @returns {Array<Object>} Array of star objects.
     */
    static init(canvas) {
        return Array.from({ length: CONFIG.GAME.STARFIELD_COUNT }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 0.5 + 0.1,
            brightness: Math.random() * 0.5 + 0.5
        }));
    }
    /**
     * Draws the star field on the canvas.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {HTMLCanvasElement} canvas - The canvas element.
     * @param {Array<Object>} starField - Array of star objects.
     * @param {number} time - The current time for animation.
     */
    static draw(ctx, canvas, starField, time) {
        ctx.fillStyle = CONFIG.COLORS.STAR.GRAD_IN;
        starField.forEach(star => {
            star.y += star.speed;
            if (star.y > canvas.height) {
                star.y = -5;
                star.x = Math.random() * canvas.width;
            }
            const twinkle = Math.sin(time * 0.01 + star.x) * 0.3 + 0.7;
            ctx.globalAlpha = star.brightness * twinkle;
            ctx.shadowColor = CONFIG.COLORS.STAR.GRAD_IN;
            ctx.shadowBlur = star.size * 2;
            ctx.fillRect(star.x, star.y, star.size, star.size);
            ctx.shadowBlur = 0;
        });
        ctx.globalAlpha = 1;
    }
}