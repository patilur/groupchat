const Chat = require('../model/chatModel');

const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.userId; // from JWT

        if (!message) {
            return res.status(400).json({
                message: "Message cannot be empty"
            });
        }

        const chat = await Chat.create({
            message,
            userId
        });

        res.status(201).json({
            message: "Message sent",
            data: chat
        });

    } catch (err) {
        res.status(500).json({
            message: "Something went wrong",
            error: err.message
        });
    }
};

module.exports = { sendMessage };