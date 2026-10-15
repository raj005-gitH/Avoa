const Listing = require("./models/listing");
const Review = require("./models/review");
const { listingSchema, reviewSchema } = require("./schema.js");

/**
 * Rejects request with 401 JSON if the user is not logged in.
 * Used as a guard for all protected API routes.
 */
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, message: "You must be logged in" });
    }
    next();
};

/**
 * Checks that the logged-in user is the owner of the listing.
 */
module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        return res.status(404).json({ success: false, message: "Listing not found" });
    }
    if (!listing.owner.equals(req.user._id)) {
        return res.status(403).json({ success: false, message: "You are not the owner of this listing" });
    }
    next();
};

/**
 * Checks that the logged-in user is the author of the review.
 */
module.exports.isReviewAuthor = async (req, res, next) => {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);

    if (!review) {
        return res.status(404).json({ success: false, message: "Review not found" });
    }
    if (!review.author.equals(req.user._id)) {
        return res.status(403).json({ success: false, message: "You are not the author of this review" });
    }
    next();
};

/**
 * Validates listing body against Joi schema — returns 400 JSON on failure.
 */
module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(", ");
        return res.status(400).json({ success: false, message: msg });
    }
    next();
};

/**
 * Validates review body against Joi schema — returns 400 JSON on failure.
 */
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(", ");
        return res.status(400).json({ success: false, message: msg });
    }
    next();
};
