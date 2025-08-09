// Dark Horizon entity classes

import { CONFIG } from './constants.js';

export class Asteroid {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }
    update() {
        this.y += this.speed;
    }
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

export class Background {
    static draw(ctx, canvas) {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, CONFIG.COLORS.BACKGROUND.TOP);
        gradient.addColorStop(0.5, CONFIG.COLORS.BACKGROUND.MID);
        gradient.addColorStop(1, CONFIG.COLORS.BACKGROUND.BOTTOM);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

export class Bullet {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }
    update() {
        this.y -= this.speed;
    }
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

export class Explosion {
    constructor(x, y, width, height, life, maxLife) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.life = life;
        this.maxLife = maxLife;
    }
    update() {
        this.life--;
    }
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

export class Nebula {
    static draw(ctx, canvas) {
        ctx.save();
        ctx.globalAlpha = 0.1;
        const nebula1 = ctx.createRadialGradient(
            canvas.width * 0.3, canvas.height * 0.2, 0,
            canvas.width * 0.3, canvas.height * 0.2, 200
        );
        nebula1.addColorStop(0, CONFIG.COLORS.NEBULA.N1);
        nebula1.addColorStop(1, CONFIG.COLORS.NEBULA.N1_OUT);
        const nebula2 = ctx.createRadialGradient(
            canvas.width * 0.7, canvas.height * 0.8, 0,
            canvas.width * 0.7, canvas.height * 0.8, 150
        );
        nebula2.addColorStop(0, CONFIG.COLORS.NEBULA.N2);
        nebula2.addColorStop(1, CONFIG.COLORS.NEBULA.N2_OUT);
        ctx.fillStyle = nebula1;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = nebula2;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }
}

export class Particle {
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
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.vy += 0.1;
    }
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

export class Player {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }
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
    drawEngineTrail(ctx, engineTrail) {
        engineTrail.forEach(particle => {
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
    static drawEngineGlow(ctx, x, y) {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
        gradient.addColorStop(0, CONFIG.COLORS.ENGINE.GLOW1);
        gradient.addColorStop(0.5, CONFIG.COLORS.ENGINE.GLOW2);
        gradient.addColorStop(1, CONFIG.COLORS.ENGINE.GLOW3);
        ctx.fillStyle = gradient;
        ctx.fillRect(x - 20, y, 40, 30);
    }
}

export class Star {
    constructor(x, y, width, height, speed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.speed = speed;
    }
    update() {
        this.y += this.speed;
    }
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