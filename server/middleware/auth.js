const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret);
      
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User belonging to this token no longer exists.'
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'User account has been deactivated. Contact an administrator.'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(`[Auth Middleware] Token error: ${error.message}`);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed verification'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no bearer token provided'
    });
  }
};

module.exports = { protect };
