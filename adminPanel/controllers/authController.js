const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const { getRedis } = require('../../config/redis.js');
const jwt = require('jsonwebtoken');
const { asyncHandler, ValidationError, UnauthorizedError } = require('../../utils/errorHandler');

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
        }
    }

    const adminUsersCollection = mongoose.connection.db.collection("admin");
    const user = await adminUsersCollection.findOne({ userName: username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        // Increment failed attempts
        if (redisClient) {
            try {
                const attempts = await redisClient.incr(attemptsKey);
                if (attempts === 1) {
                    await redisClient.expire(attemptsKey, 60 * 10);
                }

                if (attempts > 3) {
                    await redisClient.set(lockoutKey, 'locked', 'EX', 60 * 10);
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
    const expiryMinutes = Number(process.env.ADMIN_COOKIE_EXPIRY_MINUTES);
    // console.log("Expiry Minutes:", expiryMinutes);
    const token = jwt.sign(
        { id: user._id.toString(), username: user.userName },
        process.env.JWT_SECRET,
        { expiresIn: `${expiryMinutes}m` }
    )

    // Set cookie
    res.cookie('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: expiryMinutes * 60 * 1000,
        sameSite: 'lax'
    });
    res.json({ success: true });
});

const logout = (req, res) => {
    res.clearCookie('admin_token');
    res.redirect('/admin/login');
};

const renderLoginPage = asyncHandler(async (req, res) => {
    if (req.cookies.admin_token) {
        try {
            const decoded = jwt.verify(req.cookies.admin_token, process.env.JWT_SECRET);
            const adminUsersCollection = mongoose.connection.db.collection("admin");
            const user = await adminUsersCollection.findOne({ userName: decoded.username });
            if (user) {
                return res.redirect('/admin/banner/home/list');
            } else {
                res.clearCookie('admin_token');
            }
        } catch (error) {
            res.clearCookie('admin_token');
        }
    }

    res.render('admin/login');
});

module.exports = {
    login,
    logout,
    renderLoginPage
};
