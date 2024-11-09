const express = require('express');

const { fetchAllNotificationsToUser, readNotification } = require('../controllers/NotificationController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, fetchAllNotificationsToUser);
router.patch('/:id', auth, readNotification);

module.exports = router;