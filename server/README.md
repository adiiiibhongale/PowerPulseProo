# PowerPulsePro Backend API

A comprehensive Node.js backend API for the Smart Energy Meter system, providing authentication, meter reading management, billing calculations, and alert systems.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Consumer Management**: Complete profile management, meter information, and preferences
- **Admin Dashboard**: Statistics, consumer management, and system oversight
- **Meter Reading Management**: Real-time meter data processing with power quality monitoring
- **Billing System**: Automated slab-based billing with multiple tariff plans
- **Alert System**: Real-time alerts for high consumption, power quality issues, and tamper detection
- **Security**: Helmet, rate limiting, CORS, input validation, and password hashing

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PowerPulsePro/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the server directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/powerpulsepro
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   
   # Email Configuration (Optional)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### 🔐 Authentication Endpoints

#### Register Consumer
```http
POST /auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phoneNumber": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "City",
    "state": "State",
    "postalCode": "12345",
    "country": "Country"
  },
  "meterNumber": "MET123456"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

### 👤 Consumer Endpoints

#### Get Profile
```http
GET /consumer/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /consumer/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "personalInfo": {
    "fullName": "Updated Name",
    "phoneNumber": "+0987654321"
  },
  "preferences": {
    "theme": "dark",
    "language": "en"
  }
}
```

#### Get Analytics
```http
GET /consumer/analytics?period=month
Authorization: Bearer <token>
```

#### Get Billing History
```http
GET /consumer/billing-history?page=1&limit=10
Authorization: Bearer <token>
```

### 🛠️ Admin Endpoints

#### Dashboard Statistics
```http
GET /admin/dashboard
Authorization: Bearer <admin-token>
```

#### Get All Consumers
```http
GET /admin/consumers?page=1&limit=20&status=active
Authorization: Bearer <admin-token>
```

#### Update Consumer Status
```http
PATCH /admin/consumers/:consumerId/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "suspended",
  "reason": "Payment overdue"
}
```

### 📊 Meter Reading Endpoints

#### Add Meter Reading
```http
POST /meter/readings
Authorization: Bearer <token>
Content-Type: application/json

{
  "consumerId": "consumer-id-here",
  "reading": {
    "currentReading": 1250.5,
    "previousReading": 1200.0,
    "unitsConsumed": 50.5
  },
  "powerQuality": {
    "voltage": 230.5,
    "current": 10.2,
    "frequency": 50.0,
    "powerFactor": 0.95
  }
}
```

#### Get Consumer Readings
```http
GET /meter/readings/consumer/:consumerId?page=1&limit=10
Authorization: Bearer <token>
```

#### Get Reading Statistics
```http
GET /meter/statistics?period=month&consumerId=consumer-id
Authorization: Bearer <token>
```

### 💰 Billing Endpoints

#### Calculate Bill
```http
POST /billing/calculate
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "consumerId": "consumer-id-here",
  "billingCycle": "2024-01",
  "unitsConsumed": 250,
  "tariffPlan": "basic"
}
```

#### Get Billing Summary
```http
GET /billing/summary?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <admin-token>
```

### 🔔 Alert Endpoints

#### Create System Alert
```http
POST /alerts/create
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "type": "maintenance",
  "severity": "info",
  "message": "Scheduled maintenance on Sunday",
  "isSystemWide": true
}
```

#### Get My Alerts
```http
GET /alerts/my-alerts?acknowledged=false&page=1&limit=20
Authorization: Bearer <token>
```

#### Acknowledge Alert
```http
PATCH /alerts/acknowledge/:alertId
Authorization: Bearer <token>
```

#### Check Auto Alerts
```http
POST /alerts/check-auto-alerts
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "consumerId": "consumer-id-here"
}
```

## 🏗️ Database Schema

### Consumer Model
- Personal information and contact details
- Meter information and connection details
- Authentication credentials
- Preferences and alert settings
- Account status and verification

### Admin Model
- Admin credentials and role management
- Permission-based access control
- Security features and session management

### MeterReading Model
- Real-time meter readings and consumption data
- Power quality metrics (voltage, current, frequency)
- Tamper detection and security alerts
- Historical data and analytics

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: express-validator for request validation
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers for enhanced protection

## 🚦 Error Handling

The API returns consistent error responses:

```json
{
  "status": "error",
  "message": "Descriptive error message",
  "errors": ["Detailed validation errors if any"]
}
```

## 📈 Response Format

All successful responses follow this format:

```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

## 🧪 Testing

### Health Check
```http
GET /api/health
```

Expected response:
```json
{
  "status": "success",
  "message": "PowerPulsePro API is running!",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/powerpulsepro
JWT_SECRET=your-super-secure-production-jwt-secret
CLIENT_URL=https://your-frontend-domain.com
```

### Start in Production
```bash
npm start
```

## 📞 Support

For technical support or questions about the API, please refer to the documentation or contact the development team.

## 📄 License

This project is licensed under the MIT License.

---

**PowerPulsePro Backend API v1.0.0**  
*Smart Energy Meter Management System*