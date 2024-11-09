const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db/db');

class Priority extends Model {}

Priority.init({
    priority: {
        type: DataTypes.STRING,
        allowNull: false
    }
},{
    sequelize,
    modelName: 'Priority'
});

module.exports = Priority;