//starting app.js checking jenkins
const express = require('express');
const compression = require('compression');
const logger = require('./utils/logger');
const morgan = require('morgan')
const db = require('./utils/db-connection')
const fs = require('fs');
const app = express();
const path = require('path');
const cors = require('cors');
//const WebSocket = require('ws');
const http = require('http');
const userRoute = require('./routes/userRoutes')
const chatRoutes = require('./routes/chatRoutes');
const { User, Chat } = require('./model/index');
const dotenv = require("dotenv");
dotenv.config();
const { Server } = require("socket.io");


// Create WebSocket server
const io = new Server(server, {
    cors: {
        origin: "*",
    }
});
//const wss = new WebSocket.Server({ server });

//const { setWebSocketServer } = require('./controller/chatController');
//setWebSocketServer(wss);
const { setSocketIO } = require('./controller/chatController');
setSocketIO(io);

// Logging Middleware
app.use((req, res, next) => {
    logger.info(`${req.method} request to ${req.url}`);
    next();
});


const accesslogstream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(compression());
app.use(morgan('combined', { stream: accesslogstream }));
app.use(express.json());
app.use(cors());


// Routes

app.use('/user', userRoute);
app.use('/chat', chatRoutes);

app.use(express.static(path.join(__dirname, 'public')));

// Signup Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'signup.html'));
});

// Signin Page
app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'signin.html'));
});

//home page
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'view', 'home.html'));
});




// 404 Handler (ALWAYS LAST)
app.use((req, res) => {
    res.status(404).send("Page not found");
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// wss.on('connection', (ws, req) => {
//     console.log('New client connected');

//     ws.on('message', (message) => {
//         console.log('Received:', message.toString());

//         // Broadcast to all clients
//         wss.clients.forEach((client) => {
//             if (client.readyState === WebSocket.OPEN) {
//                 client.send(message.toString());
//             }
//         });
//     });

//     ws.on('close', () => {
//         console.log('Client disconnected');
//     });
// });

db.sync({ force: false }).then(() => {
    server.listen(process.env.PORT || 3000, () => {
        console.log('Server running');
    });
}).catch((err) => {
    console.log(err);
})
