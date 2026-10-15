const Listing = require("../../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const { cloudinary } = require("../../cloudConfig.js");

// GET /api/listings?q=&country=&minPrice=&maxPrice=&category=
module.exports.index = async (req, res) => {
    const { q, country, minPrice, maxPrice, category } = req.query;
    const filter = {};

    if (q) {
        filter.$or = [
            { title: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
        ];
    }
    if (country) filter.country = { $regex: country, $options: "i" };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const allListings = await Listing.find(filter).populate("owner", "username email");
    res.json({ success: true, count: allListings.length, listings: allListings });
};

// GET /api/listings/:id
module.exports.show = async (req, res) => {
    const listing = await Listing.findById(req.params.id)
        .populate({
            path: "reviews",
            populate: { path: "author", select: "username" },
        })
        .populate("owner", "username email");

    if (!listing) {
        return res.status(404).json({ success: false, message: "Listing not found" });
    }
    res.json({ success: true, listing });
};

// POST /api/listings  (multipart/form-data — same as existing EJS route)
module.exports.create = async (req, res) => {
    let response = await geocodingClient
        .forwardGeocode({ query: req.body.listing.location, limit: 1 })
        .send();

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    if (req.file) {
        newListing.image = { url: req.file.path, filename: req.file.filename };
    }
    newListing.geometry = response.body.features[0].geometry;

    const saved = await newListing.save();
    res.status(201).json({ success: true, message: "Listing created", listing: saved });
};

// PUT /api/listings/:id
module.exports.update = async (req, res) => {
    const { id } = req.params;
    const { listing } = req.body;

    const updateData = {
        title: listing.title,
        description: listing.description,
        price: listing.price,
        country: listing.country,
        location: listing.location,
    };

    const updated = await Listing.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });

    if (req.file) {
        // Remove old image from Cloudinary if it exists
        if (updated.image && updated.image.filename) {
            await cloudinary.uploader.destroy(updated.image.filename);
        }
        updated.image = { url: req.file.path, filename: req.file.filename };
        await updated.save();
    }

    res.json({ success: true, message: "Listing updated", listing: updated });
};

// DELETE /api/listings/:id
module.exports.destroy = async (req, res) => {
    const { id } = req.params;
    const deleted = await Listing.findByIdAndDelete(id);

    if (!deleted) {
        return res.status(404).json({ success: false, message: "Listing not found" });
    }

    // Remove image from Cloudinary
    if (deleted.image && deleted.image.filename) {
        await cloudinary.uploader.destroy(deleted.image.filename);
    }

    res.json({ success: true, message: "Listing deleted" });
};
