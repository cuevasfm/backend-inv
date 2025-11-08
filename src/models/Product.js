const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  barcode: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: true
  },
  sku: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'category_id',
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  brandId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'brand_id',
    references: {
      model: 'brands',
      key: 'id'
    }
  },
  productTypeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'product_type_id',
    references: {
      model: 'product_types',
      key: 'id'
    }
  },
  alcoholPercentage: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: true,
    field: 'alcohol_percentage'
  },
  volumeMl: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'volume_ml'
  },
  unitTypeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'unit_type_id',
    references: {
      model: 'unit_types',
      key: 'id'
    }
  },
  purchasePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'purchase_price',
    validate: {
      min: 0
    }
  },
  retailPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'retail_price',
    validate: {
      min: 0
    }
  },
  wholesalePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'wholesale_price',
    validate: {
      min: 0
    }
  },
  wholesaleMinQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 12,
    field: 'wholesale_min_quantity'
  },
  currentStock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'current_stock'
  },
  minStock: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
    field: 'min_stock'
  },
  maxStock: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    field: 'max_stock'
  },
  reorderPoint: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    field: 'reorder_point'
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'image_url'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'products',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (product) => {
      // Generar SKU automáticamente si no se proporciona
      if (!product.sku) {
        // Usar el timestamp para garantizar unicidad
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        product.sku = `PRD-${timestamp}${random}`;
      }
    }
  }
});

module.exports = Product;
