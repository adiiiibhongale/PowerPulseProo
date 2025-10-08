const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate, authorizeConsumer, authorizeConsumerAccess } = require('../middleware/auth');
const Consumer = require('../models/Consumer');
const MeterReading = require('../models/MeterReading');

const router = express.Router();

// Get consumer profile
router.get('/profile', authenticate, authorizeConsumer, async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      data: {
        consumer: req.user
      }
    });
  } catch (error) {
    console.error('Get consumer profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Update consumer profile
router.put('/profile', authenticate, authorizeConsumer, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('phone').optional().isMobilePhone(),
  body('address.street').optional().notEmpty(),
  body('address.city').optional().notEmpty(),
  body('address.state').optional().notEmpty(),
  body('address.pincode').optional().isPostalCode('IN')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const updateFields = req.body;
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateFields.password;
    delete updateFields.email;
    delete updateFields.consumerNumber;
    delete updateFields.status;

    const updatedConsumer = await Consumer.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        consumer: updatedConsumer
      }
    });

  } catch (error) {
    console.error('Update consumer profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get consumer's current meter reading
router.get('/meter/current', authenticate, authorizeConsumer, async (req, res) => {
  try {
    const latestReading = await MeterReading.getLatestReading(req.user._id);
    
    if (!latestReading) {
      return res.status(404).json({
        status: 'error',
        message: 'No meter readings found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        reading: latestReading
      }
    });

  } catch (error) {
    console.error('Get current meter reading error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get consumer's meter reading history
router.get('/meter/history', authenticate, authorizeConsumer, async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    let query = { consumerId: req.user._id };
    
    // Add date range filter if provided
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const readings = await MeterReading.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('readBy', 'name adminId');

    const totalReadings = await MeterReading.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        readings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReadings / limit),
          totalReadings,
          hasNext: page * limit < totalReadings,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get meter reading history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get consumer's energy consumption analytics
router.get('/analytics/consumption', authenticate, authorizeConsumer, async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    let groupBy, dateFormat;

    switch (period) {
      case 'daily':
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } };
        dateFormat = 'daily';
        break;
      case 'weekly':
        groupBy = { 
          $dateToString: { 
            format: "%Y-W%U", 
            date: "$timestamp" 
          } 
        };
        dateFormat = 'weekly';
        break;
      case 'monthly':
      default:
        groupBy = { $dateToString: { format: "%Y-%m", date: "$timestamp" } };
        dateFormat = 'monthly';
        break;
    }

    const analytics = await MeterReading.aggregate([
      { $match: { consumerId: req.user._id } },
      {
        $group: {
          _id: groupBy,
          totalConsumption: { $sum: "$reading.unitsConsumed" },
          averageConsumption: { $avg: "$reading.unitsConsumed" },
          maxConsumption: { $max: "$reading.unitsConsumed" },
          minConsumption: { $min: "$reading.unitsConsumed" },
          readingsCount: { $sum: 1 },
          averageVoltage: { $avg: "$powerQuality.voltage" },
          averagePowerFactor: { $avg: "$powerQuality.powerFactor" }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 12 } // Last 12 periods
    ]);

    // Calculate total consumption and cost estimates
    const totalConsumption = analytics.reduce((sum, item) => sum + item.totalConsumption, 0);
    const averageMonthlyConsumption = totalConsumption / (analytics.length || 1);

    res.status(200).json({
      status: 'success',
      data: {
        period: dateFormat,
        analytics,
        summary: {
          totalConsumption,
          averageMonthlyConsumption,
          periodsAnalyzed: analytics.length
        }
      }
    });

  } catch (error) {
    console.error('Get consumption analytics error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get consumer's billing history
router.get('/billing/history', authenticate, authorizeConsumer, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Get readings with billing information
    const billingHistory = await MeterReading.find({ 
      consumerId: req.user._id,
      'tariffDetails.slabRates': { $exists: true, $ne: [] }
    })
    .sort({ 'readingPeriod.startDate': -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const totalBills = await MeterReading.countDocuments({ 
      consumerId: req.user._id,
      'tariffDetails.slabRates': { $exists: true, $ne: [] }
    });

    // Calculate bill amounts
    const processedBills = billingHistory.map(reading => {
      const totalSlabAmount = reading.tariffDetails.slabRates.reduce((sum, slab) => sum + (slab.amount || 0), 0);
      const totalTaxes = Object.values(reading.tariffDetails.taxes).reduce((sum, tax) => sum + (tax || 0), 0);
      const totalAmount = totalSlabAmount + reading.tariffDetails.fixedCharges + totalTaxes;

      return {
        ...reading.toObject(),
        billAmount: {
          slabCharges: totalSlabAmount,
          fixedCharges: reading.tariffDetails.fixedCharges,
          taxes: totalTaxes,
          totalAmount
        }
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        bills: processedBills,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalBills / limit),
          totalBills,
          hasNext: page * limit < totalBills,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get billing history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Update consumer preferences
router.put('/preferences', authenticate, authorizeConsumer, [
  body('notifications.email').optional().isBoolean(),
  body('notifications.sms').optional().isBoolean(),
  body('notifications.push').optional().isBoolean(),
  body('theme').optional().isIn(['light', 'dark']),
  body('language').optional().isLength({ min: 2, max: 5 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const updatedConsumer = await Consumer.findByIdAndUpdate(
      req.user._id,
      { $set: { preferences: req.body } },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Preferences updated successfully',
      data: {
        preferences: updatedConsumer.preferences
      }
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

module.exports = router;