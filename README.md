# Car Rental System - Backend API

A robust backend API for a car rental system built with Node.js, Express, MongoDB, and Firebase Admin SDK. This API provides comprehensive endpoints for managing cars, bookings, and user authentication.

## 🚀 Features

-   **Authentication & Authorization**: Firebase Admin SDK integration with JWT token verification
-   **Car Management**: CRUD operations for car listings
-   **Booking System**: Complete booking management with real-time updates
-   **User-specific Data**: Protected routes ensuring users can only access their own data
-   **Real-time Updates**: Automatic booking count updates when new bookings are created
-   **Secure Middleware**: Email verification and token validation

## 🛠️ Technologies Used

-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB with MongoDB Driver
-   **Authentication**: Firebase Admin SDK
-   **Environment Management**: dotenv
-   **CORS**: Cross-Origin Resource Sharing enabled

## 📦 Dependencies

```json
{
    "cors": "^2.8.5",
    "dotenv": "^16.5.0",
    "express": "^5.1.0",
    "firebase-admin": "^13.4.0",
    "mongodb": "^6.17.0"
}
```

## 🚀 Getting Started

### Prerequisites

-   Node.js (v14 or higher)
-   MongoDB Atlas account
-   Firebase project with Admin SDK credentials
-   npm or yarn package manager

### Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/Programming-Hero-Web-Course4/b11a11-server-side-codewithjihad1.git
    cd server-side
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

    ```env
    MONGODB_USER=your_mongodb_username
    MONGODB_PASS=your_mongodb_password
    ```

4. **Firebase Setup**

    - Download your Firebase Admin SDK private key JSON file
    - Rename it to `firebase-adminsdk.json`
    - Place it in the root directory

5. **Start the server**
    ```bash
    npm start
    ```

The server will start running at `http://localhost:3000`

## 🔗 API Endpoints

### Authentication

All protected routes require a Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

### Cars Endpoints

#### Get All Cars (Public)

```http
GET /api/cars/all
```

Returns all cars in the database.

#### Get User's Cars (Protected)

```http
GET /api/cars?userEmail=user@example.com
```

Returns cars owned by the authenticated user.

#### Get Recently Added Cars (Public)

```http
GET /api/cars/recently-added
```

Returns the 8 most recently added cars.

#### Get Available Cars (Public)

```http
GET /api/cars/available
```

Returns all cars with "Available" status.

#### Get Car by ID (Public)

```http
GET /api/cars/:id
```

Returns a specific car by its ID.

#### Add New Car (Public)

```http
POST /api/cars
Content-Type: application/json

{
  "carModel": "Toyota Camry 2023",
  "dailyRentalPrice": 50,
  "availability": "Available",
  "vehicleRegistrationNumber": "ABC-123",
  "features": ["GPS", "Air Conditioning", "Bluetooth"],
  "description": "Comfortable sedan perfect for city driving",
  "imageUrl": "https://example.com/car-image.jpg",
  "location": "New York, NY",
  "userEmail": "owner@example.com",
  "dateAdded": "2025-06-14T10:30:00Z",
  "bookingCount": 0
}
```

#### Update Car (Public)

```http
PUT /api/cars/:id
Content-Type: application/json

{
  "carModel": "Updated Car Model",
  "dailyRentalPrice": 60,
  "availability": "Available"
}
```

#### Delete Car (Public)

```http
DELETE /api/cars/:id
```

### Bookings Endpoints

#### Get User's Bookings (Protected)

```http
GET /api/bookings?userEmail=user@example.com
```

Returns all bookings for the authenticated user.

#### Get Booking Count for Car (Public)

```http
GET /api/bookings/count/:carId
```

Returns the total number of bookings for a specific car.

#### Create Booking (Public)

```http
POST /api/bookings
Content-Type: application/json

{
  "carId": "car_id_here",
  "carModel": "Toyota Camry 2023",
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "startDate": "2025-06-20T10:00:00Z",
  "endDate": "2025-06-25T18:00:00Z",
  "totalPrice": 250,
  "bookingDate": "2025-06-14T14:30:00Z",
  "status": "confirmed"
}
```

