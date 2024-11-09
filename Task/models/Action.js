const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db/db');

class Action extends Model {}

Action.init({
    action: {
        type: DataTypes.STRING,
        allowNull: false
    }
},{
    sequelize,
    modelName: 'Action'
});

module.exports = Action;