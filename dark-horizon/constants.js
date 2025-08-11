/**
 * Dark Horizon game configuration constants.
 * The exported object is deeply frozen to prevent accidental mutation at runtime.
 *
 * @constant
 * @type {Readonly<object>}
 * @property {Object} COLORS - Color definitions for game elements.
 * @property {Object} ASTEROID - Asteroid properties.
 * @property {Object} BULLET - Bullet properties.
 * @property {Object} EXPLOSION - Explosion properties.
 * @property {Object} GAME - General game settings.
 * @property {Object} PLAYER - Player properties.
 * @property {Object} SIZES - Size settings for entities.
 * @property {Object} SPEEDS - Speed settings for entities.
 * @property {Object} STAR - Star properties.
 */
const COLORS = deepFreeze({
    ASTEROID: {
        GRAD_IN: '#666',
        GRAD_MID: '#444',
        GRAD_OUT: '#333',
        CRATER: '#555',
        OUTLINE: '#444'
    },
    BACKGROUND: {
        TOP: '#000',
        MID: '#222',
        BOTTOM: '#444'
    },
    BULLET: {
        SHADOW: '#ff6b6b',
        GRAD_TOP: '#ff6b6b',
        GRAD_MID: '#ff8e8e',
        GRAD_BOTTOM: '#ff4444',
        TRAIL: 'rgba(255, 107, 107, 0.5)'
    },
    ENGINE: {
        GLOW1: 'rgba(255, 100, 100, 0.8)',
        GLOW2: 'rgba(255, 150, 100, 0.4)',
        GLOW3: 'rgba(255, 200, 100, 0)'
    },
    EXPLOSION: {
        GRAD_IN: 'rgba(255, 255, 255, ', // alpha appended
        GRAD_MID1: 'rgba(255, 200, 100, ', // alpha appended
        GRAD_MID2: 'rgba(255, 100, 50, ', // alpha appended
        GRAD_OUT: 'rgba(255, 50, 0, 0)'
    },
    NEBULA: {
        N1: 'rgba(80, 130, 255, 0.1)',
        N2: 'rgba(255, 100, 100, 0.1)',
        N3: 'rgba(255, 200, 100, 0.1)',
        N4: 'rgba(180, 80, 255, 0.1)',
        N1_OUT: 'rgba(80, 130, 255, 0)',
        N2_OUT: 'rgba(255, 100, 100, 0)',
        N3_OUT: 'rgba(255, 200, 100, 0)',
        N4_OUT: 'rgba(180, 80, 255, 0)'
    },
    PLAYER: {
        GRAD_TOP: '#000',
        GRAD_MID: '#ddd',
        GRAD_BOTTOM: '#fff',
        OUTLINE: '#bbb',
        COCKPIT: '#b20000',
        GUN: '#b20000',
        SHADOW: '#000'
    },
    STAR: {
        BASE: '#ffd700',
        GRAD_IN: '#ffffff',
        GRAD_MID: '#ffd700',
        GRAD_OUT: '#ffa500'
    },
    UI: {
        OVERLAY_BACKDROP: 'rgba(0,0,0,0.5)',
        OVERLAY_TEXT: '#fff'
    }
});

export const CONFIG = deepFreeze({
    COLORS: COLORS,
    ASTEROID: {
        MIN_SIZE: 25,
        SIZE_VARIATION: 50,
        SPAWN_Y: -40,
        HORIZONTAL_MARGIN: 40,
        SPEED_VARIATION: 2
    },
    BULLET: {
        WIDTH: 4,
        HEIGHT: 15,
        SPAWN_OFFSET: -2
    },
    EXPLOSION: {
        PARTICLE_COUNT: 15,
        PARTICLE_LIFE: 30,
        PARTICLE_SIZE_MIN: 2,
        PARTICLE_SIZE_VARIATION: 4,
        SIZE: 50,
        OFFSET: 25,
        LIFE: 15
    },
    GAME: {
        SHOT_COOLDOWN: 200,
        STARFIELD_COUNT: 150,
        ASTEROID_SPAWN_RATE: 0.02,
        STAR_SPAWN_RATE: 0.01,
        STAR_SCORE: 20,
        ASTEROID_SCORE: 10
    },
    NEBULA: {
        COUNT_DESKTOP: 8,
        COUNT_MOBILE: 4,
        RADIUS_MIN_DESKTOP: 100,
        RADIUS_MAX_DESKTOP: 250,
        RADIUS_MIN_MOBILE: 50,
        RADIUS_MAX_MOBILE: 125
    },
    PLAYER: {
        SPAWN_Y_OFFSET: 100
    },
    SIZES: {
        PLAYER: 25
    },
    SPEEDS: {
        PLAYER: 8,
        BULLET: 8,
        ASTEROID_DESKTOP: 1.2,
        ASTEROID_MOBILE: 0.2,
        STAR: 1
    },
    STAR: {
        MIN_SIZE: 15,
        SIZE_VARIATION: 30,
        SPAWN_Y: -20,
        HORIZONTAL_MARGIN: 20,
        PARTICLE_BURST: 12,
        PARTICLE_LIFE: 20,
        PARTICLE_SIZE_MIN: 1,
        PARTICLE_SIZE_VARIATION: 2
    },
    UI: {
        PAUSE_OVERLAY: {
            BACKDROP: COLORS.UI.OVERLAY_BACKDROP,
            FONT: 'bold 28px system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
            MESSAGE: 'Paused - Esc to resume',
            TEXT_ALIGN: 'center',
            TEXT_BASELINE: 'middle',
            TEXT_COLOR: COLORS.UI.OVERLAY_TEXT
        }
    }
});

/**
 * Deeply freezes an object to make it immutable at all nested levels.
 * Note: Only freezes plain objects/arrays; primitives are ignored by Object.freeze.
 * @param {any} obj
 * @returns {any} The same object, deeply frozen
 */
function deepFreeze(obj) {
    if (obj && typeof obj === 'object' && !Object.isFrozen(obj)) {
        Object.getOwnPropertyNames(obj).forEach((prop) => {
            const value = obj[prop];
            if (value && typeof value === 'object') {
                deepFreeze(value);
            }
        });
        Object.freeze(obj);
    }
    return obj;
}