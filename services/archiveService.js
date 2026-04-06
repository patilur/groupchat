const { Chat, ArchivedChat } = require('../model/index');
const { Op } = require('sequelize');

async function archiveOldChats() {
    try {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // 1. Find messages older than 24 hours
        const oldMessages = await Chat.findAll({
            where: {
                createdAt: { [Op.lt]: oneDayAgo }
            }
        });

        if (oldMessages.length > 0) {
            // 2. Prepare data (Sequelize includes the associated 'userId' in the JSON)
            const messagesToArchive = oldMessages.map(msg => {
                const data = msg.toJSON();
                // Ensure we don't try to let S3 URLs or other IDs conflict
                delete data.id;
                return data;
            });

            // 3. Bulk insert into Archive table
            await ArchivedChat.bulkCreate(messagesToArchive);

            // 4. Delete from main Chat table
            await Chat.destroy({
                where: {
                    createdAt: { [Op.lt]: oneDayAgo }
                }
            });

            console.log(`Archived ${oldMessages.length} messages.`);
        }
    } catch (err) {
        console.error('Archive Job Failed:', err);
    }
}

module.exports = { archiveOldChats };