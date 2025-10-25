# 📊 Server Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT REQUESTS                           │
│                    (React Frontend App)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         index.js                                 │
│                    (Main Entry Point)                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ • Express App Initialization                              │  │
│  │ • Middleware Setup (CORS, JSON)                          │  │
│  │ • Health Check Routes                                     │  │
│  │ • Error Handlers                                          │  │
│  │ • Graceful Shutdown                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────┬────────────┬───────────┬────────────────────────────────┘
         │            │           │
         │            │           │
         ▼            ▼           ▼
┌────────────┐  ┌──────────┐  ┌──────────────┐
│   config/  │  │middleware│  │   routes/    │
└────────────┘  └──────────┘  └──────────────┘
         │            │           │
         │            │           │
         ▼            ▼           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CONFIG LAYER                                │
│  ┌──────────────────────┐    ┌──────────────────────┐          │
│  │  database.js         │    │  firebase.js         │          │
│  ├──────────────────────┤    ├──────────────────────┤          │
│  │ • connectDB()        │    │ • initializeFirebase │          │
│  │ • getDB()            │    │ • admin instance     │          │
│  │ • closeDB()          │    │                      │          │
│  │ • MongoDB Client     │    │                      │          │
│  └──────────────────────┘    └──────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MIDDLEWARE LAYER                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     auth.js                              │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ • verifyFirebaseToken()                                  │   │
│  │   └─> Validates JWT token from headers                  │   │
│  │                                                           │   │
│  │ • verifyTokenEmail()                                     │   │
│  │   └─> Ensures email matches token                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ROUTES LAYER                                │
│  ┌──────────────────────┐    ┌──────────────────────┐          │
│  │  carsRoutes.js       │    │ bookingsRoutes.js    │          │
│  ├──────────────────────┤    ├──────────────────────┤          │
│  │ GET  /all            │    │ GET  /               │          │
│  │ GET  /               │    │ GET  /count/:carId   │          │
│  │ GET  /recently-added │    │ POST /               │          │
│  │ GET  /available      │    │ PATCH /:id           │          │
│  │ GET  /search    ⭐   │    │                      │          │
│  │ GET  /:id            │    │                      │          │
│  │ POST /               │    │                      │          │
│  │ PUT  /:id            │    │                      │          │
│  │ DELETE /:id          │    │                      │          │
│  └──────────────────────┘    └──────────────────────┘          │
└───────────┬───────────────────────────┬─────────────────────────┘
            │                           │
            ▼                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CONTROLLERS LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               carsController.js                           │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ • getAllCars()           • searchCars() ⭐               │  │
│  │ • getCarsByUserEmail()   • getCarById()                  │  │
│  │ • getRecentCars()        • createCar()                   │  │
│  │ • getAvailableCars()     • updateCar()                   │  │
│  │                          • deleteCar()                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │             bookingsController.js                         │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ • getBookingsByUserEmail()                               │  │
│  │ • getBookingCountByCarId()                               │  │
│  │ • createBooking()                                        │  │
│  │ • updateBooking()                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    MongoDB Atlas                          │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  Database: car-rental                                     │  │
│  │                                                           │  │
│  │  ┌────────────────┐         ┌────────────────┐          │  │
│  │  │ cars           │         │ bookings       │          │  │
│  │  │ collection     │         │ collection     │          │  │
│  │  ├────────────────┤         ├────────────────┤          │  │
│  │  │ • _id          │         │ • _id          │          │  │
│  │  │ • model        │         │ • carId        │          │  │
│  │  │ • brand        │         │ • userEmail    │          │  │
│  │  │ • price        │         │ • startDate    │          │  │
│  │  │ • transmission │         │ • endDate      │          │  │
│  │  │ • fuel         │         │ • status       │          │  │
│  │  │ • seats        │         │                │          │  │
│  │  │ • rating       │         │                │          │  │
│  │  │ • location     │         │                │          │  │
│  │  │ • ...          │         │                │          │  │
│  │  └────────────────┘         └────────────────┘          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow Example

### Example: Advanced Car Search

```
1. CLIENT
   ↓
   GET /api/cars/search?query=sedan&minPrice=50&maxPrice=90
   ↓
2. index.js (Main Entry Point)
   ├─> Middleware: CORS ✓
   ├─> Middleware: JSON Parser ✓
   └─> Route: /api/cars/search
   ↓
3. routes/carsRoutes.js
   └─> router.get('/search', handler)
   ↓
4. controllers/carsController.js
   └─> searchCars(req, res, carsCollection)
       ├─> Parse query parameters
       ├─> Build MongoDB filter
       │   ├─> Text search: { $or: [...] }
       │   ├─> Price filter: { price: { $gte, $lte } }
       │   ├─> Transmission filter
       │   ├─> Fuel filter
       │   └─> ...more filters
       ├─> Apply sorting
       ├─> Apply pagination
       └─> Execute query
   ↓
5. config/database.js
   └─> carsCollection.find(filter).sort().skip().limit()
   ↓
6. MongoDB Atlas
   ├─> Execute query with indexes
   └─> Return matching documents
   ↓
7. RESPONSE
   {
     cars: [...],
     total: 45,
     totalPages: 4,
     currentPage: 1,
     limit: 12
   }
   ↓
8. CLIENT (receives data)
   └─> React updates UI with TanStack Query
```

