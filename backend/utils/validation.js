/**
 * Input Validation Utilities
 * Provides validation functions for game data and user inputs
 */

/**
 * Validate Ethereum address format
 * @param {string} address - Ethereum address to validate
 * @returns {boolean} - True if valid
 */
export function isValidAddress(address) {
    if (!address || typeof address !== 'string') {
        return false;
    }
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate game ID
 * @param {any} gameId - Game ID to validate
 * @returns {boolean} - True if valid
 */
export function isValidGameId(gameId) {
    if (gameId === null || gameId === undefined) {
        return false;
    }
    const num = Number(gameId);
    return !isNaN(num) && num > 0 && Number.isInteger(num);
}

/**
 * Validate score value
 * @param {any} score - Score to validate
 * @returns {boolean} - True if valid
 */
export function isValidScore(score) {
    if (score === null || score === undefined) {
        return false;
    }
    const num = Number(score);
    return !isNaN(num) && num >= 0 && num <= 1000000; // Max reasonable score
}

/**
 * Validate and sanitize game input data
 * @param {object} data - Input data containing gameId and playerAddress
 * @returns {object} - Validated and normalized data
 * @throws {Error} - If validation fails
 */
export function validateGameInput(data) {
    const { gameId, playerAddress } = data || {};

    if (!isValidGameId(gameId)) {
        throw new Error('Invalid game ID');
    }

    if (!isValidAddress(playerAddress)) {
        throw new Error('Invalid player address');
    }

    return {
        gameId: parseInt(gameId),
        playerAddress: playerAddress.toLowerCase(),
    };
}

/**
 * Validate score submission data
 * @param {object} data - Score submission data
 * @returns {object} - Validated data
 * @throws {Error} - If validation fails
 */
export function validateScoreSubmission(data) {
    const { gameId, playerAddress, score } = data || {};

    if (!isValidGameId(gameId)) {
        throw new Error('Invalid game ID');
    }

    if (!isValidAddress(playerAddress)) {
        throw new Error('Invalid player address');
    }

    if (!isValidScore(score)) {
        throw new Error('Invalid score value');
    }

    return {
        gameId: parseInt(gameId),
        playerAddress: playerAddress.toLowerCase(),
        score: parseInt(score),
    };
}

/**
 * Validate room code format
 * @param {string} roomCode - Room code to validate
 * @returns {boolean} - True if valid
 */
export function isValidRoomCode(roomCode) {
    if (!roomCode || typeof roomCode !== 'string') {
        return false;
    }
    // Room codes should be 6 alphanumeric characters
    return /^[A-Z0-9]{6}$/i.test(roomCode);
}

/**
 * Sanitize room code
 * @param {string} roomCode - Room code to sanitize
 * @returns {string} - Uppercase sanitized room code
 * @throws {Error} - If invalid
 */
export function sanitizeRoomCode(roomCode) {
    if (!isValidRoomCode(roomCode)) {
        throw new Error('Invalid room code format');
    }
    return roomCode.toUpperCase();
}

/**
 * Validate lives count
 * @param {any} lives - Lives count to validate
 * @returns {boolean} - True if valid
 */
export function isValidLives(lives) {
    if (lives === null || lives === undefined) {
        return false;
    }
    const num = Number(lives);
    return !isNaN(num) && num >= 0 && num <= 3 && Number.isInteger(num);
}
