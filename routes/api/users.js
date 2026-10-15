const express = require("express");
const router = express.Router();
const passport = require("passport");

const wrapAsync = require("../../utils/wrapAsync.js");
const userController = require("../../controllers/api/users.js");
const { isLoggedIn } = require("../../middleware.api.js");

// POST /api/auth/signup
router.post("/signup", wrapAsync(userController.signup));

// POST /api/auth/login  — passport authenticates, then controller sends JSON
router.post(
    "/login",
    passport.authenticate("local", {
        failWithError: true,       // throws an error instead of redirecting
        session: true,             // keep sessions so cookie auth works with React
    }),
    userController.login,
    // Error handler for failed passport auth
    (err, req, res, next) => {
        res.status(401).json({ success: false, message: "Invalid username or password" });
    }
);

// GET /api/auth/logout
router.get("/logout", isLoggedIn, userController.logout);

// GET /api/auth/me  — check current session (used by React on load)
router.get("/me", userController.me);

module.exports = router;
