const express = require('express');

const { fetchAllTasks, updateTask, deleteTask, completeTask, createTask } = require('../controllers/TaskController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, createTask);
router.patch('/complete/:id', auth, completeTask);
router.patch('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);
router.get('/', auth, fetchAllTasks);

module.exports = router;