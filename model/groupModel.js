const { DataTypes } = require('sequelize');
const sequelize = require('../utils/db-connection');

const Group = sequelize.define('Group', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    adminId: { type: DataTypes.INTEGER, allowNull: false }
});

module.exports = Group;