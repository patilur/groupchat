const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db-connection');

const Chat = sequelize.define('Chat', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

module.exports = Chat;