const User = require("../../models/user");

// POST /api/auth/signup
module.exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);

        // Auto-login after signup
        req.login(registeredUser, (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: err.message });
            }
            res.status(201).json({
                success: true,
                message: "Welcome to Avoa!",
                user: { id: registeredUser._id, username: registeredUser.username, email: registeredUser.email },
            });
        });
    } catch (e) {
        res.status(400).json({ success: false, message: e.message });
    }
};

// POST /api/auth/login  — handled by passport.authenticate() in the route
module.exports.login = (req, res) => {
    res.json({
        success: true,
        message: "Welcome back to Avoa!",
        user: {
            id: req.user._id,
            username: req.user.username,
            email: req.user.email,
        },
    });
};

// GET /api/auth/logout
module.exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true, message: "Logged out successfully" });
    });
};

// GET /api/auth/me  — returns current session user
module.exports.me = (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, message: "Not authenticated", user: null });
    }
    res.json({
        success: true,
        user: {
            id: req.user._id,
            username: req.user.username,
            email: req.user.email,
        },
    });
};
