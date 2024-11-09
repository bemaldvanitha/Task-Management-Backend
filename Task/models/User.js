const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db/db');

const UserType = require('./UserType');

class User extends Model {}

User.init({
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
},{
    sequelize,
    modelName: 'User',
});

UserType.hasMany(User, {
    foreignKey: 'userTypeId',
});

User.belongsTo(UserType, {
    foreignKey: 'userTypeId',
});

module.exports = User;