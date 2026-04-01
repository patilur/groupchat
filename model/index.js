const Users = require('./signupModel');
const Chat = require('./chatModel');

Users.hasMany(Chat, { foreignKey: 'userId' });
Chat.belongsTo(Users, { foreignKey: 'userId' });

module.exports={Users,Chat}