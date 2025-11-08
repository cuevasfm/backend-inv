const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InventoryMovement = sequelize.define('InventoryMovement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  movementType: {
    type: DataTypes.ENUM('purchase', 'sale', 'adjustment', 'return', 'damage', 'transfer'),
    allowNull: false,
    field: 'movement_type'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  unitCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'unit_cost'
  },
  totalCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'total_cost'
  },
  referenceType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'reference_type'
  },
  referenceId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'reference_id'
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
  tableName: 'inventory_movements',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = InventoryMovement;
