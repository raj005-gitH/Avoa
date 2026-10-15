if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const fs = require("fs");
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const cors = require("cors");
const PORT = process.env.PORT || 8080;

// --- Existing EJS routes (unchanged) ---
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// --- New JSON API routes ---
const apiListingRouter = require("./routes/api/listings.js");
const apiReviewRouter = require("./routes/api/reviews.js");
const apiUserRouter = require("./routes/api/users.js");
const apiPaymentRouter = require("./routes/api/payments.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

const dbUrl = process.env.ATLASDB_URL;

main()
   .then(() => {
    console.log("connected to DB");
   })
   .catch((err) => {
    console.log(err);
   });

async function main() {
    await mongoose.connect(dbUrl);
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(express.json()); // needed for API JSON request bodies
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// CORS — allow requests from the React/Vite dev server and production frontend
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true, // allow cookies (session) to be sent cross-origin
}));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    }
}

// app.get("/", (req, res) => {
//     res.send("Hi, I am root");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    // console.log(res.locals.success);
    next();
});

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "sigma-student"
//     });

//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// });

// --- JSON API routes (new — used by React frontend) ---
app.use("/api/listings", apiListingRouter);
app.use("/api/listings/:id/reviews", apiReviewRouter);
app.use("/api/auth", apiUserRouter);
app.use("/api/payment", apiPaymentRouter);

// --- Serve React Frontend (when client/dist exists, e.g. on Render) ---
const clientDistPath = path.join(__dirname, "client", "dist");
if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));

    // Client-side routing: All non-API, non-legacy page requests serve React's index.html
    app.get("*", (req, res, next) => {
        if (req.originalUrl.startsWith("/api") || req.originalUrl.startsWith("/legacy")) {
            return next();
        }
        res.sendFile(path.join(clientDistPath, "index.html"));
    });
}

// --- Legacy EJS routes (available at /legacy or if React is not built) ---
app.use("/legacy/listings", listingRouter);
app.use("/legacy/listings/:id/reviews", reviewRouter);
app.use("/legacy", userRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});

// Error handling middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    if (req.originalUrl.startsWith("/api")) {
        return res.status(statusCode).json({ success: false, error: message, message });
    }
    res.status(statusCode).render("error.ejs", { message });
});

app.listen(PORT, () => {
    console.log(`server is listening to port ${PORT}`);
});