/**
 * API Testing Guide for Dynamic Pricing & Availability
 *
 * This file contains comprehensive test scenarios using cURL commands
 */

// ============================================
// 1. GET BOOKING QUOTE - Basic Test
// ============================================

/**
 * Test Case: Get quote for 5-night stay without coupon
 * Expected: Should return quote with subtotal, taxes, and total
 */
/*
curl -X POST http://localhost:5000/api/bookings/quote \
  -H "Content-Type: application/json" \
  -d '{
    "carId": "YOUR_CAR_ID_HERE",
    "startDate": "2025-11-01T10:00:00Z",
    "endDate": "2025-11-06T10:00:00Z"
  }'
*/

// ============================================
// 2. GET QUOTE WITH COUPON
// ============================================

/**
 * Test Case: Apply 20% coupon discount
 * Expected: Should show couponDiscount field
 */
/*
curl -X POST http://localhost:5000/api/bookings/quote \
  -H "Content-Type: application/json" \
  -d '{
    "carId": "YOUR_CAR_ID_HERE",
    "startDate": "2025-11-01T10:00:00Z",
    "endDate": "2025-11-06T10:00:00Z",
    "coupon": "SUMMER20"
  }'
*/

// ============================================
// 3. TEST WEEKEND PRICING
// ============================================

/**
 * Test Case: Book Friday to Sunday (weekend surcharge)
 * Expected: Should show weekend rules in appliedRules.seasonal
 */
/*
curl -X POST http://localhost:5000/api/bookings/quote \
  -H "Content-Type: application/json" \
  -d '{
    "carId": "YOUR_CAR_ID_HERE",
    "startDate": "2025-11-07T10:00:00Z",
    "endDate": "2025-11-09T10:00:00Z"
  }'
*/

// ============================================
// 4. TEST LENGTH DISCOUNT (7+ days)
// ============================================

/**
 * Test Case: Book for 8 days to get weekly discount
 * Expected: lengthDiscount should be 10% of subtotal
 */
/*
curl -X POST http://localhost:5000/api/bookings/quote \
  -H "Content-Type: application/json" \
  -d '{
    "carId": "YOUR_CAR_ID_HERE",
    "startDate": "2025-11-01T10:00:00Z",
    "endDate": "2025-11-09T10:00:00Z"
  }'
*/

// ============================================
// 5. TEST SEASONAL PRICING (Summer)
// ============================================

/**
 * Test Case: Book during summer peak season
 * Expected: Should show "Summer Peak Season" in appliedRules
 */
/*
curl -X POST http://localhost:5000/api/bookings/quote \
  -H "Content-Type: application/json" \
  -d '{
    "carId": "YOUR_CAR_ID_HERE",
    "startDate": "2025-07-01T10:00:00Z",
    "endDate": "2025-07-05T10:00:00Z"
  }'
*/

// ============================================
// 6. GET BOOKED DATES
// ============================================

/**
 * Test Case: Fetch all booked date ranges for a car
 * Expected: Array of booked ranges with startDate and endDate
 */
/*
curl http://localhost:5000/api/bookings/booked-dates/YOUR_CAR_ID_HERE
*/

// ============================================
// 7. TEST INVALID COUPON
// ============================================

/**
 * Test Case: Try invalid coupon code
 * Expected: couponError field with message
 */
/*
curl -X POST http://localhost:5000/api/bookings/quote \
  -H "Content-Type: application/json" \
  -d '{
    "carId": "YOUR_CAR_ID_HERE",
    "startDate": "2025-11-01T10:00:00Z",
    "endDate": "2025-11-06T10:00:00Z",
    "coupon": "INVALID123"
  }'
*/

// ============================================
// 8. TEST DATE VALIDATION
// ============================================

/**
 * Test Case: End date before start date
 * Expected: 400 error with message
 */
/*
curl -X POST http://localhost:5000/api/bookings/quote \
  -H "Content-Type: application/json" \
  -d '{
    "carId": "YOUR_CAR_ID_HERE",
    "startDate": "2025-11-06T10:00:00Z",
    "endDate": "2025-11-01T10:00:00Z"
  }'
*/

// ============================================
// POWERSH ELL EXAMPLES (Windows)
// ============================================

/**
 * PowerShell Example 1: Basic Quote
 */
/*
$body = @{
    carId = "YOUR_CAR_ID_HERE"
    startDate = "2025-11-01T10:00:00Z"
    endDate = "2025-11-06T10:00:00Z"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/bookings/quote" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
*/

/**
 * PowerShell Example 2: With Coupon
 */
/*
$body = @{
    carId = "YOUR_CAR_ID_HERE"
    startDate = "2025-11-01T10:00:00Z"
    endDate = "2025-11-06T10:00:00Z"
    coupon = "WELCOME10"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/bookings/quote" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
*/

/**
 * PowerShell Example 3: Get Booked Dates
 */
/*
Invoke-RestMethod -Uri "http://localhost:5000/api/bookings/booked-dates/YOUR_CAR_ID_HERE" `
  -Method Get
*/

// ============================================
// EXPECTED RESPONSE STRUCTURE
// ============================================

/**
 * Successful Quote Response:
 * {
 *   "nightly": 45,
 *   "nights": 5,
 *   "subtotal": 225.00,
 *   "lengthDiscount": 0,
 *   "couponDiscount": 45.00,
 *   "taxes": 18.00,
 *   "total": 198.00,
 *   "unavailable": false,
 *   "conflictingDates": [],
 *   "priceBreakdown": {
 *     "baseSubtotal": 225.00,
 *     "afterLengthDiscount": 225.00,
 *     "afterCouponDiscount": 180.00,
 *     "taxableAmount": 180.00,
 *     "finalTotal": 198.00
 *   },
 *   "appliedRules": {
 *     "length": null,
 *     "seasonal": [],
 *     "coupon": {
 *       "code": "WELCOME10",
 *       "discount": 45.00,
 *       "error": null
 *     }
 *   },
 *   "dailyBreakdown": [
 *     {
 *       "date": "2025-11-01",
 *       "price": 45.00,
 *       "appliedRules": []
 *     }
 *   ]
 * }
 */

// ============================================
// AVAILABLE TEST COUPONS
// ============================================

/**
 * WELCOME10 - 10% off (expires 2026-12-31)
 * SUMMER20  - 20% off (expires 2025-08-31)
 * SAVE50    - $50 flat discount (expires 2025-12-31)
 * LONGTERM  - 15% off for 7+ days (expires 2026-06-30)
 */

// ============================================
// TESTING CHECKLIST
// ============================================

/**
 * □ Basic quote calculation
 * □ Weekend surcharge applies
 * □ Seasonal pricing applies
 * □ Length discount (7+ days)
 * □ Length discount (30+ days)
 * □ Coupon applies correctly
 * □ Invalid coupon shows error
 * □ Past date validation
 * □ End date before start date validation
 * □ Booked dates fetch correctly
 * □ Conflict detection works
 * □ Tax calculation correct
 * □ Daily breakdown accurate
 */

console.log("📋 API Testing Guide loaded!");
console.log(
    "Copy the cURL or PowerShell commands above to test the endpoints."
);
console.log(
    "Remember to replace YOUR_CAR_ID_HERE with an actual car ID from your database."
);
