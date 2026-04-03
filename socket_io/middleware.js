const { Users, Chat } = require('../model/index');
const jwt = require("jsonwebtoken");

module.exports = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error("Authorization token is missing"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await Users.findByPk(decoded.userId);

        if (!user) {
            return next(new Error("User not found"));
        }

        socket.user = user;
        next();

    } catch (err) {
        console.log("Socket Auth Error:", err.message);
        return next(new Error("Authentication failed"));
    }
};