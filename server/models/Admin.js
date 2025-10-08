const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  adminId: {
    type: String,
    required: true,
    unique: true,
    trim: true
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
  role: {
    type: String,
    enum: ['super-admin', 'admin', 'operator', 'technician'],
    default: 'admin'
  },
  permissions: [{
    type: String,
    enum: [
      'read-consumers',
      'write-consumers',
      'delete-consumers',
      'read-meters',
      'write-meters',
      'read-billing',
      'write-billing',
      'read-alerts',
      'write-alerts',
      'system-settings',
      'user-management',
      'reports-access'
    ]
  }],
  department: {
    type: String,
    enum: ['operations', 'billing', 'maintenance', 'customer-service', 'it'],
    default: 'operations'
  },
  phone: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  twoFactorAuth: {
    enabled: { type: Boolean, default: false },
    secret: String,
    backupCodes: [String]
  }
}, {
  timestamps: true
});

// Index for faster queries
adminSchema.index({ adminId: 1 });
adminSchema.index({ email: 1 });
adminSchema.index({ role: 1 });

// Hash password before saving
adminSchema.pre('save', async function(next) {
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
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
adminSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
adminSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Reset login attempts
adminSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: new Date() }
  });
};

// Generate admin ID
adminSchema.statics.generateAdminId = async function() {
  let adminId;
  let exists = true;
  
  while (exists) {
    // Generate admin ID starting with 'ADM'
    adminId = 'ADM' + Math.floor(1000 + Math.random() * 9000);
    exists = await this.findOne({ adminId });
  }
  
  return adminId;
};

// Remove sensitive data from JSON output
adminSchema.methods.toJSON = function() {
  const admin = this.toObject();
  delete admin.password;
  delete admin.twoFactorAuth.secret;
  delete admin.twoFactorAuth.backupCodes;
  return admin;
};

module.exports = mongoose.model('Admin', adminSchema);