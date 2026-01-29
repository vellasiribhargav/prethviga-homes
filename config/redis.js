import { createClient } from 'redis';

let redisClient = null;

export const initRedis = async () => {
    if (process.env.USE_REDIS === 'false') {
        console.log('⚠️ Redis disabled via config');
        return null;
    }

    if (redisClient) return redisClient; // singleton

    redisClient = createClient({
        socket: {
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: process.env.REDIS_PORT || 6379
        }
    });

    redisClient.on('connect', () => {
        console.log('✅ Redis connected');
    });

    redisClient.on('error', (err) => {
        console.error('❌ Redis error:', err.message);
    });

    try {
        await redisClient.connect();
    } catch (err) {
        console.error('❌ Failed to connect to Redis:', err.message);
        redisClient = null; // Ensure it's null if connection failed even if enabled
    }
    return redisClient;
};

export const getRedis = () => {
    if (process.env.USE_REDIS === 'false') {
        return null;
    }
    if (!redisClient) {
        // Instead of throwing, return null if it failed to initialize
        return null;
    }
    return redisClient;
};