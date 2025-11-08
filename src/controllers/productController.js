const { Product, Category, Brand, ProductType, UnitType, sequelize } = require('../models');
const { Op } = require('sequelize');
const { logAction, getRequestInfo } = require('../utils/auditLogger');

// Obtener todos los productos
exports.getAllProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = '',
      categoryId,
      brandId,
      productTypeId,
      isActive = 'true'
    } = req.query;

    const offset = (page - 1) * limit;

    // Construir filtros
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { sku: { [Op.iLike]: `%${search}%` } },
        { barcode: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;
    if (productTypeId) where.productTypeId = productTypeId;
    if (isActive !== 'all') where.isActive = isActive === 'true';

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Brand, as: 'brand', attributes: ['id', 'name'] },
        { model: ProductType, as: 'productType', attributes: ['id', 'name', 'code'] },
        { model: UnitType, as: 'unitType', attributes: ['id', 'name', 'code'] }
      ],
      limit: parseInt(limit),
      offset,
      order: [['name', 'ASC']]
    });

    res.json({
      products,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener producto por ID
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        { model: Category, as: 'category' },
        { model: Brand, as: 'brand' },
        { model: ProductType, as: 'productType' },
        { model: UnitType, as: 'unitType' }
      ]
    });

    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    res.json({ product });
  } catch (error) {
    next(error);
  }
};

// Buscar producto por código de barras
exports.getProductByBarcode = async (req, res, next) => {
  try {
    const { barcode } = req.params;

    const product = await Product.findOne({
      where: { barcode },
      include: [
        { model: Category, as: 'category' },
        { model: Brand, as: 'brand' },
        { model: ProductType, as: 'productType' },
        { model: UnitType, as: 'unitType' }
      ]
    });

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        message: `No product found with barcode ${barcode}`
      });
    }

    res.json({ product });
  } catch (error) {
    next(error);
  }
};

// Crear producto
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);

    // Cargar relaciones
    await product.reload({
      include: [
        { model: Category, as: 'category' },
        { model: Brand, as: 'brand' },
        { model: ProductType, as: 'productType' },
        { model: UnitType, as: 'unitType' }
      ]
    });

    // Registrar log de auditoría
    const requestInfo = getRequestInfo(req);
    await logAction({
      userId: req.user?.id,
      username: req.user?.username,
      action: 'CREATE',
      module: 'products',
      entityId: product.id,
      entityName: product.name,
      description: `Producto creado: ${product.name} (SKU: ${product.sku})`,
      newValues: {
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        retailPrice: product.retailPrice,
        currentStock: product.currentStock
      },
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent
    });

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar producto
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    // Guardar valores anteriores para auditoría
    const oldValues = {
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      retailPrice: product.retailPrice,
      wholesalePrice: product.wholesalePrice,
      currentStock: product.currentStock,
      isActive: product.isActive
    };

    await product.update(req.body);

    // Recargar con relaciones
    await product.reload({
      include: [
        { model: Category, as: 'category' },
        { model: Brand, as: 'brand' },
        { model: ProductType, as: 'productType' },
        { model: UnitType, as: 'unitType' }
      ]
    });

    // Registrar log de auditoría
    const requestInfo = getRequestInfo(req);
    await logAction({
      userId: req.user?.id,
      username: req.user?.username,
      action: 'UPDATE',
      module: 'products',
      entityId: product.id,
      entityName: product.name,
      description: `Producto actualizado: ${product.name}`,
      oldValues,
      newValues: {
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        retailPrice: product.retailPrice,
        wholesalePrice: product.wholesalePrice,
        currentStock: product.currentStock,
        isActive: product.isActive
      },
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent
    });

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar producto (soft delete)
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    // Soft delete
    await product.update({ isActive: false });

    // Registrar log de auditoría
    const requestInfo = getRequestInfo(req);
    await logAction({
      userId: req.user?.id,
      username: req.user?.username,
      action: 'DELETE',
      module: 'products',
      entityId: product.id,
      entityName: product.name,
      description: `Producto eliminado (desactivado): ${product.name} (SKU: ${product.sku})`,
      oldValues: { isActive: true },
      newValues: { isActive: false },
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent
    });

    res.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Obtener productos con stock bajo
exports.getLowStockProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      where: {
        currentStock: {
          [Op.lte]: sequelize.col('reorder_point')
        },
        isActive: true
      },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Brand, as: 'brand', attributes: ['id', 'name'] },
        { model: ProductType, as: 'productType', attributes: ['id', 'name'] }
      ],
      order: [['currentStock', 'ASC']]
    });

    res.json({ products });
  } catch (error) {
    next(error);
  }
};

