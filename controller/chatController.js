//When a user sends a message, it is first stored in the database using a REST API. 
//Then, Socket.IO is used to emit the message to all connected clients in real time. 
//The clients listen for this event and update the UI instantly.

const Chat = require('../model/chatModel');
const Users = require('../model/signupModel');
const { getIO } = require("../socket_io/index");

const sendMessage = async (req, res) => {
    try {
        const { message, roomId } = req.body;
        const io = getIO();

        if (!message || !roomId) {
            return res.status(400).json({
                message: "Message & roomId required"
            });
        }

        //Save with roomId
        const chat = await Chat.create({
            message,
            roomId,
            userId: req.user.id,
        });

        const user = await Users.findByPk(req.user.id, {
            attributes: ['id', 'name', 'email']
        });

        const messageData = {
            id: chat.id,
            message,
            roomId,
            user,
            createdAt: chat.createdAt
        };

        //Emit ONLY to room
        io.to(roomId).emit("receive_message", messageData);

        res.status(201).json({
            message: "Message sent",
            data: messageData
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};

// Get messages by room
const getRoomMessages = async (req, res) => {
    try {
        const { roomId } = req.params;

        const messages = await Chat.findAll({
            where: { roomId },
            include: {
                model: Users,
                attributes: ['id', 'name', 'email']
            },
            order: [['createdAt', 'ASC']]
        });

        res.json(messages);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    sendMessage,
    getRoomMessages
};