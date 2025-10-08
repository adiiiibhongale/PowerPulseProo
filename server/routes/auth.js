const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Consumer = require('../models/Consumer');
const Admin = require('../models/Admin');

const router = express.Router();

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Consumer Registration
router.post('/consumer/register', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone').isMobilePhone().withMessage('Please provide a valid phone number'),
  body('address.street').notEmpty().withMessage('Street address is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.pincode').isPostalCode('IN').withMessage('Please provide a valid pincode')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, phone, address, connectionType, meterDetails } = req.body;

    // Check if consumer already exists
    const existingConsumer = await Consumer.findOne({ email });
    if (existingConsumer) {
      return res.status(409).json({
        status: 'error',
        message: 'Consumer with this email already exists'
      });
    }

    // Generate unique consumer number
    const consumerNumber = await Consumer.generateConsumerNumber();

    // Create new consumer
    const consumer = new Consumer({
      consumerNumber,
      name,
      email,
      password,
      phone,
      address,
      connectionType: connectionType || 'domestic',
      meterDetails: meterDetails || {}
    });

    await consumer.save();

    // Generate JWT token
    const token = generateToken({
      id: consumer._id,
      consumerNumber: consumer.consumerNumber,
      type: 'consumer'
    });

    res.status(201).json({
      status: 'success',
      message: 'Consumer registered successfully',
      data: {
        consumer,
        token
      }
    });

  } catch (error) {
    console.error('Consumer registration error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during registration'
    });
  }
});

// Consumer Login
router.post('/consumer/login', [
  body('consumerNumber').trim().notEmpty().withMessage('Consumer number is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { consumerNumber, password } = req.body;

    // Find consumer by consumer number
    const consumer = await Consumer.findOne({ consumerNumber }).select('+password');
    if (!consumer) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid consumer number or password'
      });
    }

    // Check if consumer is active
    if (consumer.status !== 'active') {
      return res.status(403).json({
        status: 'error',
        message: 'Account is not active. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await consumer.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid consumer number or password'
      });
    }

    // Update last login
    consumer.lastLogin = new Date();
    await consumer.save();

    // Generate JWT token
    console.log('🔐 Generating token for consumer:', consumer.consumerNumber);
    const token = generateToken({
      id: consumer._id,
      consumerNumber: consumer.consumerNumber,
      type: 'consumer'
    });
    console.log('✅ Token generated successfully');

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        consumer,
        token
      }
    });

  } catch (error) {
    console.error('❌ Consumer login error:', error);
    console.error('Full error stack:', error.stack);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during login'
    });
  }
});

// Admin Login
router.post('/admin/login', [
  body('adminId').trim().notEmpty().withMessage('Admin ID is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { adminId, password } = req.body;

    // Find admin by admin ID
    const admin = await Admin.findOne({ adminId }).select('+password');
    if (!admin) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid admin ID or password'
      });
    }

    // Check if account is locked
    if (admin.isLocked()) {
      return res.status(423).json({
        status: 'error',
        message: 'Account is locked due to too many failed login attempts. Please try again later.'
      });
    }

    // Check if admin is active
    if (admin.status !== 'active') {
      return res.status(403).json({
        status: 'error',
        message: 'Account is not active. Please contact system administrator.'
      });
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      // Increment login attempts
      await admin.incLoginAttempts();
      return res.status(401).json({
        status: 'error',
        message: 'Invalid admin ID or password'
      });
    }

    // Reset login attempts and update last login
    await admin.resetLoginAttempts();

    // Generate JWT token
    const token = generateToken({
      id: admin._id,
      adminId: admin.adminId,
      role: admin.role,
      permissions: admin.permissions,
      type: 'admin'
    });

    res.status(200).json({
      status: 'success',
      message: 'Admin login successful',
      data: {
        admin,
        token
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error during login'
    });
  }
});

// Logout (client-side token deletion)
router.post('/logout', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Logout successful'
  });
});

// Verify Token
router.get('/verify-token', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user;
    if (decoded.type === 'consumer') {
      user = await Consumer.findById(decoded.id);
    } else if (decoded.type === 'admin') {
      user = await Admin.findById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Token is valid',
      data: {
        user,
        type: decoded.type
      }
    });

  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token'
    });
  }
});

module.exports = router;