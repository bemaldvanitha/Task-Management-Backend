const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db/db');

const AuditLog = require('./AuditLog');
const Field = require('./Field');

class AuditLogDetail extends Model {}

AuditLogDetail.init({
    auditLogId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fieldId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    oldValue: {
        type: DataTypes.STRING,
        allowNull: true
    },
    newValue: {
        type: DataTypes.STRING,
        allowNull: true
    }
},{
    sequelize,
    modelName: 'AuditLogDetail'
});

AuditLog.hasMany(AuditLogDetail, {
    foreignKey: 'auditLogId',
});

AuditLogDetail.belongsTo(AuditLog, {
    foreignKey: 'auditLogId',
});

Field.hasMany(AuditLogDetail, {
    foreignKey: 'fieldId',
});

AuditLogDetail.belongsTo(Field, {
    foreignKey: 'fieldId',
});

module.exports = AuditLogDetail;