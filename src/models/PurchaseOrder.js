const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderNumber: {
    type: DataTypes.STRING(20),
    unique: true,
    allowNull: false,
    field: 'order_number'
  },
  supplierId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'supplier_id',
    references: {
      model: 'suppliers',
      key: 'id'
    }
  },
  orderDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'order_date'
  },
  expectedDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'expected_date'
  },
  receivedDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'received_date'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'ordered', 'partial', 'received', 'cancelled'),
    allowNull: true
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
  shippingCost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'shipping_cost'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_amount',
    validate: {
      min: 0
    }
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
  tableName: 'purchase_orders',
  timestamps: true,
  underscored: true
});

module.exports = PurchaseOrder;
