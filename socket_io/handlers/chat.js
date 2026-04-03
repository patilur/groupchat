module.exports = (socket, io) => {

    // Example: Receive message via socket (optional future)
    socket.on("sendMessage", (data) => {
        console.log("Message from:", socket.user.id);

        // Broadcast to all users
        io.emit("newMessage", {
            message: data.message,
            user: {
                id: socket.user.id,
                name: socket.user.name
            },
            createdAt: new Date()
        });
    });

};