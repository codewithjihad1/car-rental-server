# 📁 Server Structure Documentation

## Overview

The server has been restructured into a modular architecture following industry best practices for better maintainability, scalability, and code organization.

## 🏗️ New Project Structure

```
server-side/
├── config/
│   ├── database.js          # MongoDB connection configuration
│   └── firebase.js          # Firebase Admin initialization
├── controllers/
│   ├── carsController.js    # Car-related business logic
│   └── bookingsController.js # Booking-related business logic
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   ├── carsRoutes.js        # Car endpoints routing
│   └── bookingsRoutes.js    # Booking endpoints routing
├── index.js                 # Main application entry point
├── index.backup.js          # Backup of original monolithic code
├── advancedSearchExample.js # Advanced search examples
├── sampleData.js            # Sample data for testing
├── firebase-adminsdk.json   # Firebase credentials
├── package.json
└── .env
```

---

## 📂 Module Details

### 1. **config/** - Configuration Modules

#### `config/database.js`

Handles MongoDB connection management.

**Exports:**

-   `connectDB()` - Establishes MongoDB connection
-   `getDB()` - Returns database instance
-   `closeDB()` - Closes connection gracefully
-   `client` - MongoDB client instance

**Usage:**

```javascript
const { connectDB, getDB } = require("./config/database");
await connectDB();
const db = getDB();
```

#### `config/firebase.js`

Manages Firebase Admin SDK initialization.

**Exports:**

-   `initializeFirebase()` - Initializes Firebase Admin
-   `admin` - Firebase Admin instance

**Usage:**

```javascript
const { initializeFirebase, admin } = require("./config/firebase");
initializeFirebase();
```

---

### 2. **middleware/** - Middleware Functions

#### `middleware/auth.js`

Authentication and authorization middleware.

**Exports:**

-   `verifyFirebaseToken` - Validates Firebase JWT token
-   `verifyTokenEmail` - Verifies user email matches token

**Usage:**

```javascript
const { verifyFirebaseToken, verifyTokenEmail } = require("./middleware/auth");
router.get("/protected", verifyFirebaseToken, verifyTokenEmail, handler);
```

---

### 3. **controllers/** - Business Logic

#### `controllers/carsController.js`

Handles all car-related operations.

**Functions:**

-   `getAllCars(req, res, carsCollection)` - Fetch all cars
-   `getCarsByUserEmail(req, res, carsCollection)` - Get user's cars
-   `getRecentCars(req, res, carsCollection)` - Get recently added cars
-   `getAvailableCars(req, res, carsCollection)` - Get available cars
-   `searchCars(req, res, carsCollection)` - Advanced search with filters
-   `getCarById(req, res, carsCollection)` - Get single car
-   `createCar(req, res, carsCollection)` - Add new car
-   `updateCar(req, res, carsCollection)` - Update car details
-   `deleteCar(req, res, carsCollection)` - Remove car

#### `controllers/bookingsController.js`

Handles all booking-related operations.

**Functions:**

-   `getBookingsByUserEmail(req, res, bookingsCollection)` - Get user bookings
-   `getBookingCountByCarId(req, res, bookingsCollection)` - Get booking count
-   `createBooking(req, res, bookingsCollection, carsCollection)` - Create booking
-   `updateBooking(req, res, bookingsCollection)` - Update booking status

---

### 4. **routes/** - Route Definitions

#### `routes/carsRoutes.js`

Defines all car-related API endpoints.

**Routes:**

```javascript
GET    /api/cars/all              # Get all cars
GET    /api/cars                  # Get user's cars (protected)
GET    /api/cars/recently-added   # Get recent cars
GET    /api/cars/available        # Get available cars
GET    /api/cars/search           # Advanced search
GET    /api/cars/:id              # Get car by ID
POST   /api/cars                  # Create new car
PUT    /api/cars/:id              # Update car
DELETE /api/cars/:id              # Delete car
```

#### `routes/bookingsRoutes.js`

Defines all booking-related API endpoints.

**Routes:**

```javascript
GET    /api/bookings              # Get user bookings (protected)
GET    /api/bookings/count/:carId # Get booking count
POST   /api/bookings              # Create booking
PATCH  /api/bookings/:id          # Update booking
```

---

### 5. **index.js** - Main Entry Point

The main application file that:

-   Initializes Express app
-   Loads environment variables
-   Sets up middleware (CORS, JSON parsing)
-   Connects to database
-   Initializes routes
-   Handles errors and graceful shutdown
-   Starts the server

**Key Features:**

-   ✅ Health check endpoints (`/`, `/health`)
-   ✅ Graceful shutdown handling
-   ✅ Global error handling
-   ✅ 404 route handler
-   ✅ Comprehensive logging

---

## 🔄 Migration from Old Structure

### Before (Monolithic)

All code in one file:

```javascript
// index.js (400+ lines)
- Database connection
- Firebase setup
- Middleware
- All routes
- All controllers
- Server startup
```

### After (Modular)

Organized into focused modules:

