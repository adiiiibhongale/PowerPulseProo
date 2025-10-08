const express = require('express');
const { authenticate, authorizeAdmin, authorizePermission } = require('../middleware/auth');
const MeterReading = require('../models/MeterReading');

const router = express.Router();

// Calculate bill for a consumer
router.post('/calculate', authenticate, authorizeAdmin, authorizePermission('write-billing'), async (req, res) => {
  try {
    const { consumerId, billingCycle, unitsConsumed, tariffPlan = 'basic' } = req.body;

    // Tariff rates (can be moved to database later)
    const tariffRates = {
      basic: [
        { slabMin: 0, slabMax: 100, rate: 3.50 },
        { slabMin: 101, slabMax: 300, rate: 4.20 },
        { slabMin: 301, slabMax: 500, rate: 5.80 },
        { slabMin: 501, slabMax: Infinity, rate: 7.20 }
      ],
      premium: [
        { slabMin: 0, slabMax: 150, rate: 3.20 },
        { slabMin: 151, slabMax: 400, rate: 4.00 },
        { slabMin: 401, slabMax: Infinity, rate: 5.50 }
      ],
      commercial: [
        { slabMin: 0, slabMax: 1000, rate: 6.50 },
        { slabMin: 1001, slabMax: Infinity, rate: 8.00 }
      ]
    };

    const rates = tariffRates[tariffPlan] || tariffRates.basic;
    let remainingUnits = unitsConsumed;
    const slabRates = [];
    let totalSlabAmount = 0;

    // Calculate slab-wise billing
    for (const slab of rates) {
      if (remainingUnits <= 0) break;
      
      const slabUnits = Math.min(remainingUnits, slab.slabMax - slab.slabMin + 1);
      const slabAmount = slabUnits * slab.rate;
      
      slabRates.push({
        slabMin: slab.slabMin,
        slabMax: slab.slabMax,
        rate: slab.rate,
        units: slabUnits,
        amount: slabAmount
      });
      
      totalSlabAmount += slabAmount;
      remainingUnits -= slabUnits;
    }

    // Fixed charges and taxes
    const fixedCharges = 50; // Base fixed charge
    const electricityDuty = totalSlabAmount * 0.05; // 5%
    const fuelAdjustment = unitsConsumed * 0.25; // ₹0.25 per unit
    const otherCharges = 25; // Service charges

    const totalAmount = totalSlabAmount + fixedCharges + electricityDuty + fuelAdjustment + otherCharges;

    const billData = {
      consumerId,
      billingCycle,
      unitsConsumed,
      slabRates,
      fixedCharges,
      taxes: {
        electricityDuty,
        fuelAdjustment,
        otherCharges
      },
      totalAmount
    };

    res.status(200).json({
      status: 'success',
      message: 'Bill calculated successfully',
      data: { bill: billData }
    });

  } catch (error) {
    console.error('Calculate bill error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

// Get billing summary
router.get('/summary', authenticate, authorizeAdmin, authorizePermission('read-billing'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let matchQuery = {
      'tariffDetails.slabRates': { $exists: true, $ne: [] }
    };

    if (startDate || endDate) {
      matchQuery['readingPeriod.startDate'] = {};
      if (startDate) matchQuery['readingPeriod.startDate'].$gte = new Date(startDate);
      if (endDate) matchQuery['readingPeriod.startDate'].$lte = new Date(endDate);
    }

    const billingSummary = await MeterReading.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalBills: { $sum: 1 },
          totalUnits: { $sum: '$reading.unitsConsumed' },
          totalRevenue: {
            $sum: {
              $add: [
                { $sum: '$tariffDetails.slabRates.amount' },
                '$tariffDetails.fixedCharges',
                '$tariffDetails.taxes.electricityDuty',
                '$tariffDetails.taxes.fuelAdjustment',
                '$tariffDetails.taxes.otherCharges'
              ]
            }
          },
          averageBillAmount: {
            $avg: {
              $add: [
                { $sum: '$tariffDetails.slabRates.amount' },
                '$tariffDetails.fixedCharges',
                '$tariffDetails.taxes.electricityDuty',
                '$tariffDetails.taxes.fuelAdjustment',
                '$tariffDetails.taxes.otherCharges'
              ]
            }
          }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        summary: billingSummary[0] || {
          totalBills: 0,
          totalUnits: 0,
          totalRevenue: 0,
          averageBillAmount: 0
        }
      }
    });

  } catch (error) {
    console.error('Get billing summary error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

module.exports = router;