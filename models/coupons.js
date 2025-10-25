/**
 * Coupons Model
 * Defines coupon structures and validation
 */

/**
 * Sample Coupons:
 *
 * Percentage Discount:
 * {
 *   code: 'SUMMER20',
 *   pct: 20,
 *   expiresAt: '2025-08-31T23:59:59Z',
 *   active: true,
 *   usageLimit: 100,
 *   usageCount: 0
 * }
 *
 * Flat Discount:
 * {
 *   code: 'SAVE50',
 *   flat: 50,
 *   expiresAt: '2025-12-31T23:59:59Z',
 *   active: true,
 *   usageLimit: 50,
 *   usageCount: 0
 * }
 */

const DEFAULT_COUPONS = [
    {
        code: "WELCOME10",
        pct: 10,
        expiresAt: "2026-12-31T23:59:59Z",
        active: true,
        description: "Welcome discount - 10% off your first booking",
        usageLimit: 1000,
        usageCount: 0,
    },
    {
        code: "SUMMER20",
        pct: 20,
        expiresAt: "2025-08-31T23:59:59Z",
        active: true,
        description: "Summer special - 20% off",
        usageLimit: 500,
        usageCount: 0,
    },
    {
        code: "SAVE50",
        flat: 50,
        expiresAt: "2025-12-31T23:59:59Z",
        active: true,
        description: "Save $50 on your booking",
        usageLimit: 100,
        usageCount: 0,
    },
    {
        code: "LONGTERM",
        pct: 15,
        expiresAt: "2026-06-30T23:59:59Z",
        active: true,
        description: "Long-term rental discount",
        usageLimit: 200,
        usageCount: 0,
        minDays: 7,
    },
];

/**
 * Validate coupon structure
 */
const validateCoupon = (coupon) => {
    if (!coupon.code || typeof coupon.code !== "string") {
        throw new Error("Coupon code is required");
    }

    if (!coupon.pct && !coupon.flat) {
        throw new Error("Coupon must have either pct or flat value");
    }

    if (coupon.pct && (coupon.pct < 0 || coupon.pct > 100)) {
        throw new Error("Percentage must be between 0 and 100");
    }

    if (coupon.flat && coupon.flat < 0) {
        throw new Error("Flat discount must be positive");
    }

    if (!coupon.expiresAt) {
        throw new Error("Expiration date is required");
    }

    return true;
};

/**
 * Check if coupon is valid for use
 */
const isCouponValid = (coupon) => {
    if (!coupon.active) {
        return { valid: false, reason: "Coupon is no longer active" };
    }

    const now = new Date();
    const expiresAt = new Date(coupon.expiresAt);

    if (now > expiresAt) {
        return { valid: false, reason: "Coupon has expired" };
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return { valid: false, reason: "Coupon usage limit reached" };
    }

    return { valid: true };
};

module.exports = {
    DEFAULT_COUPONS,
    validateCoupon,
    isCouponValid,
};
