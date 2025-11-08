const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Sale = sequelize.define('Sale', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  saleNumber: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false,
    field: 'sale_number'
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'customer_id',
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  saleType: {
    type: DataTypes.ENUM('retail', 'wholesale'),
    allowNull: true,
    field: 'sale_type'
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'tax_amount'
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'discount_amount'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_amount',
    validate: {
      min: 0
    }
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'card', 'transfer', 'credit'),
    allowNull: true,
    field: 'payment_method'
  },
  paymentStatus: {
    type: DataTypes.ENUM('paid', 'pending', 'partial', 'cancelled'),
    allowNull: true,
    field: 'payment_status'
  },
  paidAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'paid_amount'
  },
  changeAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'change_amount'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'sales',
  timestamps: true,
  underscored: true
});

module.exports = Sale;
