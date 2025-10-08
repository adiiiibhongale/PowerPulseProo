const jwt = require('jsonwebtoken');
const Consumer = require('../models/Consumer');
const Admin = require('../models/Admin');

// Verify JWT token and authenticate user
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user;
    if (decoded.type === 'consumer') {
      user = await Consumer.findById(decoded.id);
      if (!user || user.status !== 'active') {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token or inactive account'
        });
      }
    } else if (decoded.type === 'admin') {
      user = await Admin.findById(decoded.id);
      if (!user || user.status !== 'active') {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid token or inactive account'
        });
      }
    } else {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token type'
      });
    }

    req.user = user;
    req.userType = decoded.type;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token has expired'
      });
    }
    
    console.error('Authentication error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during authentication'
    });
  }
};

// Authorize consumer only
const authorizeConsumer = (req, res, next) => {
  if (req.userType !== 'consumer') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Consumer authentication required.'
    });
  }
  next();
};

// Authorize admin only
const authorizeAdmin = (req, res, next) => {
  if (req.userType !== 'admin') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Admin authentication required.'
    });
  }
  next();
};

// Authorize specific admin roles
const authorizeAdminRole = (roles) => {
  return (req, res, next) => {
    if (req.userType !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Insufficient privileges.'
      });
    }

    next();
  };
};

// Authorize specific permissions
const authorizePermission = (permission) => {
  return (req, res, next) => {
    if (req.userType !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Admin authentication required.'
      });
    }

    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Required permission not granted.'
      });
    }

    next();
  };
};

// Check if user can access specific consumer data
const authorizeConsumerAccess = (req, res, next) => {
  const consumerId = req.params.consumerId || req.body.consumerId;
  
  if (req.userType === 'consumer') {
    // Consumer can only access their own data
    if (req.user._id.toString() !== consumerId) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only access your own data.'
      });
    }
  } else if (req.userType === 'admin') {
    // Admin can access any consumer data if they have the right permissions
    if (!req.user.permissions.includes('read-consumers')) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Consumer read permission required.'
      });
    }
  } else {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Authentication required.'
    });
  }
  
  next();
};

module.exports = {
  authenticate,
  authorizeConsumer,
  authorizeAdmin,
  authorizeAdminRole,
  authorizePermission,
  authorizeConsumerAccess
};