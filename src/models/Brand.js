const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Brand = sequelize.define('Brand', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'brands',
  timestamps: true,
  underscored: true
});

module.exports = Brand;
