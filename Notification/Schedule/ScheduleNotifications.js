const cron = require('node-cron');

const { createNotifications } = require('../controllers/NotificationController');

cron.schedule('0 * * * *', async () => {
    console.log('Running cron job to create notifications...');
    await createNotifications();
});