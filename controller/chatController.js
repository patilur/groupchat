//When a user sends a message, it is first stored in the database using a REST API. 
//Then, Socket.IO is used to emit the message to all connected clients in real time. 
//The clients listen for this event and update the UI instantly.


const { Group, Users, Chat } = require('../model/index');
const { getIO } = require("../socket_io/index");
const { uploadToS3 } = require('../services/s3Service');

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

// Create a new group
const createGroup = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: "Name required" });

        // 1. Create the group record
        const group = await Group.create({
            name,
            adminId: req.user.id
        });

        // 2. Automatically add the creator to the group members (UserGroups table)
        await group.addUser(req.user.id);

        res.status(201).json({ message: "Group created", group });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get list of groups the current user belongs to
const getUserGroups = async (req, res) => {
    try {
        const user = await Users.findByPk(req.user.id, {
            include: [{ model: Group }]
        });
        res.json(user.Groups);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const addMemberToGroup = async (req, res) => {
    try {
        const { groupId, userEmail } = req.body;

        // 1. Find the group and user
        const group = await Group.findByPk(groupId);
        const userToAdd = await Users.findOne({ where: { email: userEmail } });

        if (!group || !userToAdd) {
            return res.status(404).json({ message: "Group or User not found" });
        }

        // 2. CHECK: Many-to-Many association check
        // Sequelize uses the 'UserGroups' table defined in your index.js
        const isAlreadyMember = await group.hasUser(userToAdd.id);

        if (isAlreadyMember) {
            return res.status(400).json({
                message: "This user is already a member of the group."
            });
        }

        // 3. Add the user to the through table
        await group.addUser(userToAdd.id);

        res.status(200).json({ message: "User added to group successfully" });
    } catch (err) {
        console.error("Backend Error in addMemberToGroup:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const shareMedia = async (req, res) => {
    try {
        const file = req.file; // From multer middleware
        const { roomId } = req.body;

        if (!file || !roomId) {
            return res.status(400).json({ message: "File and Room ID required" });
        }

        // 1. Upload the buffer to S3 using your service
        const fileUrl = await uploadToS3(file.buffer, file.originalname, file.mimetype);

        // 2. Save the S3 URL as a message in the database
        const chat = await Chat.create({
            message: fileUrl,
            roomId: roomId,
            userId: req.user.id
        });

        // 3. Prepare data for real-time broadcast
        const user = await Users.findByPk(req.user.id, {
            attributes: ['id', 'name']
        });

        const messageData = {
            id: chat.id,
            message: fileUrl,
            roomId: roomId,
            user: { id: user.id, name: user.name },
            isMedia: true, // Flag to help frontend render <img> tags
            createdAt: chat.createdAt
        };

        // 4. Emit via Socket.IO
        getIO().to(roomId).emit("receive_message", messageData);

        res.status(201).json({ message: "Media shared", url: fileUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
module.exports = {
    sendMessage,
    getRoomMessages,
    createGroup,
    getUserGroups,
    addMemberToGroup,
    shareMedia
};