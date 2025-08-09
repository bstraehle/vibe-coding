/**
 * Dark Horizon game configuration constants.
 *
 * @constant
 * @type {Object}
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
export const CONFIG = {
    COLORS: {
        ASTEROID: {
            GRAD_IN: '#888',
            GRAD_MID: '#555',
            GRAD_OUT: '#222',
            CRATER: '#555',
            OUTLINE: '#222'
        },
        BACKGROUND: {
            TOP: '#000',
            MID: '#111',
            BOTTOM: '#222'
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
            N1: 'rgba(80, 80, 80, 0.3)',
            N2: 'rgba(40, 40, 40, 0.3)',
            N1_OUT: 'rgba(80, 80, 80, 0)',
            N2_OUT: 'rgba(40, 40, 40, 0)'
        },
        PLAYER: {
            GRAD_TOP: '#6b0000',
            GRAD_MID: '#222',
            GRAD_BOTTOM: '#111',
            OUTLINE: '#b20000',
            COCKPIT: '#b20000',
            GUN: '#b20000',
            SHADOW: '#222'
        },
        STAR: {
            BASE: '#ffd700',
            GRAD_IN: '#ffffff',
            GRAD_MID: '#ffd700',
            GRAD_OUT: '#ffa500'
        }
    },
    ASTEROID: {
        MIN_SIZE: 30,
        SIZE_VARIATION: 20,
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
        STAR_SPAWN_RATE: 0.01
    },
    PLAYER: {
        SPAWN_Y_OFFSET: 100
    },
    SIZES: {
        PLAYER: 30
    },
    SPEEDS: {
        PLAYER: 8,
        BULLET: 8,
        ASTEROID_DESKTOP: 1.2,
        ASTEROID_MOBILE: 0.6,
        STAR: 1
    },
    STAR: {
        MIN_SIZE: 15,
        SIZE_VARIATION: 10,
        SPAWN_Y: -20,
        HORIZONTAL_MARGIN: 20,
        PARTICLE_BURST: 12,
        PARTICLE_LIFE: 20,
        PARTICLE_SIZE_MIN: 1,
        PARTICLE_SIZE_VARIATION: 2
    }
};