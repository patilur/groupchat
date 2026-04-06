const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db-connection');

const ArchivedChat = sequelize.define('ArchivedChat', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    roomId: {
        type: DataTypes.STRING,
        allowNull: false
    }

});

module.exports = ArchivedChat;