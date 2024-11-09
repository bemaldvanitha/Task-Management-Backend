const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db/db');

class Field extends Model {}

Field.init({
    field: {
        type: DataTypes.STRING,
        allowNull: false
    }
},{
    sequelize,
    modelName: 'Field'
});

module.exports = Field;