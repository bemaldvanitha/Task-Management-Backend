const express = require('express');

const { fetchAdminStats } = require('../controllers/AdminController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, fetchAdminStats);

module.exports = router;