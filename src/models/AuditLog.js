const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.'
  },
  module: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'products, users, customers, sales, etc.'
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'entity_id',
    comment: 'ID del registro afectado'
  },
  entityName: {
    type: DataTypes.STRING(200),
    allowNull: true,
    field: 'entity_name',
    comment: 'Nombre o descripción del registro afectado'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción detallada de la acción'
  },
  oldValues: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'old_values',
    comment: 'Valores anteriores (para UPDATE)'
  },
  newValues: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'new_values',
    comment: 'Valores nuevos (para CREATE y UPDATE)'
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    field: 'ip_address'
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'user_agent'
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = AuditLog;
