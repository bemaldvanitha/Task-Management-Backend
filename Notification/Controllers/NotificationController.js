const { Sequelize, Op } = require('sequelize');
const { startOfDay, endOfDay, addHours } = require('date-fns');

const Status = require('../models/Status');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

const createNotifications = async () => {
    try {
        const now = new Date();
        const next24Hours = addHours(now, 24);

        const tasks = await Task.findAll({
            attributes: ['title', 'assignedId', 'id'],
            include: [
                {
                    model: Status,
                    where: {
                        status: {
                            [Op.ne]: 'Deleted'
                        }
                    }
                }
            ],
            where: {
                dueDate: {
                    [Op.between]: [now, next24Hours]
                }
            }
        });

        for(let task of tasks){
            const isNotificationExist = await Notification.findOne({
                where: {
                    taskId: task?.id
                }
            });

            if(!isNotificationExist){
                await Notification.create({
                    title: `Task due in next 24 hours`,
                    description: `Task ${task?.title}`,
                    read: false,
                    userId: task?.assignedId,
                    taskId: task.id
                });
            }
        }

        console.log('Notification created successfully');
    }catch(err) {
        console.log(err, 'Something went wrong during adding notifications');
    }
}

const readNotification = async (req, res) => {
    try {
        const notificationId = req.params.id;

        await Notification.update({
            read: true
        },{
            where: {
                id: notificationId
            }
        })

        return res.status(200).json({ message: 'notification mark as read successfully' });
    }catch(err) {
        console.error(err);
        return res.status(500).json({ message: 'Something went wrong during notification mark as read' });
    }
}

const fetchAllNotificationsToUser = async (req, res) => {
    try {
        const { id: userId } = req.body;

        const notifications = await Notification.findAll({
            where: {
                userId: userId
            },
            attributes: ['id', 'title', 'description', 'read']
        });

        const allNotifications = [];

        for(let notification of notifications){
            allNotifications.push({
                id: notification.id,
                title: notification.title,
                description: notification.description,
                read: notification.read
            });
        }

        return res.status(200).json({ message: 'notification fetch successfully',
            notifications: allNotifications });
    }catch(err) {
        console.error(err);
        return res.status(500).json({ message: 'Something went wrong during notification fetch' });
    }
}

module.exports = {
    createNotifications,
    readNotification,
    fetchAllNotificationsToUser
}