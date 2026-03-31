const jwt = require('jsonwebtoken');
const User = require('../model/signupModel');
const dotenv = require("dotenv");
dotenv.config();

const authenticate = async (req, res, next) => { // Added async
    try {
        const token = req.header('Authorization');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Use await to ensure the user is found before moving to the next step
        const user = await User.findByPk(decoded.userId);

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Authentication failed' });
    }
}

module.exports = { authenticate };

