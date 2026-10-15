const Razorpay = require("razorpay");
const crypto = require("crypto");
const Listing = require("../../models/listing");
const Booking = require("../../models/booking");

// Helper to determine if keys are valid Razorpay credentials or fallback/mock
const hasValidKeys = () => {
    const key = process.env.RAZORPAY_KEY_ID;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    return (
        key &&
        secret &&
        !key.startsWith("your_") &&
        !secret.startsWith("your_") &&
        key.length > 5
    );
};

let razorpayInstance = null;
const getRazorpay = () => {
    if (!razorpayInstance && hasValidKeys()) {
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpayInstance;
};

/**
 * POST /api/payment/create-order
 * Body: { listingId, nights }
 * 
 * Flow Step 1:
 * Express calculates the exact price on the server (never trusting the client with amount),
 * creates a cryptographic order on Razorpay with an order ID, and returns the order to React.
 */
module.exports.createOrder = async (req, res) => {
    const { listingId, nights = 1 } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) {
        return res.status(404).json({ success: false, message: "Listing not found" });
    }

    const numNights = Math.max(1, Number(nights));
    const stayPrice = listing.price * numNights;
    const serviceFee = Math.round(stayPrice * 0.12); // 12% Avoa platform service fee
    const totalAmount = stayPrice + serviceFee;
    const amountInPaise = Math.round(totalAmount * 100); // 1 INR = 100 paise

    // Check if real Razorpay keys are configured
    if (hasValidKeys()) {
        try {
            const rzp = getRazorpay();
            const order = await rzp.orders.create({
                amount: amountInPaise,
                currency: "INR",
                receipt: `avoa_${listingId.toString().slice(-6)}_${Date.now()}`,
                notes: {
                    listingId: listingId.toString(),
                    listingTitle: listing.title,
                    nights: numNights.toString(),
                    userId: req.user._id.toString(),
                },
            });

            return res.json({
                success: true,
                isMock: false,
                order,
                key: process.env.RAZORPAY_KEY_ID,
                listing: {
                    id: listing._id,
                    title: listing.title,
                    pricePerNight: listing.price,
                    nights: numNights,
                    stayPrice,
                    serviceFee,
                    totalAmount,
                },
            });
        } catch (err) {
            console.error("Razorpay order creation error:", err);
            return res.status(500).json({
                success: false,
                message: err.error?.description || "Failed to initialize Razorpay order with provided keys",
            });
        }
    }

    // Demo/Sandbox fallback mode if user hasn't added live Razorpay keys yet
    const mockOrder = {
        id: `order_sandbox_${Date.now()}`,
        amount: amountInPaise,
        currency: "INR",
        receipt: `avoa_demo_${Date.now()}`,
        status: "created",
    };

    return res.json({
        success: true,
        isMock: true,
        order: mockOrder,
        key: "rzp_test_avoa_demo",
        listing: {
            id: listing._id,
            title: listing.title,
            pricePerNight: listing.price,
            nights: numNights,
            stayPrice,
            serviceFee,
            totalAmount,
        },
    });
};

/**
 * POST /api/payment/verify
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, listingId, nights }
 * 
 * Flow Step 3:
 * After the customer pays in the Razorpay checkout popup, Razorpay returns a cryptographic signature.
 * The server computes HMAC-SHA256(order_id + "|" + payment_id, key_secret) to verify authenticity.
 * If verified, the booking is recorded in MongoDB and marked as confirmed!
 */
module.exports.verifyPayment = async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        listingId,
        nights = 1,
    } = req.body;

    const isMock = razorpay_order_id?.startsWith("order_sandbox_") || !hasValidKeys();

    if (!isMock) {
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing payment verification parameters.",
            });
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed: Signature mismatch. Potential tampering detected.",
            });
        }
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
        return res.status(404).json({ success: false, message: "Listing not found" });
    }

    const numNights = Math.max(1, Number(nights));
    const stayPrice = listing.price * numNights;
    const serviceFee = Math.round(stayPrice * 0.12);
    const totalAmount = stayPrice + serviceFee;

    // Save confirmed booking into MongoDB
    const booking = new Booking({
        listing: listing._id,
        user: req.user._id,
        nights: numNights,
        totalAmount,
        razorpayOrderId: razorpay_order_id || `order_demo_${Date.now()}`,
        razorpayPaymentId: razorpay_payment_id || `pay_demo_${Date.now()}`,
        razorpaySignature: razorpay_signature || "demo_verified_signature",
        status: "confirmed",
    });

    await booking.save();
    await booking.populate("listing");

    res.json({
        success: true,
        message: "Payment verified successfully! Your booking is confirmed.",
        booking,
    });
};

/**
 * GET /api/payment/my-bookings
 * Returns all bookings for the authenticated user, sorted latest first.
 */
module.exports.getMyBookings = async (req, res) => {
    const bookings = await Booking.find({ user: req.user._id })
        .populate({
            path: "listing",
            populate: { path: "owner", select: "username email" },
        })
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        bookings,
    });
};
