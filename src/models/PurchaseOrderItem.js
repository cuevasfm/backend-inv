const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PurchaseOrderItem = sequelize.define('PurchaseOrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  purchaseOrderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'purchase_order_id',
    references: {
      model: 'purchase_orders',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'product_id',
    references: {
      model: 'products',
      key: 'id'
    }
  },
  quantityOrdered: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'quantity_ordered',
    validate: {
      min: 1
    }
  },
  quantityReceived: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'quantity_received'
  },
  unitCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'unit_cost',
    validate: {
      min: 0
    }
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  }
}, {
  tableName: 'purchase_order_items',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = PurchaseOrderItem;
