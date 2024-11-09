const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db/db');

class Status extends Model {}

Status.init({
    status: {
        type: DataTypes.STRING,
        allowNull: false
    }
},{
    sequelize,
    modelName: 'Status'
});

module.exports = Status;