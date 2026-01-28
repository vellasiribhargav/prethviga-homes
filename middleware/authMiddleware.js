const jwt = require('jsonwebtoken');
const { asyncHandler, UnauthorizedError } = require('../utils/errorHandler');
const AdminUser = require('../models/AdminUser');

const protectAdmin = asyncHandler(async (req, res, next) => {
  const token = req.cookies.admin_token;

  if (!token) {
    // For HTML requests, redirect to login
    if (!req.xhr && req.accepts('html')) {
      return res.redirect('/admin/login');
    }
    throw new UnauthorizedError('Not authorized - Please login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify user exists in database
    const user = await AdminUser.findOne({ username: decoded.username });
    if (!user) {
      throw new Error('User no longer exists');
    }

    req.admin = decoded;
    next();
  } catch (error) {
    res.clearCookie('admin_token');

    // For HTML requests, redirect to login
    if (!req.xhr && req.accepts('html')) {
      return res.redirect('/admin/login');
    }

    throw new UnauthorizedError('Session invalid or expired - Please login again');
  }
});

module.exports = { protectAdmin };