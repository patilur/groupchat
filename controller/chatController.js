const Chat = require('../model/chatModel');
const Users = require('../model/signupModel');

const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                message: "Message cannot be empty"
            });
        }

        const chat = await Chat.create({
            message,
            userId: req.user.id,
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

const getMessages = async (req, res) => {
    try {
        //Fetch all chat messages along with the user who sent each message, sorted by time
        //SELECT Chats.*, Users.id, Users.name FROM Chats JOIN Users ON Chats.userId = Users.id;
        const messages = await Chat.findAll({
            include: {
                model: Users,
                attributes: ['id', 'name'] // avoid password
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
}

module.exports = { sendMessage, getMessages };