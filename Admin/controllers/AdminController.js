const { Sequelize, Op } = require('sequelize');
const { startOfDay, endOfDay } = require('date-fns');

const User = require('../models/User');
const Status = require('../models/Status');
const Priority = require('../models/Priority');
const Task = require('../models/Task');

const fetchAdminStats = async (req, res) => {
    try {
        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());

        const totalTasks = await Task.count({
            include: [
                {
                    model: Status,
                    where: {
                        status: {
                            [Op.ne]: 'Deleted'
                        }
                    }
                }
            ]
        });

        const completedTasks = await Task.count({
            include: [
                {
                    model: Status,
                    where: {
                        status: {
                            [Op.eq]: 'Completed'
                        }
                    }
                }
            ]
        });

        const totalTasksDueToday = await Task.count({
            where: {
                dueDate: {
                    [Op.between]: [todayStart, todayEnd]
                }
            },
            include: [
                {
                    model: Status,
                    where: {
                        status: {
                            [Op.ne]: 'Deleted'
                        }
                    }
                }
            ]
        });

        const totalOverdueTasks = await Task.count({
            where: {
                dueDate: {
                    [Op.lt]: todayStart,
                }
            },
            include: [
                {
                    model: Status,
                    where: {
                        status: {
                            [Op.ne]: 'Deleted'
                        }
                    }
                }
            ]
        });

        const tasksGroupedByPriority = await Task.findAll({
            attributes: [
                'priorityId',
                [Sequelize.fn('COUNT', Sequelize.col('priorityId')), 'taskCount']
            ],
            include: [
                {
                    model: Priority,
                    attributes: ['priority'],
                },
                {
                    model: Status,
                    where: {
                        status: {
                            [Op.ne]: 'Deleted'
                        }
                    },
                    attributes: []
                }
            ],
            group: ['priorityId'],
            order: [[Sequelize.col('priorityId'), 'ASC']],
        });

        const resultByPriority = tasksGroupedByPriority.map(task => ({
            priority: task.Priority.priority,
            taskCount: task.dataValues.taskCount,
        }));

        const tasksGroupedByUser = await Task.findAll({
            attributes: [
                'assignedId',
                [Sequelize.fn('COUNT', Sequelize.col('assignedId')), 'taskCount']
            ],
            include: [
                {
                    model: User,
                    attributes: ['userName'],
                },
                {
                    model: Status,
                    where: {
                        status: {
                            [Op.ne]: 'Deleted'
                        }
                    },
                    attributes: []
                }
            ],
            group: ['assignedId'],
            order: [[Sequelize.col('assignedId'), 'ASC']],
        });

        const resultByUser = tasksGroupedByUser.map(task => ({
            userName: task.User.userName,
            taskCount: task.dataValues.taskCount,
        }));

        return res.status(200).json({
            message: 'Admin stats fetched',
            totalTasks: totalTasks,
            completedTasks: completedTasks,
            totalDueTasks: totalTasksDueToday,
            totalOverdueTasks: totalOverdueTasks,
            tasksByPriority: resultByPriority,
            tasksByUser: resultByUser
        })
    }catch(err) {
        console.error(err);
        return res.status(500).json({ message: 'Something went wrong during fetch admin stats' });
    }
}

module.exports = {
    fetchAdminStats
}