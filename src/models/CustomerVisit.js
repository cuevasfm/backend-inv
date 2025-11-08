const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CustomerVisit = sequelize.define('CustomerVisit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  promoterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'promoter_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  visitDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'visit_date'
  },
  visitType: {
    type: DataTypes.ENUM('planned', 'spontaneous'),
    allowNull: true,
    field: 'visit_type'
  },
  saleId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'sale_id',
    references: {
      model: 'sales',
      key: 'id'
    }
  },
  locationLat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
    field: 'location_lat'
  },
  locationLng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
    field: 'location_lng'
  },
  checkInTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'check_in_time'
  },
  checkOutTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'check_out_time'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  visitResult: {
    type: DataTypes.ENUM('sale', 'no_sale', 'closed', 'postponed'),
    allowNull: true,
    field: 'visit_result'
  }
}, {
  tableName: 'customer_visits',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = CustomerVisit;
