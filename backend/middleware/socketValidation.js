/**
 * Socket.IO Validation Middleware
 * Wraps Socket.IO event handlers with validation and error handling
 */

/**
 * Create a validated Socket.IO event handler
 * @param {Function} validator - Validation function that throws on invalid data
 * @param {Function} handler - Actual event handler
 * @returns {Function} - Wrapped handler with validation
 */
export function validateSocketEvent(validator, handler) {
    return async (data, acknowledgement) => {
        try {
            // Validate input data
            const validatedData = validator ? validator(data) : data;

            // Call the actual handler with validated data
            await handler(validatedData, acknowledgement);
        } catch (error) {
            console.error('Socket event validation error:', error.message);

            // Send error response if acknowledgement callback provided
            if (typeof acknowledgement === 'function') {
                acknowledgement({
                    success: false,
                    error: error.message,
                });
            }

            // Optionally emit error event to the client
            // this.emit('error', { message: error.message });
        }
    };
}

/**
 * Create middleware for rate limiting socket events
 * @param {number} maxEvents - Maximum events per interval
 * @param {number} intervalMs - Interval in milliseconds
 * @returns {Function} - Middleware function
 */
export function createSocketRateLimiter(maxEvents = 10, intervalMs = 1000) {
    const clientCounters = new Map();

    return function rateLimitMiddleware(socket, next) {
        const clientId = socket.id;
        const now = Date.now();

        if (!clientCounters.has(clientId)) {
            clientCounters.set(clientId, { count: 0, resetAt: now + intervalMs });
        }

        const counter = clientCounters.get(clientId);

        // Reset counter if interval has passed
        if (now > counter.resetAt) {
            counter.count = 0;
            counter.resetAt = now + intervalMs;
        }

        // Check rate limit
        if (counter.count >= maxEvents) {
            const error = new Error('Rate limit exceeded');
            error.data = { retryAfter: counter.resetAt - now };
            return next(error);
        }

        counter.count++;
        next();

        // Clean up disconnected clients
        socket.on('disconnect', () => {
            clientCounters.delete(clientId);
        });
    };
}

/**
 * Log socket events for debugging and monitoring
 * @param {string} eventName - Name of the event
 * @param {object} data - Event data
 * @param {string} socketId - Socket ID
 */
export function logSocketEvent(eventName, data, socketId) {
    console.log(`🔌 [${socketId.slice(0, 8)}] ${eventName}:`,
        JSON.stringify(data).slice(0, 100)
    );
}
