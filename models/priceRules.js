/**
 * Price Rules Model
 * Defines pricing rule structures and validation
 */

/**
 * Price Rule Types:
 * - season: Seasonal pricing (summer, winter, holidays)
 * - weekend: Weekend surcharges (Friday-Sunday)
 * - length: Discount based on rental duration
 */

/**
 * Sample Price Rules:
 *
 * Season Rule Example:
 * {
 *   type: 'season',
 *   name: 'Summer Peak Season',
 *   start: '2025-06-01',
 *   end: '2025-08-31',
 *   pct: 30  // 30% increase
 * }
 *
 * Weekend Rule Example:
 * {
 *   type: 'weekend',
 *   name: 'Weekend Surcharge',
 *   pct: 15  // 15% increase on weekends
 * }
 *
 * Length Discount Example:
 * {
 *   type: 'length',
 *   name: 'Weekly Discount',
 *   minDays: 7,
 *   pct: -10,  // 10% discount for 7+ days
 *   flat: null
 * }
 */

const DEFAULT_PRICE_RULES = [
    {
        type: "season",
        name: "Summer Peak Season",
        start: "2025-06-01",
        end: "2025-08-31",
        pct: 30,
    },
    {
        type: "season",
        name: "Holiday Season",
        start: "2025-12-20",
        end: "2026-01-05",
        pct: 40,
    },
    {
        type: "weekend",
        name: "Weekend Surcharge",
        pct: 15,
    },
    {
        type: "length",
        name: "Weekly Discount",
        minDays: 7,
        pct: -10,
    },
    {
        type: "length",
        name: "Monthly Discount",
        minDays: 30,
        pct: -20,
    },
];

/**
 * Validate price rule structure
 */
const validatePriceRule = (rule) => {
    if (!rule.type || !["season", "weekend", "length"].includes(rule.type)) {
        throw new Error("Invalid price rule type");
    }

    if (rule.type === "season") {
        if (!rule.start || !rule.end) {
            throw new Error("Season rules require start and end dates");
        }
    }

    if (rule.type === "length") {
        if (!rule.minDays) {
            throw new Error("Length rules require minDays");
        }
    }

    if (!rule.pct && !rule.flat) {
        throw new Error("Price rule must have either pct or flat value");
    }

    return true;
};

module.exports = {
    DEFAULT_PRICE_RULES,
    validatePriceRule,
};
