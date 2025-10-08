# 🚀 PowerPulsePro Smart Energy Meter - Complete Project Setup

## 📁 Project Structure
```
PowerPulsePro/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── HomepageStyled.jsx
│   │   │   └── ConsumerLogin.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── server/                     # Node.js Backend API
    ├── models/
    │   ├── Consumer.js         # Consumer data model
    │   ├── Admin.js           # Admin user model
    │   └── MeterReading.js    # Meter reading data model
    ├── routes/
    │   ├── auth.js            # Authentication routes
    │   ├── consumer.js        # Consumer management
    │   ├── admin.js           # Admin dashboard
    │   ├── meter.js           # Meter readings
    │   ├── billing.js         # Billing calculations
    │   └── alerts.js          # Alert system
    ├── middleware/
    │   └── auth.js            # JWT authentication middleware
    ├── index.js               # Main server file
    ├── package.json
    ├── .env                   # Environment configuration
    └── README.md              # API documentation
```

## 🏁 Quick Start Guide

### 1. Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Git
- Code editor (VS Code recommended)

### 2. Clone & Setup
```bash
# Clone repository
git clone https://github.com/adiiiibhongale/PowerPulsePro-Smart-Energy-Meter.git
cd PowerPulsePro-Smart-Energy-Meter

# Setup Backend
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB connection string

# Setup Frontend
cd ../client
npm install
```

### 3. Environment Configuration

**Backend (.env):**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/powerpulsepro
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**Frontend (Vite automatically uses):**
- Development server: `http://localhost:5173`
- Backend API: `http://localhost:5000`

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

## 🌟 Key Features Implemented

### Frontend (React + Vite)
- ✅ **Modern Homepage** with responsive design
- ✅ **Consumer Login Page** with form validation
- ✅ **Section Navigation** with smooth scrolling
- ✅ **Glassmorphism Design** with modern aesthetics
- ✅ **Mobile Responsive** layout
- ✅ **React Router** for navigation

### Backend (Node.js + Express + MongoDB)
- ✅ **Authentication System** with JWT tokens
- ✅ **Consumer Management** with profile handling
- ✅ **Admin Dashboard** with statistics
- ✅ **Meter Reading Management** with real-time data
- ✅ **Billing System** with slab-based calculations
- ✅ **Alert System** for consumption and quality monitoring
- ✅ **Security Features** (Helmet, Rate limiting, CORS)
- ✅ **Data Validation** with express-validator

## 🔗 API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Consumer registration
- `POST /api/auth/login` - Consumer login
- `POST /api/auth/admin/register` - Admin registration
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/logout` - Logout (all users)

### Consumer Features
- `GET /api/consumer/profile` - Get profile
- `PUT /api/consumer/profile` - Update profile
- `GET /api/consumer/analytics` - Usage analytics
- `GET /api/consumer/billing-history` - Billing history

### Admin Features
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/consumers` - All consumers
- `PATCH /api/admin/consumers/:id/status` - Update consumer status

### Meter Management
- `POST /api/meter/readings` - Add meter reading
- `GET /api/meter/readings/consumer/:id` - Consumer readings
- `GET /api/meter/statistics` - Reading statistics

### Billing System
- `POST /api/billing/calculate` - Calculate bill
- `GET /api/billing/summary` - Billing summary

### Alert System
- `POST /api/alerts/create` - Create system alert
- `GET /api/alerts/my-alerts` - Consumer alerts
- `PATCH /api/alerts/acknowledge/:id` - Acknowledge alert

## 🛡️ Security Features
- JWT token-based authentication
- Password hashing with bcryptjs
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS configuration
- Security headers with Helmet
- Role-based access control

## 📊 Database Models

### Consumer Schema
- Personal information and contact details
- Meter information and connection details
- Authentication credentials
- Preferences and alert settings
- Account status and verification

### Admin Schema
- Admin credentials and role management
- Permission-based access control
- Security features and session management

### MeterReading Schema
- Real-time meter readings and consumption data
- Power quality metrics (voltage, current, frequency)
- Tamper detection and security alerts
- Historical data and analytics

## 🚀 Deployment Ready

### Production Environment Variables
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/powerpulsepro
JWT_SECRET=your-super-secure-production-jwt-secret
CLIENT_URL=https://your-frontend-domain.com
```

### Build Commands
```bash
# Backend - Ready to deploy
cd server
npm install --production
npm start

# Frontend - Build for production
cd client
npm run build
# Deploy dist/ folder to your hosting service
```

## 🔧 Development Tools
- **Backend**: Nodemon for hot reloading
- **Frontend**: Vite dev server with HMR
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with secure token handling
- **Testing**: API test suite included
- **Documentation**: Comprehensive README files

## 📋 Next Steps for Production

1. **Database Setup**: Configure MongoDB Atlas or local MongoDB
2. **Environment Security**: Use secure JWT secrets and API keys
3. **SSL/HTTPS**: Configure SSL certificates for production
4. **Monitoring**: Add logging and monitoring (Winston, Morgan)
5. **Testing**: Implement unit and integration tests
6. **CI/CD**: Set up automated deployment pipeline

## 🆘 Troubleshooting

### Common Issues:
1. **Port conflicts**: Change PORT in .env if 5000 is occupied
2. **MongoDB connection**: Ensure MongoDB is running and URI is correct
3. **CORS errors**: Verify CLIENT_URL matches frontend URL
4. **Module errors**: Run `npm install` in both client and server directories

### Useful Commands:
```bash
# Check if server is running
curl http://localhost:5000/api/health

# Start MongoDB (if local)
mongod

# Reset node_modules
rm -rf node_modules package-lock.json && npm install
```

## 📞 Support & Documentation
- **Backend API Documentation**: `/server/README.md`
- **Health Check**: `http://localhost:5000/api/health`
- **Frontend Demo**: `http://localhost:5173`

---

**PowerPulsePro Smart Energy Meter System v1.0.0**  
*Complete Full-Stack Solution for Smart Energy Management*

🎉 **Ready for Development and Production Deployment!**