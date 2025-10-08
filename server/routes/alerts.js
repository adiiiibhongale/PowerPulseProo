const express = require('express');
const { authenticate, authorizeAdmin, authorizePermission } = require('../middleware/auth');
const Consumer = require('../models/Consumer');
const MeterReading = require('../models/MeterReading');

const router = express.Router();

// Create system alert
router.post('/create', authenticate, authorizeAdmin, authorizePermission('write-alerts'), async (req, res) => {
  try {
    const { type, severity, message, targetConsumers, isSystemWide = false } = req.body;

    const alertData = {
      type,
      severity,
      message,
      targetConsumers: isSystemWide ? [] : targetConsumers,
      isSystemWide,
      createdBy: req.user._id
    };

    let consumers = [];
    if (targetConsumers && targetConsumers.length > 0) {
      consumers = await Consumer.find({ _id: { $in: targetConsumers } });
    } else if (isSystemWide) {
      consumers = await Consumer.find({ status: 'active' });
    }

    // Add alert to consumers' alertPreferences.systemAlerts
    const consumerUpdates = consumers.map(consumer => {
      return Consumer.findByIdAndUpdate(
        consumer._id,
        {
          $push: {
            'alertPreferences.systemAlerts': {
              id: new Date().getTime().toString(),
              type,
              severity,
              message,
              timestamp: new Date(),
              acknowledged: false,
              createdBy: req.user._id
            }
          }
        }
      );
    });

    await Promise.all(consumerUpdates);

    res.status(201).json({
      status: 'success',
      message: 'Alert created and sent successfully',
      data: {
        alert: alertData,
        recipientCount: consumers.length
      }
    });

  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get all alerts for admin
router.get('/all', authenticate, authorizeAdmin, authorizePermission('read-alerts'), async (req, res) => {
  try {
    const { type, severity, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Build match query for aggregation
    let matchQuery = {};
    if (type) matchQuery['alertPreferences.systemAlerts.type'] = type;
    if (severity) matchQuery['alertPreferences.systemAlerts.severity'] = severity;

    const alerts = await Consumer.aggregate([
      { $match: matchQuery },
      { $unwind: '$alertPreferences.systemAlerts' },
      {
        $project: {
          _id: '$alertPreferences.systemAlerts.id',
          type: '$alertPreferences.systemAlerts.type',
          severity: '$alertPreferences.systemAlerts.severity',
          message: '$alertPreferences.systemAlerts.message',
          timestamp: '$alertPreferences.systemAlerts.timestamp',
          acknowledged: '$alertPreferences.systemAlerts.acknowledged',
          consumerId: '$_id',
          consumerName: '$personalInfo.fullName',
          meterNumber: '$meterInfo.meterNumber'
        }
      },
      { $sort: { timestamp: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    const totalAlerts = await Consumer.aggregate([
      { $match: matchQuery },
      { $unwind: '$alertPreferences.systemAlerts' },
      { $count: 'total' }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        alerts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil((totalAlerts[0]?.total || 0) / limit),
          totalAlerts: totalAlerts[0]?.total || 0
        }
      }
    });

  } catch (error) {
    console.error('Get all alerts error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get alerts for a specific consumer (consumer route)
router.get('/my-alerts', authenticate, async (req, res) => {
  try {
    const { acknowledged, type, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const consumer = await Consumer.findById(req.user._id);
    if (!consumer) {
      return res.status(404).json({
        status: 'error',
        message: 'Consumer not found'
      });
    }

    let alerts = consumer.alertPreferences.systemAlerts || [];

    // Filter alerts
    if (acknowledged !== undefined) {
      alerts = alerts.filter(alert => alert.acknowledged === (acknowledged === 'true'));
    }
    if (type) {
      alerts = alerts.filter(alert => alert.type === type);
    }

    // Sort by timestamp (newest first)
    alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Pagination
    const totalAlerts = alerts.length;
    const paginatedAlerts = alerts.slice(skip, skip + parseInt(limit));

    res.status(200).json({
      status: 'success',
      data: {
        alerts: paginatedAlerts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalAlerts / limit),
          totalAlerts
        }
      }
    });

  } catch (error) {
    console.error('Get my alerts error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Acknowledge alert
router.patch('/acknowledge/:alertId', authenticate, async (req, res) => {
  try {
    const { alertId } = req.params;

    const consumer = await Consumer.findOneAndUpdate(
      {
        _id: req.user._id,
        'alertPreferences.systemAlerts.id': alertId
      },
      {
        $set: {
          'alertPreferences.systemAlerts.$.acknowledged': true,
          'alertPreferences.systemAlerts.$.acknowledgedAt': new Date()
        }
      },
      { new: true }
    );

    if (!consumer) {
      return res.status(404).json({
        status: 'error',
        message: 'Alert not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Alert acknowledged successfully'
    });

  } catch (error) {
    console.error('Acknowledge alert error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Check for automatic alerts (high consumption, anomalies)
router.post('/check-auto-alerts', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { consumerId } = req.body;
    
    // Get latest meter reading
    const latestReading = await MeterReading.findOne({ consumerId })
      .sort({ 'readingPeriod.endDate': -1 });

    if (!latestReading) {
      return res.status(404).json({
        status: 'error',
        message: 'No meter readings found for consumer'
      });
    }

    const consumer = await Consumer.findById(consumerId);
    if (!consumer) {
      return res.status(404).json({
        status: 'error',
        message: 'Consumer not found'
      });
    }

    const alerts = [];
    const { unitsConsumed } = latestReading.reading;
    const { highUsage, lowVoltage, powerOutage } = consumer.alertPreferences.thresholds;

    // Check high consumption
    if (unitsConsumed > highUsage) {
      alerts.push({
        type: 'high_consumption',
        severity: 'warning',
        message: `High power consumption detected: ${unitsConsumed} units consumed`,
        timestamp: new Date()
      });
    }

    // Check power quality issues
    if (latestReading.powerQuality) {
      const { voltage, frequency, powerFactor } = latestReading.powerQuality;
      
      if (voltage < lowVoltage) {
        alerts.push({
          type: 'power_quality',
          severity: 'critical',
          message: `Low voltage detected: ${voltage}V (below threshold of ${lowVoltage}V)`,
          timestamp: new Date()
        });
      }

      if (powerFactor < 0.9) {
        alerts.push({
          type: 'power_quality',
          severity: 'warning',
          message: `Poor power factor detected: ${powerFactor}`,
          timestamp: new Date()
        });
      }
    }

    // Check tamper detection
    if (latestReading.tamperDetection && latestReading.tamperDetection.isTampered) {
      alerts.push({
        type: 'tamper',
        severity: 'critical',
        message: `Tamper detected: ${latestReading.tamperDetection.tamperType}`,
        timestamp: new Date()
      });
    }

    // Add alerts to consumer
    if (alerts.length > 0) {
      const alertsWithIds = alerts.map(alert => ({
        ...alert,
        id: new Date().getTime().toString() + Math.random().toString(36).substr(2, 9),
        acknowledged: false,
        autoGenerated: true
      }));

      await Consumer.findByIdAndUpdate(
        consumerId,
        {
          $push: {
            'alertPreferences.systemAlerts': { $each: alertsWithIds }
          }
        }
      );
    }

    res.status(200).json({
      status: 'success',
      message: `${alerts.length} automatic alerts generated`,
      data: { alerts }
    });

  } catch (error) {
    console.error('Check auto alerts error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

module.exports = router;