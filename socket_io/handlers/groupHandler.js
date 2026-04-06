const { Chat, Users, Group } = require('../../model/index');

module.exports = (socket, io) => {

    /**
     * Join Room Event
     * Handles both personal (email_email) and group (group_id) rooms
     */
    socket.on("join_room", (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.user.name} joined room: ${roomId}`);

        // Notify other users in the room
        socket.to(roomId).emit("user_connected", {
            message: `${socket.user.name} joined the chat.`
        });
    });

    /**
     * Unified Send Message Event
     * Refactored to use Acknowledgments for better reliability
     */
    socket.on("send_message", async (data, callback) => {
        try {
            const { message, roomId, type } = data;

            if (!message || !roomId) {
                return callback({ status: "error", message: "Invalid payload" });
            }

            // 1. Persist message to database
            const chat = await Chat.create({
                message,
                roomId, // Consistently handles group_1 or userA_userB
                userId: socket.user.id,
            });

            // 2. Format data for the frontend
            const messageData = {
                id: chat.id,
                message,
                roomId,
                user: {
                    id: socket.user.id,
                    name: socket.user.name,
                    email: socket.user.email
                },
                createdAt: chat.createdAt
            };

            // 3. Broadcast to everyone in the room
            io.to(roomId).emit("receive_message", messageData);

            // 4. Send success acknowledgment back to the sender
            if (callback) callback({ status: "ok" });

        } catch (err) {
            console.error("Group Handler Error:", err.message);
            if (callback) callback({ status: "error", message: "Database failure" });
        }
    });
};