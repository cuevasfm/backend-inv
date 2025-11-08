const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OfflineSyncQueue = sequelize.define('OfflineSyncQueue', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  entityType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'entity_type'
  },
  entityData: {
    type: DataTypes.JSONB,
    allowNull: false,
    field: 'entity_data'
  },
  action: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'syncing', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  retryCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'retry_count'
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'error_message'
  },
  syncedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'synced_at'
  }
}, {
  tableName: 'offline_sync_queue',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = OfflineSyncQueue;
