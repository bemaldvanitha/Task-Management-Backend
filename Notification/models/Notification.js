const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db/db');

const User = require("./User");
const Task = require("./Task");

class Notification extends Model {}

Notification.init({
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    taskId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
},{
    sequelize,
    modelName: 'Notification'
});

User.hasMany(Notification, {
    foreignKey: 'userId',
});

Notification.belongsTo(User, {
    foreignKey: 'userId',
});

Task.hasMany(Notification, {
    foreignKey: 'taskId',
});

Notification.belongsTo(Task, {
    foreignKey: 'taskId',
});

module.exports = Notification;