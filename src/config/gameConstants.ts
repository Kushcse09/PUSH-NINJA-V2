/**
 * Game Constants
 * Centralized game configuration and magic numbers
 */

// Game difficulty progression (in milliseconds)
export const DIFFICULTY_TIERS = {
    TUTORIAL: {
        duration: 15000, // 15 seconds
        waveSize: [1],
        waveProbability: [1.0], // 100% single token
        spawnInterval: 3000,
        staggerDelay: 0,
        label: 'Tutorial',
    },
    BEGINNER: {
        duration: 30000, // 30 seconds
        waveSize: [1, 2], // 80% single, 20% pairs
        waveProbability: [0.8, 0.2],
        spawnInterval: 2500,
        staggerDelay: 200,
        label: 'Beginner',
    },
    INTERMEDIATE: {
        duration: 50000, // 50 seconds
        waveSize: [1, 2],
        waveProbability: [0.5, 0.5],
        spawnInterval: 2200,
        staggerDelay: 180,
        label: 'Intermediate',
    },
    ADVANCED: {
        duration: 70000, // 70 seconds
        waveSize: [1, 2, 3],
        waveProbability: [0.3, 0.4, 0.3],
        spawnInterval: 2000,
        staggerDelay: 150,
        label: 'Advanced',
    },
    EXPERT: {
        duration: 90000, // 90 seconds
        waveSize: [2, 3, 4],
        waveProbability: [0.3, 0.4, 0.3],
        spawnInterval: 1800,
        staggerDelay: 130,
        label: 'Expert',
    },
    MASTER: {
        duration: Infinity,
        waveSize: [3, 4, 5],
        waveProbability: [0.3, 0.4, 0.3],
        spawnInterval: 1500,
        staggerDelay: 100,
        label: 'Master',
    },
} as const;

// Gameplay constants
export const GAME_CONSTANTS = {
    // Lives and health
    MAX_LIVES: 3,
    INITIAL_LIVES: 3,

    // Scoring
    MAX_REASONABLE_SCORE: 1000000,
    BASE_POINTS_PER_TOKEN: 10,
    COMBO_MULTIPLIER: 1.5,

    // Combo system
    COMBO_TIMEOUT_MS: 2000, // 2 seconds
    MIN_COMBO: 2,
    MAX_COMBO_DISPLAY: 99,

    // Game loop timing
    GAME_LOOP_INTERVAL_MS: 16, // ~60 FPS
    SPAWN_CHECK_INTERVAL_MS: 50,

    // Performance limits
    MAX_ITEMS_ON_SCREEN: 15,
    CLEANUP_THRESHOLD: 15,

    // Multiplayer
    COUNTDOWN_DURATION_MS: 3000,
    COUNTDOWN_START_DELAY_MS: 500,
    DISCONNECT_GRACE_PERIOD_MS: 5000,

    // Room codes
    ROOM_CODE_LENGTH: 6,
    ROOM_CODE_EXPIRY_MS: 5 * 60 * 1000, // 5 minutes (reduced from 30)

    // Stale game cleanup
    STALE_GAME_TIMEOUT_MS: 100 * 1000, // 100 seconds
    CLEANUP_INTERVAL_MS: 30 * 1000, // 30 seconds
} as const;

/**
 * Get difficulty tier based on elapsed time
 */
export function getDifficultyTier(elapsedMs: number) {
    if (elapsedMs < DIFFICULTY_TIERS.TUTORIAL.duration) return DIFFICULTY_TIERS.TUTORIAL;
    if (elapsedMs < DIFFICULTY_TIERS.BEGINNER.duration) return DIFFICULTY_TIERS.BEGINNER;
    if (elapsedMs < DIFFICULTY_TIERS.INTERMEDIATE.duration) return DIFFICULTY_TIERS.INTERMEDIATE;
    if (elapsedMs < DIFFICULTY_TIERS.ADVANCED.duration) return DIFFICULTY_TIERS.ADVANCED;
    if (elapsedMs < DIFFICULTY_TIERS.EXPERT.duration) return DIFFICULTY_TIERS.EXPERT;
    return DIFFICULTY_TIERS.MASTER;
}

/**
 * Calculate wave size based on difficulty tier
 */
export function calculateWaveSize(tier: typeof DIFFICULTY_TIERS[keyof typeof DIFFICULTY_TIERS]): number {
    if (tier.waveSize.length === 1) {
        return tier.waveSize[0];
    }

    const rand = Math.random();
    let cumulative = 0;
    const probabilities = tier.waveProbability || tier.waveSize.map(() => 1 / tier.waveSize.length);

    for (let i = 0; i < tier.waveSize.length; i++) {
        cumulative += probabilities[i];
        if (rand < cumulative) {
            return tier.waveSize[i];
        }
    }

    return tier.waveSize[tier.waveSize.length - 1];
}
