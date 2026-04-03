// socket-io/handlers/personalChat.js

module.exports = (socket, io) => {

    //Join personal room
    socket.on("join_room", (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.user.id} joined room: ${roomId}`);
    });

    //Send personal message
    socket.on("send_message", (data) => {
        const { roomId, message } = data;

        if (!roomId || !message) {
            return;
        }

        const messageData = {
            message,
            user: {
                id: socket.user.id,
                name: socket.user.name
            },
            createdAt: new Date()
        };

        //Send to only that room
        io.to(roomId).emit("receive_message", messageData);

        console.log(`Message sent to room ${roomId}`);
    });

};