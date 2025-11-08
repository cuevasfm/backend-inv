const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_hash'
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
  role: {
    type: DataTypes.ENUM('admin', 'manager', 'cashier', 'warehouse', 'promoter'),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login'
  },
  deviceToken: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'device_token'
  },
  preferredInterface: {
    type: DataTypes.ENUM('desktop', 'mobile'),
    defaultValue: 'desktop',
    field: 'preferred_interface'
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.passwordHash) {
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('passwordHash')) {
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
      }
    }
  }
});

// Método de instancia para validar contraseña
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
};

// Método para ocultar el password en JSON
User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.passwordHash;
  return values;
};

module.exports = User;
