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
const userRoute = require('./routes/userRoutes')
//const { User, Expense, Payment, ForgotPassword, FileDownload } = require('./model/index');
const dotenv = require("dotenv");
dotenv.config();

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

db.sync({ force: false }).then(() => {
    app.listen(process.env.PORT || 3000, (err) => {
        console.log('Server running')
        //console.log("Loaded Key:", process.env.GEMINI_API_KEY ? "Exists" : "Missing");
    })
}).catch((err) => {
    console.log(err);
})
