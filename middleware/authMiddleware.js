const jwt = require('jsonwebtoken');

module.exports.isAuthenticated = (req, res, next) => {
  // Retrieve JWT token from cookies
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/'); // Redirect to login if no token is found
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.redirect('/'); // Redirect to login if token is invalid or expired
    }

    // Attach user information from token to the request
    req.user = decoded;
    next(); // Proceed to the next middleware or route handler
  });
};

  