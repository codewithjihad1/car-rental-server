/**
 * Pricing Service
 * Handles dynamic pricing calculations with seasonal rules, weekend surcharges,
 * length discounts, and coupon applications
 */

const { DEFAULT_PRICE_RULES } = require("../models/priceRules");

/**
 * Calculate if a date is a weekend (Friday, Saturday, Sunday)
 */
const isWeekend = (date) => {
    const day = date.getDay();
    return day === 5 || day === 6 || day === 0; // Friday, Saturday, Sunday
};

/**
 * Calculate if a date falls within a seasonal period
 */
const isInSeasonalPeriod = (date, seasonStart, seasonEnd) => {
    const checkDate = new Date(date);
    const start = new Date(seasonStart);
    const end = new Date(seasonEnd);

    return checkDate >= start && checkDate <= end;
};

/**
 * Apply price rules to calculate adjusted nightly rate
 */
const applyPriceRules = (basePrice, date, priceRules = DEFAULT_PRICE_RULES) => {
    let adjustedPrice = basePrice;
    const appliedRules = [];

    // Apply seasonal rules
    const seasonRules = priceRules.filter((rule) => rule.type === "season");
    for (const rule of seasonRules) {
        if (isInSeasonalPeriod(date, rule.start, rule.end)) {
            if (rule.pct) {
                adjustedPrice *= 1 + rule.pct / 100;
                appliedRules.push({
                    type: "season",
                    name: rule.name,
                    adjustment: rule.pct,
                });
            } else if (rule.flat) {
                adjustedPrice += rule.flat;
                appliedRules.push({
                    type: "season",
                    name: rule.name,
                    adjustment: rule.flat,
                });
            }
        }
    }

    // Apply weekend rules
    if (isWeekend(date)) {
        const weekendRule = priceRules.find((rule) => rule.type === "weekend");
        if (weekendRule) {
            if (weekendRule.pct) {
                adjustedPrice *= 1 + weekendRule.pct / 100;
                appliedRules.push({
                    type: "weekend",
                    name: weekendRule.name || "Weekend Surcharge",
                    adjustment: weekendRule.pct,
                });
            } else if (weekendRule.flat) {
                adjustedPrice += weekendRule.flat;
                appliedRules.push({
                    type: "weekend",
                    name: weekendRule.name || "Weekend Surcharge",
                    adjustment: weekendRule.flat,
                });
            }
        }
    }

    return { price: Math.round(adjustedPrice * 100) / 100, appliedRules };
};

/**
 * Calculate total price for a rental period
 */
const calculateRentalPrice = (
    basePrice,
    startDate,
    endDate,
    priceRules = DEFAULT_PRICE_RULES
) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate number of nights
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
        throw new Error("End date must be after start date");
    }

    let totalPrice = 0;
    const dailyBreakdown = [];
    const allAppliedRules = [];

    // Calculate price for each day
    for (let i = 0; i < nights; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(currentDate.getDate() + i);

        const { price, appliedRules } = applyPriceRules(
            basePrice,
            currentDate,
            priceRules
        );
        totalPrice += price;

        dailyBreakdown.push({
            date: currentDate.toISOString().split("T")[0],
            price,
            appliedRules,
        });

        // Collect unique rules
        appliedRules.forEach((rule) => {
            if (!allAppliedRules.find((r) => r.name === rule.name)) {
                allAppliedRules.push(rule);
            }
        });
    }

    // Apply length-based discounts
    const lengthRules = priceRules
        .filter((rule) => rule.type === "length")
        .sort((a, b) => b.minDays - a.minDays); // Apply largest discount first

    let lengthDiscount = 0;
    let appliedLengthRule = null;

    for (const rule of lengthRules) {
        if (nights >= rule.minDays) {
            if (rule.pct) {
                lengthDiscount = totalPrice * (Math.abs(rule.pct) / 100);
                appliedLengthRule = {
                    type: "length",
                    name: rule.name,
                    adjustment: rule.pct,
                    discount: lengthDiscount,
                };
            } else if (rule.flat) {
                lengthDiscount = rule.flat;
                appliedLengthRule = {
                    type: "length",
                    name: rule.name,
                    adjustment: rule.flat,
                    discount: lengthDiscount,
                };
            }
            break; // Apply only one length discount
        }
    }

    const subtotal = Math.round(totalPrice * 100) / 100;
    const discountAmount = Math.round(lengthDiscount * 100) / 100;

    return {
        basePrice,
        nights,
        subtotal,
        lengthDiscount: discountAmount,
        appliedLengthRule,
        dailyBreakdown,
        seasonalAndWeekendRules: allAppliedRules,
    };
};

