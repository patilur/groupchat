module.exports = (socket, io) => {

    socket.on("join_room", (roomId) => {
        socket.join(roomId);

        // store email in socket
        socket.email = roomId;

        console.log(`User ${socket.user.id} joined room: ${roomId}`);
    });

    socket.on("send_message", (data) => {
        console.log("DATA RECEIVED:", data);
        const { roomId, message } = data;

        if (!message) return;

        const messageData = {
            message,
            user: {
                id: socket.user.id,
                name: socket.user.name,
                email: socket.email || "global"
            },
            createdAt: new Date()
        };

        if (roomId) {
            io.to(roomId).emit("receive_message", messageData);
        } else {
            io.emit("receive_message", messageData);
        }
    });
};