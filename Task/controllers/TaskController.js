const { Sequelize, Op } = require('sequelize');

const User = require('../models/User');
const UserType = require('../models/UserType');
const Status = require('../models/Status');
const Action = require('../models/Action');
const Priority = require('../models/Priority');
const Task = require('../models/Task');
const AuditLog = require('../models/AuditLog');
const AuditLogDetail = require('../models/AuditLogDetail');
const Field = require('../models/Field');

const createTask = async (req, res) => {
    try {
        const { title, description, priority, dueDate, id: userId, assignedId } = req.body;

        const [createdStatus, isStatusCreated] = await Status.findOrCreate({
            where: {
                status: 'Pending'
            }
        });

        const [createdPriority, isPriorityCreated] = await Priority.findOrCreate({
            where: {
                priority: priority
            }
        });

        const task = await Task.create({
            title: title,
            description: description,
            statusId: createdStatus.id,
            priorityId: createdPriority.id,
            dueDate: dueDate,
            assignedId: assignedId
        });

        const [createdAction, isActionCreated] = await Action.findOrCreate({
            where: {
                action: 'Created'
            }
        });

        await AuditLog.create({
            taskId: task.id,
            actionId: createdAction.id,
            userId: userId
        });

        return res.status(201).json({ message: 'Task successfully created' });
    }catch(err) {
        console.error(err);
        return res.status(500).json({ message: 'Something went wrong during create task' });
    }
}

const completeTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const { id: userId } = req.body;

        const task = await Task.findByPk(taskId);

        if(!task){
            return res.status(404).json({ message: 'Task not found' });
        }

        const [createdStatus, isStatusCreated] = await Status.findOrCreate({
            where: {
                status: 'Completed'
            }
        });

        await Task.update({
            statusId: createdStatus.id
        },{
            where: {
                id: taskId
            }
        });

        const [createdField, isFieldCreated] = await Field.findOrCreate({
            where: {
                field: 'Status'
            }
        });

        const [createdAction, isActionCreated] = await Action.findOrCreate({
            where: {
                action: 'Completed'
            }
        });

        const auditLog = await AuditLog.create({
            taskId: taskId,
            actionId: createdAction.id,
            userId: userId
        });

        await AuditLogDetail.create({
            auditLogId: auditLog.id,
            fieldId: createdField.id,
            oldValue: 'Pending',
            newValue: 'Completed'
        });

        return res.status(201).json({ message: 'Task successfully completed' });
    }catch(err) {
        console.error(err);
        return res.status(500).json({ message: 'Something went wrong during completing task' });
    }
}

const deleteTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const { id: userId } = req.body;

        const task = await Task.findByPk(taskId,{
            include: [
                {
                    model: Status,
                    attributes: ['status']
                }
            ]
        });

        if(!task){
            return res.status(404).json({ message: 'Task not found' });
        }

        const [createdStatus, isStatusCreated] = await Status.findOrCreate({
            where: {
                status: 'Deleted'
            }
        });

        await Task.update({
            statusId: createdStatus.id
        },{
            where: {
                id: taskId
            }
        });

        const [createdField, isFieldCreated] = await Field.findOrCreate({
            where: {
                field: 'Status'
            }
        });

        const [createdAction, isActionCreated] = await Action.findOrCreate({
            where: {
                action: 'Deleted'
            }
        });

        const auditLog = await AuditLog.create({
            taskId: taskId,
            actionId: createdAction.id,
            userId: userId
        });

        await AuditLogDetail.create({
            auditLogId: auditLog.id,
            fieldId: createdField.id,
            oldValue: task.Status.status,
            newValue: 'Deleted'
        });

        return res.status(201).json({ message: 'Task deletion completed' });
    }catch(err) {
        console.error(err);
        return res.status(500).json({ message: 'Something went wrong during deletion task' });
    }
}

const updateTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const { id: userId, title, description, priority, dueDate } = req.body;

        const task = await Task.findByPk(taskId, {
            attributes: ['title', 'description', 'dueDate'],
            include: [
                {
                    model: Priority,
                    attributes: ['priority']
                }
            ]
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const [createdAction] = await Action.findOrCreate({
            where: { action: 'Updated' }
        });

        const auditLog = await AuditLog.create({
            taskId: taskId,
            actionId: createdAction.id,
            userId: userId
        });

        const fieldsToCheck = [
            { field: 'Title', oldValue: task.title, newValue: title },
            { field: 'Description', oldValue: task.description, newValue: description },
            { field: 'DueDate', oldValue: task.dueDate, newValue: dueDate },
            { field: 'Priority', oldValue: task.Priority.priority, newValue: priority }
        ];

        for (const { field, oldValue, newValue } of fieldsToCheck) {
            if (oldValue !== newValue) {
                const [createdField] = await Field.findOrCreate({
                    where: { field }
                });

                await AuditLogDetail.create({
                    auditLogId: auditLog.id,
                    fieldId: createdField.id,
                    oldValue: oldValue.toString(),
                    newValue: newValue.toString()
                });
            }
        }

        const [createdPriority] = await Priority.findOrCreate({
            where: { priority }
        });

        await Task.update({
            title: title,
            description: description,
            priorityId: createdPriority.id,
            dueDate: dueDate
        }, {
            where: { id: taskId }
        });

        return res.status(200).json({ message: 'Task update completed' });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Something went wrong during the update task' });
    }
};

const fetchAllTasks = async (req, res) => {
    try {
        const { status, priority, sortBy, page = 1, pageSize = 10, search } = req.query;
        const { id: userId, type } = req.body;

        const statusWhereConditions = {
            status: {
                [Op.ne]: 'Deleted'
            }
        };

        if (status) {
            statusWhereConditions.status = status;
        }

        const userWhereConditions = {};

        if(type === 'User'){
            userWhereConditions.id = userId;
        }

        const priorityWhereConditions = priority ? {
            priority: priority
        } : {};

        const orderConditions = [];
        if (sortBy === 'dueDate') {
            orderConditions.push(['dueDate', 'ASC']);
        } else if (sortBy === 'priority') {
            orderConditions.push([Priority, 'priority', 'ASC']);
        }

        const offset = (page - 1) * pageSize;
        const limit = parseInt(pageSize.toString(), 10);

        let searchConditions = {};
        if (search) {
            searchConditions = {
                [Op.or]: [
                    {
                        title: {
                            [Op.like]: `%${search}%`
                        }
                    },
                    {
                        description: {
                            [Op.like]: `%${search}%`
                        }
                    }
                ]
            };
        }

        const allTasks = await Task.findAll({
            attributes: ['title', 'description', 'dueDate', 'id'],
            include: [
                {
                    model: Status,
                    attributes: ['status'],
                    where: statusWhereConditions,
                },
                {
                    model: Priority,
                    attributes: ['priority'],
                    where: priorityWhereConditions,
                },
                {
                    model: User,
                    attributes: ['userName', 'id'],
                    where: userWhereConditions
                },
                {
                    model: AuditLog,
                    include: [
                        {
                            model: Action,
                            attributes: ['action']
                        },
                        {
                            model: User,
                            attributes: ['userName']
                        },
                        {
                            model: AuditLogDetail,
                            attributes: ['oldValue', 'newValue'],
                            include: [
                                {
                                    model: Field,
                                    attributes: ['field']
                                }
                            ]
                        }
                    ]
                }
            ],
            order: orderConditions,
            offset: offset,
            limit: limit,
            where: searchConditions
        });

        const transformedTasks = [];

        for (const task of allTasks) {
            const transformedTask = {
                id: task.id,
                title: task.title,
                description: task.description,
                dueDate: task.dueDate,
                priority: task.Priority.priority,
                status: task.Status.status,
                assignedTo: task.User.userName,
                userId: task.User.id,
                auditLogs: []
            };

            for (const auditLog of task.AuditLogs) {
                const transformedAuditLog = {
                    action: auditLog.Action.action,
                    performedBy: auditLog.User.userName,
                    details: []
                };

                for (const detail of auditLog.AuditLogDetails) {
                    const transformedDetail = {
                        field: detail.Field.field,
                        oldValue: detail.oldValue,
                        newValue: detail.newValue
                    };
                    transformedAuditLog.details.push(transformedDetail);
                }

                transformedTask.auditLogs.push(transformedAuditLog);
            }

            transformedTasks.push(transformedTask);
        }

        return res.status(200).json({
            tasks: transformedTasks,
            page,
            pageSize,
            totalPages: Math.ceil(allTasks.length / pageSize),
        });

    }catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Something went wrong during the update task' });
    }
}


module.exports = {
    createTask,
    completeTask,
    deleteTask,
    updateTask,
    fetchAllTasks
}