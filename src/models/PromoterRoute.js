const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PromoterRoute = sequelize.define('PromoterRoute', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  promoterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'promoter_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  routeName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    field: 'route_name'
  },
  routeCode: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: true,
    field: 'route_code'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dayOfWeek: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'day_of_week',
    validate: {
      min: 0,
      max: 6
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'promoter_routes',
  timestamps: true,
  underscored: true
});

module.exports = PromoterRoute;
