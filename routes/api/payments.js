const express = require("express");
const router = express.Router();

const wrapAsync = require("../../utils/wrapAsync.js");
const paymentController = require("../../controllers/api/payments.js");
const { isLoggedIn } = require("../../middleware.api.js");

// POST /api/payment/create-order
// Body: { listingId: string, nights: number }
router.post("/create-order", isLoggedIn, wrapAsync(paymentController.createOrder));

// POST /api/payment/verify
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, listingId, nights }
router.post("/verify", isLoggedIn, wrapAsync(paymentController.verifyPayment));

// GET /api/payment/my-bookings
// Returns all bookings made by current session user
router.get("/my-bookings", isLoggedIn, wrapAsync(paymentController.getMyBookings));

module.exports = router;
