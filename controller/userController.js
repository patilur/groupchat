const Users = require('../model/signupModel');
const db = require('../utils/db-connection');
const { Op } = require("sequelize");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv");
dotenv.config();

const generateAccessToken = (user) => {
    return jwt.sign({
        userId: user.id,
        email: user.email
    }, process.env.JWT_SECRET);
}
const addEntries = async (req, res) => {
    const { name, email, phonenumber, password } = req.body;
    console.log(req.body);
    try {
        bcrypt.hash(password, 8, async (err, hash) => {
            if (err) {
                return res.status(500).json({
                    message: "Error while hashing password"
                });
            }
            try {
                const user = await Users.create({
                    name,
                    email,
                    phonenumber,
                    password: hash
                });
                res.status(201).json({
                    message: "User created successfully",
                    data: user
                });

            } catch (err) {
                if (err.name === "SequelizeUniqueConstraintError") {
                    return res.status(400).json({
                        message: "Email or phone no already exists"
                    });
                }
                res.status(500).json({
                    message: "Unable to create user"
                });
            }

        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Something went wrong"
        });

    }
};
const login = async (req, res) => {
    console.log("LOGIN API HIT");
    const { loginId, password } = req.body;
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginId);
    const isPhone = /^[0-9]{10}$/.test(loginId);


    try {
        let user;

        if (isEmail) {
            user = await Users.findOne({ where: { email: loginId } });
        } else if (isPhone) {
            user = await Users.findOne({ where: { phonenumber: loginId } });
        } else {
            return res.status(400).json({
                message: "Invalid email or phone format"
            });
        }

        // user not found
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }
        res.status(200).json({
            message: "User login successfully",
            token: generateAccessToken(user),
            data: user
        });

    } catch (err) {
        res.status(500).json({
            message: "Something went wrong",
            error: err.message
        });
    }
}
const searchUsers = async (req, res) => {
    try {
        const { email } = req.query;

        const users = await Users.findAll({
            where: {
                email: {
                    [Op.like]: `%${email}%`
                }
            },
            attributes: ['id', 'email', 'name']
        });

        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { addEntries, login, searchUsers }