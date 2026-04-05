//When a user sends a message, it is first stored in the database using a REST API. 
//Then, Socket.IO is used to emit the message to all connected clients in real time. 
//The clients listen for this event and update the UI instantly.

const Chat = require('../model/chatModel');
const Users = require('../model/signupModel');
const { getIO } = require("../socket_io/index");

// Send Message Controller
const sendMessage = async (req, res) => {
    try {
        const { message, roomId } = req.body;
        const io = getIO();

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

        const user = await Users.findByPk(req.user.id, {
            attributes: ['id', 'name']
        });

        const messageData = {
            id: chat.id,
            message: chat.message,
            user,
            createdAt: chat.createdAt
        };

        //MAIN FIX
        if (roomId) {
            //send only to room
            io.to(roomId).emit("receive_message", messageData);
            console.log("Room message:", roomId);
        } else {
            //global chat
            io.emit("receive_message", messageData);
            console.log("Global message");
        }

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

};