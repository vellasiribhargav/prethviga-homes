const AdminUser = require('../../models/AdminUser');
const { getRedis } = require('../../config/redis.js');
const jwt = require('jsonwebtoken');
const { asyncHandler, ValidationError, UnauthorizedError } = require('../../utils/errorHandler');

const Minutes = 60 * 1000;

const login = asyncHandler(async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        throw new ValidationError('Please provide both username and password');
    }

    // 1. Rate Limiting Check
    const lockoutKey = `admin_lock:${username}`;
    const attemptsKey = `admin_attempts:${username}`;
    let redisClient = null;

    try {
        redisClient = getRedis();
    } catch (err) {
        // getRedis returning null (or throwing) handled below
        redisClient = null;
    }

    if (redisClient) {
        try {
            const isLocked = await redisClient.get(lockoutKey);
            if (isLocked) {
                throw new UnauthorizedError('Account locked due to too many failed attempts. Try again in 10 minutes.');
            }
        } catch (err) {
            console.error('Redis Rate Limiting Error (Skipping Check):', err.message);
            // Proceed without rate limiting if Redis is down
        }
    }

    const user = await AdminUser.findOne({ username });

    if (!user || !(await user.comparePassword(password))) {
        // Increment failed attempts
        if (redisClient) {
            try {
                const attempts = await redisClient.incr(attemptsKey);
                if (attempts === 1) {
                    await redisClient.expire(attemptsKey, 60 * 10); // 10 min window to accumulate failures
                }

                if (attempts > 3) {
                    await redisClient.set(lockoutKey, 'locked', { EX: 60 * 10 }); // Lock for 10 mins
                    throw new UnauthorizedError('Account locked due to too many failed attempts. Try again in 10 minutes.');
                }
                throw new UnauthorizedError(`Invalid credentials. ${3 - attempts} attempts remaining.`);
            } catch (err) {
                console.error('Redis Rate Limiting Error (Skipping Increment):', err.message);
                if (err instanceof UnauthorizedError) {
                    throw err;
                }
                throw new UnauthorizedError('Invalid credentials');
            }
        } else {
            throw new UnauthorizedError('Invalid credentials');
        }
    }

    // Login successful - clear attempts
    if (redisClient) {
        try {
            await redisClient.del(attemptsKey);
            await redisClient.del(lockoutKey);
        } catch (err) {
            console.error('Redis Cleanup Error:', err.message);
        }
    }

    // Generate JWT
    const token = jwt.sign(
        { id: user.id, username: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    // Set cookie
    res.cookie('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * Minutes, // productiom
        sameSite: 'strict'
    });

    res.json({ success: true });
});

const logout = (req, res) => {
    res.clearCookie('admin_token');
    res.redirect('/admin/login');
};

const renderLoginPage = asyncHandler(async (req, res) => {
    // If user is already logged in, redirect to admin list
    if (req.cookies.admin_token) {
        try {
            const decoded = jwt.verify(req.cookies.admin_token, process.env.JWT_SECRET);

            // Also verify user exists in DB
            const user = await AdminUser.findOne({ username: decoded.username });
            if (user) {
                return res.redirect('/admin/list');
            } else {
                res.clearCookie('admin_token');
            }
        } catch (error) {
            res.clearCookie('admin_token');
            // Token invalid, continue to render login page
        }
    }

    res.render('admin/login');
});

module.exports = {
    login,
    logout,
    renderLoginPage
};
