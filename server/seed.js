const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Consumer = require('./models/Consumer');
const Admin = require('./models/Admin');
require('dotenv').config();

// Default credentials
const DEFAULT_CONSUMER = {
  consumerNumber: '2214110559',
  name: 'Adi Bhongale',
  email: 'adi.bhongale@powerpulse.com',
  phone: '+91-9822000000',
  password: '9822@Adi',
  address: {
    street: '123 Smart Energy Street',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    country: 'India'
  },
  meterDetails: {
    meterId: 'MET2214110559',
    meterType: 'single-phase',
    installationDate: new Date('2024-01-15'),
    capacity: 5.0
  },
  connectionType: 'domestic',
  tariffPlan: 'basic',
  status: 'active',
  isVerified: true
};

const DEFAULT_ADMIN = {
  adminId: 'ADMIN001',
  personalInfo: {
    fullName: 'Demo Admin',
    email: 'powerpulsepro.smartmetering@gmail.com',
    phoneNumber: '+91-9876543211'
  },
  password: 'admin123',
  role: 'super_admin',
  permissions: {
    'read-consumers': true,
    'write-consumers': true,
    'read-billing': true,
    'write-billing': true,
    'read-alerts': true,
    'write-alerts': true,
    'read-meter': true,
    'write-meter': true,
    'admin-dashboard': true
  },
  status: 'active'
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/powerpulsepro');
    console.log('✅ Connected to MongoDB');

    // Check if default consumer already exists
    const existingConsumer = await Consumer.findOne({ 
      consumerNumber: DEFAULT_CONSUMER.consumerNumber 
    });

    if (!existingConsumer) {
      // Hash password
      const hashedPassword = await bcrypt.hash(DEFAULT_CONSUMER.password, 12);
      
      // Create default consumer
      const consumer = new Consumer({
        ...DEFAULT_CONSUMER,
        password: hashedPassword
      });
      
      await consumer.save();
      console.log('✅ Default consumer created:');
      console.log(`   Consumer Number: ${DEFAULT_CONSUMER.consumerNumber}`);
      console.log(`   Email: ${DEFAULT_CONSUMER.email}`);
      console.log(`   Password: ${DEFAULT_CONSUMER.password}`);
    } else {
      console.log('ℹ️  Default consumer already exists');
    }

    console.log('✅ Consumer account ready in MongoDB Atlas!');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Default Login Credentials:');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│              CONSUMER LOGIN             │');
    console.log('├─────────────────────────────────────────┤');
    console.log(`│ Consumer Number: ${DEFAULT_CONSUMER.consumerNumber}      │`);
    console.log(`│ Email: ${DEFAULT_CONSUMER.email}    │`);
    console.log(`│ Password: ${DEFAULT_CONSUMER.password}                │`);
    console.log('└─────────────────────────────────────────┘');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│               ADMIN LOGIN               │');
    console.log('├─────────────────────────────────────────┤');
    console.log(`│ Admin ID: ${DEFAULT_ADMIN.adminId}                  │`);
    console.log(`│ Email: ${DEFAULT_ADMIN.personalInfo.email}    │`);
    console.log(`│ Password: ${DEFAULT_ADMIN.password}                      │`);
    console.log('└─────────────────────────────────────────┘');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, DEFAULT_CONSUMER, DEFAULT_ADMIN };