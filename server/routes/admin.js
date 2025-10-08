const express = require('express');
const { authenticate, authorizeAdmin, authorizePermission } = require('../middleware/auth');
const Admin = require('../models/Admin');
const Consumer = require('../models/Consumer');
const MeterReading = require('../models/MeterReading');

const router = express.Router();

// Get all consumers (with pagination and search)
router.get('/consumers', authenticate, authorizeAdmin, authorizePermission('read-consumers'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, connectionType } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { consumerNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status) {
      query.status = status;
    }

    // Add connection type filter
    if (connectionType) {
      query.connectionType = connectionType;
    }

    const consumers = await Consumer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalConsumers = await Consumer.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        consumers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalConsumers / limit),
          totalConsumers,
          hasNext: page * limit < totalConsumers,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get consumers error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get dashboard statistics
router.get('/dashboard/stats', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const totalConsumers = await Consumer.countDocuments();
    const activeConsumers = await Consumer.countDocuments({ status: 'active' });
    const totalReadings = await MeterReading.countDocuments();
    const todayReadings = await MeterReading.countDocuments({
      timestamp: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    // Get tamper alerts count
    const tamperAlerts = await MeterReading.countDocuments({
      'tamperDetection.detected': true,
      timestamp: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        totalConsumers,
        activeConsumers,
        inactiveConsumers: totalConsumers - activeConsumers,
        totalReadings,
        todayReadings,
        tamperAlerts
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

module.exports = router;