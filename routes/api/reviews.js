const express = require("express");
const router = express.Router({ mergeParams: true }); // mergeParams gives access to :id from parent

const wrapAsync = require("../../utils/wrapAsync.js");
const reviewController = require("../../controllers/api/reviews.js");
const { isLoggedIn, isReviewAuthor, validateReview } = require("../../middleware.api.js");

// POST   /api/listings/:id/reviews           — add review (auth required)
// DELETE /api/listings/:id/reviews/:reviewId — delete review (author only)

router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.create));
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroy));

module.exports = router;
