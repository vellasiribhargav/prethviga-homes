const AdminUser = require('../../models/AdminUser');
const jwt = require('jsonwebtoken');
const { asyncHandler, ValidationError, UnauthorizedError } = require('../../utils/errorHandler');

const Minutes = 60 * 1000;

const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        throw new ValidationError('Please provide both username and password');
    }

    const user = await AdminUser.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
        throw new UnauthorizedError('Invalid credentials');
    }

    // Generate JWT
    const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    // Set cookie
    res.cookie('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * Minutes // productiom
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
