const Listing = require("../../models/listing");
const Review = require("../../models/review");

// POST /api/listings/:id/reviews
module.exports.create = async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        return res.status(404).json({ success: false, message: "Listing not found" });
    }

    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    await newReview.populate("author", "username");

    res.status(201).json({ success: true, message: "Review created", review: newReview });
};

// DELETE /api/listings/:id/reviews/:reviewId
module.exports.destroy = async (req, res) => {
    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    res.json({ success: true, message: "Review deleted" });
};
