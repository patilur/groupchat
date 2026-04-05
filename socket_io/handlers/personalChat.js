const { Chat, Users } = require('../../model/index');

module.exports = (socket, io) => {

    socket.on("join_room", (roomId, otherUserEmail) => {
        socket.join(roomId);
        console.log(`${socket.user.name} joined ${roomId}`);

        //Send alert to OTHER user
        socket.to(roomId).emit("user_connected", {
            message: `${socket.user.name} connected to ${otherUserEmail}`
        });
    });


    socket.on("send_message", async (data) => {
        try {
            const { roomId, message } = data;

            if (!roomId || !message) return;

            // ✅ Save to DB
            const chat = await Chat.create({
                message,
                roomId,
                userId: socket.user.id
            });

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

            io.to(roomId).emit("receive_message", messageData);

        } catch (err) {
            console.log(err.message);
        }
    });
};