---

## 🔐 Protected Route Flow

### Example: Get User's Cars

```
1. CLIENT
   ↓
   GET /api/cars?userEmail=user@example.com
   Headers: { Authorization: "Bearer <firebase-token>" }
   ↓
2. index.js
   └─> Route: /api/cars
   ↓
3. routes/carsRoutes.js
   └─> Middleware chain:
       [verifyFirebaseToken, verifyTokenEmail, handler]
   ↓
4. middleware/auth.js
   ├─> verifyFirebaseToken()
   │   ├─> Extract token from header
   │   ├─> Verify with Firebase Admin SDK
   │   ├─> Decode token
   │   └─> Attach to req.decoded ✓
   │
   └─> verifyTokenEmail()
       ├─> Extract email from query
       ├─> Compare with req.decoded.email
       └─> Match? ✓ Continue : ✗ 403 Forbidden
   ↓
5. controllers/carsController.js
   └─> getCarsByUserEmail()
       └─> Query cars by userEmail
   ↓
6. MongoDB
   └─> Return user's cars
   ↓
7. CLIENT (receives protected data)
```

---

## 📦 Module Dependencies

```
index.js
├── requires config/database.js
│   └── exports: connectDB, getDB, closeDB
├── requires config/firebase.js
│   └── exports: initializeFirebase, admin
├── requires routes/carsRoutes.js
│   ├── requires controllers/carsController.js
│   │   └── exports: 9 functions
│   └── requires middleware/auth.js
│       └── exports: verifyFirebaseToken, verifyTokenEmail
└── requires routes/bookingsRoutes.js
    ├── requires controllers/bookingsController.js
    │   └── exports: 4 functions
    └── requires middleware/auth.js
        └── exports: verifyFirebaseToken, verifyTokenEmail
```

---

## 🎯 Architecture Benefits

```
┌─────────────────────────────────────────┐
│         SOLID PRINCIPLES                │
├─────────────────────────────────────────┤
│ ✅ Single Responsibility                │
│    Each module has one job              │
│                                         │
│ ✅ Open/Closed Principle                │
│    Easy to extend, hard to break       │
│                                         │
│ ✅ Dependency Inversion                 │
│    Controllers depend on abstractions  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│      CLEAN ARCHITECTURE                 │
├─────────────────────────────────────────┤
│ Layer 1: Routes (HTTP interface)        │
│ Layer 2: Controllers (Business logic)   │
│ Layer 3: Services (Data access)         │
│ Layer 4: Database (Persistence)         │
└─────────────────────────────────────────┘
```

---

## 🚀 Performance Flow

```
Request → Middleware (fast) → Route (instant) → Controller (logic) → Database (indexed) → Response
   ↓           ↓                   ↓                ↓                    ↓              ↓
  CORS      Auth Check         Parsing         Business Logic      MongoDB Query    JSON
  JSON       Token              Route           Filtering           Indexed Lookup   Format
             Verify             Matching        Sorting             Efficient        Send
```

**Optimizations:**

-   ✅ Single database connection (reused)
-   ✅ Middleware runs once per request
-   ✅ Controllers are stateless (fast)
-   ✅ Database indexes for quick lookups
-   ✅ Efficient error handling

---

## 📁 File System View

```
server-side/
│
├── 📂 config/               (Configuration)
│   ├── 📄 database.js       MongoDB setup
│   └── 📄 firebase.js       Firebase setup
│
├── 📂 controllers/          (Business Logic)
│   ├── 📄 carsController.js       9 functions
│   └── 📄 bookingsController.js   4 functions
│
├── 📂 middleware/           (Request Processing)
│   └── 📄 auth.js           Authentication
│
├── 📂 routes/               (API Endpoints)
│   ├── 📄 carsRoutes.js     9 endpoints
│   └── 📄 bookingsRoutes.js 4 endpoints
│
├── 📄 index.js              (Entry Point - 104 lines)
├── 📄 index.backup.js       (Original - 412 lines)
│
├── 📄 advancedSearchExample.js
├── 📄 sampleData.js
├── 📄 firebase-adminsdk.json
│
├── 📘 SERVER_STRUCTURE.md
├── 📘 RESTRUCTURING_SUMMARY.md
├── 📘 ARCHITECTURE_DIAGRAM.md (this file)
│
├── 📦 package.json
└── 🔒 .env
```

---

**This modular architecture makes your server maintainable, scalable, and production-ready!** ✨
