const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// Ensure environment variables are loaded
dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DIALECT,
        // Production improvement: pool helps manage multiple connections
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        // Only log queries in development mode
        logging: process.env.NODE_ENV === 'development' ? console.log : false
    }
);

module.exports = sequelize;