// Ajustar stock
exports.adjustStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity, notes } = req.body;

    if (!quantity || quantity === 0) {
      return res.status(400).json({
        error: 'Invalid quantity',
        message: 'Quantity must be different from zero'
      });
    }

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        error: 'Product not found'
      });
    }

    const newStock = product.currentStock + quantity;

    if (newStock < 0) {
      return res.status(400).json({
        error: 'Insufficient stock',
        message: `Cannot reduce stock below zero. Current stock: ${product.currentStock}`
      });
    }

    // Guardar stock anterior
    const previousStock = product.currentStock;

    // Actualizar stock
    await product.update({ currentStock: newStock });

    // Registrar movimiento de inventario
    const { InventoryMovement } = require('../models');
    await InventoryMovement.create({
      productId: id,
      movementType: 'adjustment',
      quantity,
      notes,
      userId: req.user.id
    });

    // Registrar log de auditoría
    const requestInfo = getRequestInfo(req);
    await logAction({
      userId: req.user?.id,
      username: req.user?.username,
      action: 'UPDATE',
      module: 'products',
      entityId: product.id,
      entityName: product.name,
      description: `Ajuste de stock: ${product.name} - ${quantity > 0 ? '+' : ''}${quantity} unidades`,
      oldValues: { currentStock: previousStock },
      newValues: { currentStock: newStock },
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent
    });

    res.json({
      message: 'Stock adjusted successfully',
      product: {
        id: product.id,
        name: product.name,
        previousStock,
        currentStock: product.currentStock
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener productos para lista de precios
exports.getProductsForPriceList = async (req, res, next) => {
  try {
    const {
      groupBy = 'category', // category, brand, productType, none
      sortBy = 'name', // name, retailPrice, currentStock
      sortOrder = 'ASC',
      categoryId,
      brandId,
      productTypeId,
      includeStock = 'false'
    } = req.query;

    // Construir filtros
    const where = { isActive: true };

    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;
    if (productTypeId) where.productTypeId = productTypeId;

    // Definir el orden
    let order = [];

    if (groupBy !== 'none') {
      // Primero agrupar por la categoría seleccionada
      if (groupBy === 'category') {
        order.push([{ model: Category, as: 'category' }, 'name', 'ASC']);
      } else if (groupBy === 'brand') {
        order.push([{ model: Brand, as: 'brand' }, 'name', 'ASC']);
      } else if (groupBy === 'productType') {
        order.push([{ model: ProductType, as: 'productType' }, 'name', 'ASC']);
      }
    }

    // Luego ordenar por el campo seleccionado
    order.push([sortBy, sortOrder.toUpperCase()]);

    const products = await Product.findAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Brand, as: 'brand', attributes: ['id', 'name'] },
        { model: ProductType, as: 'productType', attributes: ['id', 'name', 'code'] },
        { model: UnitType, as: 'unitType', attributes: ['id', 'name', 'code'] }
      ],
      order,
      attributes: [
        'id',
        'barcode',
        'name',
        'description',
        'retailPrice',
        'wholesalePrice',
        'wholesaleMinQuantity',
        'volumeMl',
        'alcoholPercentage',
        ...(includeStock === 'true' ? ['currentStock'] : [])
      ]
    });

    // Agrupar los resultados si es necesario
    let groupedProducts = products;

    if (groupBy !== 'none') {
      groupedProducts = products.reduce((acc, product) => {
        let groupKey;
        let groupName;

        if (groupBy === 'category') {
          groupKey = product.category?.id || 'sin-categoria';
          groupName = product.category?.name || 'Sin Categoría';
        } else if (groupBy === 'brand') {
          groupKey = product.brand?.id || 'sin-marca';
          groupName = product.brand?.name || 'Sin Marca';
        } else if (groupBy === 'productType') {
          groupKey = product.productType?.id || 'sin-tipo';
          groupName = product.productType?.name || 'Sin Tipo';
        }

        if (!acc[groupKey]) {
          acc[groupKey] = {
            groupName,
            products: []
          };
        }

        acc[groupKey].products.push(product);
        return acc;
      }, {});
    }

    res.json({
      products: groupBy === 'none' ? products : groupedProducts,
      grouped: groupBy !== 'none',
      groupBy,
      sortBy,
      sortOrder
    });
  } catch (error) {
    next(error);
  }
};
