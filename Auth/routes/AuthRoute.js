const express = require('express');

const { reValidateToken, resetPassword, login, signup, fetchAllUsers } = require('../controllers/AuthController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.patch('/revalidate', reValidateToken);
router.patch('/reset', auth, resetPassword);
router.get('/users', auth, fetchAllUsers);

module.exports = router;