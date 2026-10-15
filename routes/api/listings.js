const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../../cloudConfig.js");
const upload = multer({ storage });

const wrapAsync = require("../../utils/wrapAsync.js");
const listingController = require("../../controllers/api/listings.js");
const { isLoggedIn, isOwner, validateListing } = require("../../middleware.api.js");

// GET  /api/listings         — list all (with optional search & filters)
// POST /api/listings         — create new listing (auth required)
router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.create)
    );

// GET    /api/listings/:id   — show single listing
// PUT    /api/listings/:id   — update listing (owner only)
// DELETE /api/listings/:id   — delete listing (owner only)
router
    .route("/:id")
    .get(wrapAsync(listingController.show))
    .put(
        isLoggedIn,
        isOwner,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.update)
    )
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.destroy)
    );

module.exports = router;
