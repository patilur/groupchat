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
const { setSocketIO } = require('./controller/chatController');
const jwt = require("jsonwebtoken");

// Create HTTP server
const server = http.createServer(app);
//Attach Socket.IO to your HTTP server. Now same server handles:HTTP requests (API),WebSocket connections (real-time)
const io = new Server(server, {
    cors: {
        origin: "*",
    }
});
//const wss = new WebSocket.Server({ server });

//const { setWebSocketServer } = require('./controller/chatController');
//setWebSocketServer(wss);
//Pass io to controller
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
io.use(async (socket, next) => {

    try {
        const token = socket.handshake.auth.token;
        console.log("Token:", token);

        if (!token) {
            return next(new Error("Authorization token is missing"));
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decode,", decoded)
        
        if (!decoded) {
            return next(new Error("Invalid or Expired token"));
        }

        // Use await to ensure the user is found before moving to the next step
        const user = await User.findByPk(decoded.userId);

        if (!user) {
            return next(new Error("User not found"));
        }
        console.log("user,", user)
        socket.user = user;
        next();
    } catch (err) {
        return next(new Error('Authentication failed'));
    }
})

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
    console.log("User connected:", socket.user.name);

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.user.name);
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


//"Socket.IO must be attached to the HTTP server instance, not directly to the Express app,
// because it works on top of the HTTP protocol."