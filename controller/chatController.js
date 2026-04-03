const Chat = require('../model/chatModel');
const Users = require('../model/signupModel');
//const WebSocket = require('ws');

// let wss; // global reference

// // Set WebSocket server instance
// const setWebSocketServer = (serverInstance) => {
//     wss = serverInstance;
// };

let io;

const setSocketIO = (ioInstance) => {
    io = ioInstance;
};

// Send Message Controller
const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                message: "Message cannot be empty"
            });
        }

        // Save message in DB
        const chat = await Chat.create({
            message,
            userId: req.user.id,
        });

        // Fetch user info (for better response)
        const user = await Users.findByPk(req.user.id, {
            attributes: ['id', 'name']
        });

        const messageData = {
            id: chat.id,
            message: chat.message,
            user,
            createdAt: chat.createdAt
        };

        // Broadcast message via WebSocket

        if (io) {
            io.emit("newMessage", messageData);
        }
        // Send API response (ONLY ONCE, outside loop)
        res.status(201).json({
            message: "Message sent",
            data: messageData
        });

    } catch (err) {
        res.status(500).json({
            message: "Something went wrong",
            error: err.message
        });
    }
};

// Get All Messages
const getMessages = async (req, res) => {
    try {
        const messages = await Chat.findAll({
            include: {
                model: Users,
                attributes: ['id', 'name']
            },
            order: [['createdAt', 'ASC']]
        });

        res.status(200).json(messages);

    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch messages",
            error: err.message
        });
    }
};

module.exports = {
    sendMessage,
    getMessages,
    setSocketIO
};