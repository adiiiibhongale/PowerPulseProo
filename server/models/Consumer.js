const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const consumerSchema = new mongoose.Schema({
  consumerNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 6,
    maxlength: 12
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  meterDetails: {
    meterId: { type: String, unique: true, sparse: true },
    meterType: { type: String, enum: ['single-phase', 'three-phase'], default: 'single-phase' },
    installationDate: Date,
    lastMaintenanceDate: Date,
    capacity: { type: Number, default: 5 } // in kW
  },
  connectionType: {
    type: String,
    enum: ['domestic', 'commercial', 'industrial'],
    default: 'domestic'
  },
  tariffPlan: {
    type: String,
    enum: ['basic', 'premium', 'commercial'],
    default: 'basic'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'disconnected'],
    default: 'active'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    language: { type: String, default: 'en' }
  }
}, {
  timestamps: true
});

// Index for faster queries
consumerSchema.index({ consumerNumber: 1 });
consumerSchema.index({ email: 1 });
consumerSchema.index({ 'meterDetails.meterId': 1 });

// Hash password before saving
consumerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
consumerSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate consumer number
consumerSchema.statics.generateConsumerNumber = async function() {
  let consumerNumber;
  let exists = true;
  
  while (exists) {
    // Generate 8-digit consumer number starting with 'PP'
    consumerNumber = 'PP' + Math.floor(100000 + Math.random() * 900000);
    exists = await this.findOne({ consumerNumber });
  }
  
  return consumerNumber;
};

// Remove sensitive data from JSON output
consumerSchema.methods.toJSON = function() {
  const consumer = this.toObject();
  delete consumer.password;
  delete consumer.emailVerificationToken;
  delete consumer.passwordResetToken;
  delete consumer.passwordResetExpires;
  return consumer;
};

module.exports = mongoose.model('Consumer', consumerSchema);