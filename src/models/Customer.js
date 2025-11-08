const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  customerType: {
    type: DataTypes.ENUM('individual', 'business'),
    allowNull: true,
    field: 'customer_type'
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'last_name'
  },
  companyName: {
    type: DataTypes.STRING(200),
    allowNull: true,
    field: 'company_name'
  },
  taxId: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'tax_id'
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  street: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  exteriorNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'exterior_number'
  },
  interiorNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'interior_number'
  },
  neighborhood: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  postalCode: {
    type: DataTypes.STRING(10),
    allowNull: true,
    field: 'postal_code'
  },
  municipality: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  creditLimit: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'credit_limit'
  },
  currentBalance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'current_balance'
  },
  loyaltyPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'loyalty_points'
  },
  isWholesale: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_wholesale'
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
  tableName: 'customers',
  timestamps: true,
  underscored: true
});

module.exports = Customer;
