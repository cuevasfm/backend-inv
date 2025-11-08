const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Supplier = sequelize.define('Supplier', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  companyName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    field: 'company_name',
    validate: {
      notEmpty: true
    }
  },
  contactName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'contact_name'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  taxId: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'tax_id'
  },
  creditDays: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'credit_days'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'suppliers',
  timestamps: true,
  underscored: true
});

module.exports = Supplier;
