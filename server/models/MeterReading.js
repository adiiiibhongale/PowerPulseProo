const mongoose = require('mongoose');

const meterReadingSchema = new mongoose.Schema({
  consumerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consumer',
    required: true
  },
  meterId: {
    type: String,
    required: true
  },
  reading: {
    totalUnits: { type: Number, required: true, min: 0 },
    previousReading: { type: Number, default: 0 },
    currentReading: { type: Number, required: true },
    unitsConsumed: { type: Number, required: true },
  },
  powerQuality: {
    voltage: { type: Number, min: 0, max: 500 }, // in Volts
    current: { type: Number, min: 0 }, // in Amperes
    frequency: { type: Number, min: 45, max: 65, default: 50 }, // in Hz
    powerFactor: { type: Number, min: 0, max: 1, default: 0.85 },
    thd: { type: Number, min: 0, max: 100, default: 5 } // Total Harmonic Distortion in %
  },
  energyMetrics: {
    activeEnergy: { type: Number, default: 0 }, // in kWh
    reactiveEnergy: { type: Number, default: 0 }, // in kVARh
    apparentEnergy: { type: Number, default: 0 }, // in kVAh
    peakDemand: { type: Number, default: 0 }, // in kW
    loadFactor: { type: Number, min: 0, max: 1, default: 0.7 }
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  readingType: {
    type: String,
    enum: ['manual', 'automatic', 'estimated', 'corrected'],
    default: 'automatic'
  },
  readingPeriod: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    billingCycle: { type: String, required: true } // YYYY-MM format
  },
  tariffDetails: {
    slabRates: [{
      slabMin: Number,
      slabMax: Number,
      rate: Number,
      units: Number,
      amount: Number
    }],
    fixedCharges: { type: Number, default: 0 },
    taxes: {
      electricityDuty: { type: Number, default: 0 },
      fuelAdjustment: { type: Number, default: 0 },
      otherCharges: { type: Number, default: 0 }
    }
  },
  status: {
    type: String,
    enum: ['active', 'processed', 'disputed', 'corrected'],
    default: 'active'
  },
  tamperDetection: {
    detected: { type: Boolean, default: false },
    type: [{
      type: String,
      enum: ['magnetic-tamper', 'current-bypass', 'voltage-tamper', 'meter-tilt', 'cover-open']
    }],
    timestamp: Date,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    }
  },
  qualityFlags: {
    dataIntegrity: { type: Boolean, default: true },
    calibrationStatus: { type: Boolean, default: true },
    communicationQuality: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'poor'],
      default: 'good'
    }
  },
  readBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  notes: String
}, {
  timestamps: true
});

// Indexes for faster queries
meterReadingSchema.index({ consumerId: 1, timestamp: -1 });
meterReadingSchema.index({ meterId: 1, timestamp: -1 });
meterReadingSchema.index({ 'readingPeriod.billingCycle': 1 });
meterReadingSchema.index({ timestamp: -1 });
meterReadingSchema.index({ 'tamperDetection.detected': 1 });

// Calculate units consumed before saving
meterReadingSchema.pre('save', function(next) {
  if (this.reading.currentReading && this.reading.previousReading) {
    this.reading.unitsConsumed = this.reading.currentReading - this.reading.previousReading;
  }
  
  // Validate reading logic
  if (this.reading.currentReading < this.reading.previousReading) {
    const error = new Error('Current reading cannot be less than previous reading');
    return next(error);
  }
  
  next();
});

// Static method to get latest reading for a consumer
meterReadingSchema.statics.getLatestReading = function(consumerId) {
  return this.findOne({ consumerId })
    .sort({ timestamp: -1 })
    .populate('consumerId', 'name consumerNumber')
    .populate('readBy', 'name adminId');
};

// Static method to get readings for a billing cycle
meterReadingSchema.statics.getBillingCycleReadings = function(consumerId, billingCycle) {
  return this.find({ 
    consumerId, 
    'readingPeriod.billingCycle': billingCycle 
  }).sort({ timestamp: -1 });
};

// Method to detect anomalies
meterReadingSchema.methods.detectAnomalies = function() {
  const anomalies = [];
  
  // Check for unusual consumption patterns
  if (this.reading.unitsConsumed > 1000) { // High consumption
    anomalies.push({
      type: 'high-consumption',
      severity: 'medium',
      message: 'Unusually high energy consumption detected'
    });
  }
  
  // Check power quality issues
  if (this.powerQuality.voltage < 200 || this.powerQuality.voltage > 250) {
    anomalies.push({
      type: 'voltage-anomaly',
      severity: 'high',
      message: 'Voltage out of normal range'
    });
  }
  
  if (this.powerQuality.powerFactor < 0.8) {
    anomalies.push({
      type: 'poor-power-factor',
      severity: 'medium',
      message: 'Poor power factor detected'
    });
  }
  
  return anomalies;
};

module.exports = mongoose.model('MeterReading', meterReadingSchema);