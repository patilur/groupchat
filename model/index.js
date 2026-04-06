const Users = require('./signupModel');
const Chat = require('./chatModel');
const ArchivedChat = require('./archivedChatModel');
const Group = require('./groupModel');

Users.hasMany(Chat, { foreignKey: 'userId' });
Chat.belongsTo(Users, { foreignKey: 'userId' });

// Group associations
Group.belongsToMany(Users, { through: 'UserGroups' });
Users.belongsToMany(Group, { through: 'UserGroups' });

// New associations for archive
Users.hasMany(ArchivedChat, { foreignKey: 'userId' });
ArchivedChat.belongsTo(Users, { foreignKey: 'userId' });

module.exports = { Users, Chat, Group, ArchivedChat }