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
const { initSocket } = require("./socket_io");
const http = require('http');
const userRoute = require('./routes/userRoutes')
const chatRoutes = require('./routes/chatRoutes');
const { Users, Chat, Group, ArchivedChat } = require('./model/index');
const cron = require('node-cron');
const { archiveOldChats } = require('./services/archiveService');
const dotenv = require("dotenv");
dotenv.config();

// Create HTTP server
const server = http.createServer(app);
// Initialize socket
initSocket(server);

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
// Schedule to run every night at 00:00 (Midnight)
cron.schedule('0 0 * * *', () => {
    console.log('Running nightly chat archival...');
    archiveOldChats();
});
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
db.sync({ force: false }).then(() => {
    server.listen(process.env.PORT || 3000, () => {
        console.log('Server running');
    });
}).catch((err) => {
    console.log(err);
})

