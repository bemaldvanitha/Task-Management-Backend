const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db/db');

const Task = require('./Task');
const Action = require('./Action');
const User = require('./User');

class AuditLog extends Model {}

AuditLog.init({
    taskId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    actionId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
},{
    sequelize,
    modelName: 'AuditLog'
});

Task.hasMany(AuditLog, {
    foreignKey: 'taskId',
});

AuditLog.belongsTo(Task, {
    foreignKey: 'taskId',
});

Action.hasMany(AuditLog, {
    foreignKey: 'actionId',
});

AuditLog.belongsTo(Action, {
    foreignKey: 'actionId',
});

User.hasMany(AuditLog, {
    foreignKey: 'userId',
});

AuditLog.belongsTo(User, {
    foreignKey: 'userId',
});

module.exports = AuditLog;