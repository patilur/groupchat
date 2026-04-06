const Users = require('./signupModel');
const Chat = require('./chatModel');
const Group = require('./groupModel');

Users.hasMany(Chat, { foreignKey: 'userId' });
Chat.belongsTo(Users, { foreignKey: 'userId' });

// Group associations
Group.belongsToMany(Users, { through: 'UserGroups' });
Users.belongsToMany(Group, { through: 'UserGroups' });

module.exports = { Users, Chat, Group }