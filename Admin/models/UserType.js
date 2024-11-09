const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db/db');

class UserType extends Model {}

UserType.init({
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    }
},{
    sequelize,
    modelName: 'UserType'
});

module.exports = UserType;