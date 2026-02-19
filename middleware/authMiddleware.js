const jwt = require('jsonwebtoken');
const { asyncHandler, UnauthorizedError } = require('../utils/errorHandler');
const mongoose = require("mongoose");

const protectAdmin = asyncHandler(async (req, res, next) => {
  const token = req.cookies.admin_token;

  // Reliable check for JSON/AJAX request
  const isAjaxOrJson =
    req.xhr ||
    (req.headers.accept && req.headers.accept.includes('application/json')) ||
    req.path.startsWith('/api/');

  if (!token) {
    if (!isAjaxOrJson && req.accepts('html')) {
      return res.redirect('/admin/login?expired=true');
    }
    throw new UnauthorizedError('Session expired - Please login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify user exists in database
    const adminUsersCollection = mongoose.connection.db.collection("admin");
    const user = await adminUsersCollection.findOne({ userName: decoded.username });

    if (!user) {
      throw new Error('User no longer exists');
    }

    req.admin = decoded;
    next();
  } catch (error) {
    res.clearCookie('admin_token');

    if (!isAjaxOrJson && req.accepts('html')) {
      return res.redirect('/admin/login?expired=true');
    }

    throw new UnauthorizedError('Session invalid or expired - Please login again');
  }
});

module.exports = { protectAdmin };