```javascript
// index.js (clean entry point)
// config/ (configurations)
// middleware/ (reusable middleware)
// controllers/ (business logic)
// routes/ (route definitions)
```

---

## ✅ Benefits of Restructuring

### 1. **Separation of Concerns**

Each module has a single, well-defined responsibility.

### 2. **Maintainability**

Easier to find and modify specific functionality.

### 3. **Scalability**

Easy to add new features without cluttering existing code.

### 4. **Testability**

Individual modules can be tested in isolation.

### 5. **Reusability**

Controllers and middleware can be reused across routes.

### 6. **Readability**

Clear structure makes onboarding new developers easier.

### 7. **Error Handling**

Centralized error handling with proper logging.

### 8. **Performance**

Better code organization leads to easier optimization.

---

## 🚀 How to Use

### Starting the Server

```bash
# Development
npm start

# The server will display:
========================================
🚀 Server running on http://localhost:3000
========================================
📍 API Endpoints:
   - GET  /api/cars/all
   - GET  /api/cars/search
   - GET  /api/cars/:id
   - POST /api/cars
   - GET  /api/bookings
   - POST /api/bookings
========================================
```

### Adding New Features

#### Add a New Route:

1. Create controller function in `controllers/`
2. Add route definition in `routes/`
3. Route automatically available

**Example: Add a "favorites" feature**

```javascript
// controllers/favoritesController.js
const getFavorites = async (req, res, favoritesCollection) => {
    // Logic here
};

// routes/favoritesRoutes.js
router.get("/", (req, res) => getFavorites(req, res, favoritesCollection));

// index.js
app.use("/api/favorites", favoritesRoutes(favoritesCollection));
```

---

## 🔒 Security Features

-   ✅ Firebase authentication token verification
-   ✅ Email verification for protected routes
-   ✅ CORS enabled
-   ✅ Environment variable protection
-   ✅ Error message sanitization
-   ✅ Graceful shutdown handling

---

## 📝 Environment Variables

Required in `.env`:

```env
MONGODB_USER=your_mongodb_username
MONGODB_PASS=your_mongodb_password
PORT=3000  # Optional, defaults to 3000
```

---

## 🧪 Testing Endpoints

### Health Check

```bash
curl http://localhost:3000/health
```

### Get All Cars

```bash
curl http://localhost:3000/api/cars/all
```

### Advanced Search

```bash
curl "http://localhost:3000/api/cars/search?query=sedan&minPrice=50&maxPrice=90"
```

---

## 🐛 Debugging

### Enable Detailed Logging

The new structure includes comprehensive console logging:

-   ✅ Server startup information
-   ✅ Database connection status
-   ✅ Firebase initialization
-   ✅ Error messages with context
-   ✅ Graceful shutdown messages

### Common Issues

**Issue: "Database not initialized"**

```
Solution: Ensure connectDB() is called before getDB()
```

**Issue: "Firebase credentials error"**

```
Solution: Verify firebase-adminsdk.json exists and is valid
```

**Issue: "Port already in use"**

```
Solution: Change PORT in .env or kill process on port 3000
```

---

## 📊 Performance Considerations

-   Database connection is established once and reused
-   Collections are passed to controllers (no repeated queries)
-   Middleware is reusable across routes
-   Error handling prevents memory leaks
-   Graceful shutdown prevents data corruption

---

## 🔮 Future Enhancements

### Potential Additions:

-   [ ] Request validation middleware
-   [ ] Rate limiting
-   [ ] API documentation (Swagger)
-   [ ] Logging middleware (Winston/Morgan)
-   [ ] Caching layer (Redis)
-   [ ] Unit tests (Jest)
-   [ ] Integration tests
-   [ ] API versioning

---

## 📚 Code Standards

### Naming Conventions:

-   **Files**: camelCase (e.g., `carsController.js`)
-   **Functions**: camelCase (e.g., `getAllCars`)
-   **Constants**: UPPER_SNAKE_CASE (e.g., `PORT`)
-   **Routes**: kebab-case (e.g., `/recently-added`)

### Documentation:

-   JSDoc comments for all exported functions
-   Clear module descriptions at file top
-   Inline comments for complex logic

### Error Handling:

-   Try-catch blocks in all async functions
-   Descriptive error messages
-   Proper HTTP status codes

---

## 🤝 Contributing

When adding new features:

1. Create appropriate controller in `controllers/`
2. Define routes in `routes/`
3. Add middleware if needed in `middleware/`
4. Update this documentation
5. Test all endpoints
6. Follow existing code style

---

## 📞 Support

For questions or issues:

1. Check this documentation
2. Review code comments
3. Test with health check endpoints
4. Check console logs for errors

---

## ✨ Summary

The restructured server provides:

-   ✅ Clean, modular architecture
-   ✅ Easy to maintain and extend
-   ✅ Industry-standard organization
-   ✅ Comprehensive error handling
-   ✅ Ready for production deployment

**Backup:** Original code preserved in `index.backup.js`
