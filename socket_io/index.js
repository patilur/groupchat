//Attach Socket.IO to your HTTP server. Now same server handles:HTTP requests (API),WebSocket connections (real-time)
const { Server } = require("socket.io");
const socketMiddleware = require("./middleware");
const chatHandler = require("./handlers/chat");
const personalChatHandler = require("./handlers/personalChat");

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
        }
    });

    // Apply authentication middleware
    io.use(socketMiddleware);

    // Handle connections
    io.on("connection", (socket) => {
        console.log("User connected:", socket.user.name);

        // Attach chat events
        chatHandler(socket, io);


        //Add personal chat
        personalChatHandler(socket, io);

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.user.name);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.IO not initialized!");
    }
    return io;
};

module.exports = {
    initSocket,
    getIO
};


//
//"Socket.IO must be attached to the HTTP server instance, not directly to the Express app,
// because it works on top of the HTTP protocol."