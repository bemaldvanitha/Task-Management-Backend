const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db/db');

const Status = require('./Status');
const Priority = require('./Priority');
const User = require('./User');

class Task extends Model {}

Task.init({
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    statusId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    priorityId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    assignedId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
},{
    sequelize,
    modelName: 'Task'
});

Status.hasMany(Task, {
    foreignKey: 'statusId',
});

Task.belongsTo(Status, {
    foreignKey: 'statusId',
});

Priority.hasMany(Task, {
    foreignKey: 'priorityId',
});

Task.belongsTo(Priority, {
    foreignKey: 'priorityId',
});

User.hasMany(Task, {
    foreignKey: 'assignedId',
});

Task.belongsTo(User, {
    foreignKey: 'assignedId',
});

module.exports = Task;