/**
 * Apply coupon discount
 */
const applyCouponDiscount = (subtotal, coupon, nights = 1) => {
    if (!coupon) return 0;

    // Check minimum days requirement
    if (coupon.minDays && nights < coupon.minDays) {
        throw new Error(
            `Coupon requires minimum ${coupon.minDays} days rental`
        );
    }

    let discount = 0;

    if (coupon.pct) {
        discount = subtotal * (coupon.pct / 100);
    } else if (coupon.flat) {
        discount = coupon.flat;
    }

    // Ensure discount doesn't exceed subtotal
    return Math.min(discount, subtotal);
};

/**
 * Calculate taxes (example: 10% tax rate)
 */
const calculateTaxes = (amount, taxRate = 0.1) => {
    return Math.round(amount * taxRate * 100) / 100;
};

/**
 * Generate complete quote with all pricing details
 */
const generateQuote = (
    car,
    startDate,
    endDate,
    coupon = null,
    priceRules = DEFAULT_PRICE_RULES
) => {
    const basePrice = car.dailyRentalPrice || car.price || 0;

    // Calculate base rental price with dynamic pricing
    const rentalCalculation = calculateRentalPrice(
        basePrice,
        startDate,
        endDate,
        priceRules
    );

    const { subtotal, nights, lengthDiscount, appliedLengthRule } =
        rentalCalculation;

    // Calculate subtotal after length discount
    const subtotalAfterLengthDiscount = subtotal - lengthDiscount;

    // Apply coupon discount
    let couponDiscount = 0;
    let couponError = null;

    if (coupon) {
        try {
            couponDiscount = applyCouponDiscount(
                subtotalAfterLengthDiscount,
                coupon,
                nights
            );
        } catch (error) {
            couponError = error.message;
        }
    }

    // Calculate amount after all discounts
    const amountAfterDiscounts = subtotalAfterLengthDiscount - couponDiscount;

    // Calculate taxes
    const taxes = calculateTaxes(amountAfterDiscounts);

    // Calculate final total
    const total = Math.round((amountAfterDiscounts + taxes) * 100) / 100;

    return {
        nightly: basePrice,
        nights,
        subtotal: Math.round(subtotal * 100) / 100,
        lengthDiscount: Math.round(lengthDiscount * 100) / 100,
        couponDiscount: Math.round(couponDiscount * 100) / 100,
        taxes: taxes,
        total: total,
        priceBreakdown: {
            baseSubtotal: Math.round(subtotal * 100) / 100,
            afterLengthDiscount:
                Math.round(subtotalAfterLengthDiscount * 100) / 100,
            afterCouponDiscount: Math.round(amountAfterDiscounts * 100) / 100,
            taxableAmount: Math.round(amountAfterDiscounts * 100) / 100,
            finalTotal: total,
        },
        appliedRules: {
            length: appliedLengthRule,
            seasonal: rentalCalculation.seasonalAndWeekendRules,
            coupon: coupon
                ? {
                      code: coupon.code,
                      discount: Math.round(couponDiscount * 100) / 100,
                      error: couponError,
                  }
                : null,
        },
        dailyBreakdown: rentalCalculation.dailyBreakdown,
    };
};

module.exports = {
    applyPriceRules,
    calculateRentalPrice,
    applyCouponDiscount,
    calculateTaxes,
    generateQuote,
    isWeekend,
    isInSeasonalPeriod,
};