#### Update Booking (Public)

```http
PATCH /api/bookings/:id
Content-Type: application/json

{
  "status": "canceled",
  "startDate": "2025-06-21T10:00:00Z",
  "endDate": "2025-06-26T18:00:00Z"
}
```

## 🔐 Security Features

### Firebase Token Verification

```javascript
const verifyFirebaseToken = async (req, res, next) => {
    const idToken = req.headers.authorization?.split("Bearer ")[1];
    // Token verification logic
};
```

### Email Verification Middleware

```javascript
const verifyTokenEmail = async (req, res, next) => {
    const email = req.query.userEmail;
    // Ensures users can only access their own data
};
```

## 📊 Database Schema

### Cars Collection

```javascript
{
  _id: ObjectId,
  carModel: String,
  dailyRentalPrice: Number,
  availability: String, // "Available" | "Unavailable"
  vehicleRegistrationNumber: String,
  features: Array<String>,
  description: String,
  imageUrl: String,
  location: String,
  userEmail: String,
  dateAdded: Date,
  bookingCount: Number
}
```

### Bookings Collection

```javascript
{
  _id: ObjectId,
  carId: String,
  carModel: String,
  userEmail: String,
  userName: String,
  startDate: Date,
  endDate: Date,
  totalPrice: Number,
  bookingDate: Date,
  status: String // "confirmed" | "pending" | "canceled"
}
```

## 🔧 Configuration

### MongoDB Connection

The API connects to MongoDB Atlas using the following connection string format:

```
mongodb+srv://${MONGODB_USER}:${MONGODB_PASS}@cluster0.ya0qxn8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### Firebase Configuration

Firebase Admin SDK is initialized using the service account credentials from `firebase-adminsdk.json`.

## 📝 API Response Format

### Success Response

```json
{
    "acknowledged": true,
    "insertedId": "car_id_here"
}
```

### Error Response

```json
{
    "error": "Error message here"
}
```

## 🚨 Error Handling

The API includes comprehensive error handling for:

-   Invalid or missing Firebase tokens (401 Unauthorized)
-   Email mismatch for protected routes (403 Forbidden)
-   Missing required parameters (400 Bad Request)
-   Car not found (404 Not Found)
-   Database connection errors (500 Internal Server Error)

## 🧪 Testing

### Example cURL Commands

**Get all cars:**

```bash
curl -X GET http://localhost:3000/api/cars/all
```

**Create a booking:**

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "carId": "car_id_here",
    "userEmail": "user@example.com",
    "startDate": "2025-06-20T10:00:00Z",
    "endDate": "2025-06-25T18:00:00Z",
    "totalPrice": 250
  }'
```

**Get user's cars (requires authentication):**

```bash
curl -X GET "http://localhost:3000/api/cars?userEmail=user@example.com" \
  -H "Authorization: Bearer <firebase-id-token>"
```

## 🔄 Auto-increment Features

-   **Booking Count**: Automatically increments when a new booking is created
-   **Date Sorting**: Recently added cars are automatically sorted by date

## 🛡️ Security Best Practices

1. **Token Validation**: All protected routes validate Firebase ID tokens
2. **Email Verification**: Users can only access their own data
3. **CORS Configuration**: Properly configured for cross-origin requests
4. **Environment Variables**: Sensitive data stored in environment variables

## 📈 Performance Features

-   **Efficient Queries**: Optimized MongoDB queries with proper indexing
-   **Async/Await**: Non-blocking asynchronous operations
-   **Error Handling**: Comprehensive error handling prevents crashes

## 🚀 Deployment

For production deployment:

1. Set up environment variables on your hosting platform
2. Ensure MongoDB Atlas allows connections from your server
3. Upload Firebase service account credentials securely
4. Configure CORS for your production domain

## 📞 Support

For issues and questions:

-   Check the console logs for detailed error messages
-   Verify MongoDB connection string and credentials
-   Ensure Firebase service account has proper permissions
-   Validate API request formats and authentication tokens

## 📄 License

This project is part of a car rental system is intended for educational purposes.
