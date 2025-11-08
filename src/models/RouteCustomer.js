const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RouteCustomer = sequelize.define('RouteCustomer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  routeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'route_id',
    references: {
      model: 'promoter_routes',
      key: 'id'
    }
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'customer_id',
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  visitOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'visit_order'
  },
  visitFrequency: {
    type: DataTypes.ENUM('weekly', 'biweekly', 'monthly'),
    allowNull: true,
    field: 'visit_frequency'
  },
  preferredVisitTime: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'preferred_visit_time'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'route_customers',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = RouteCustomer;
