const { ProductType } = require('../models');
const { logAction, getRequestInfo } = require('../utils/auditLogger');

// Obtener todos los tipos de producto
exports.getAll = async (req, res, next) => {
  try {
    const productTypes = await ProductType.findAll({
      order: [['name', 'ASC']]
    });
    res.json({ productTypes });
  } catch (error) {
    next(error);
  }
};

// Obtener tipo de producto por ID
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productType = await ProductType.findByPk(id);

    if (!productType) {
      return res.status(404).json({ error: 'Product type not found' });
    }

    res.json({ productType });
  } catch (error) {
    next(error);
  }
};

// Crear tipo de producto
exports.create = async (req, res, next) => {
  try {
    const productType = await ProductType.create(req.body);

    // Registrar log de auditoría
    const requestInfo = getRequestInfo(req);
    await logAction({
      userId: req.user?.id,
      username: req.user?.username,
      action: 'CREATE',
      module: 'product-types',
      entityId: productType.id,
      entityName: productType.name,
      description: `Tipo de producto creado: ${productType.name} (${productType.code})`,
      newValues: { name: productType.name, code: productType.code, description: productType.description },
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent
    });

    res.status(201).json({
      message: 'Product type created successfully',
      productType
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar tipo de producto
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productType = await ProductType.findByPk(id);

    if (!productType) {
      return res.status(404).json({ error: 'Product type not found' });
    }

    // Guardar valores anteriores
    const oldValues = { name: productType.name, code: productType.code, description: productType.description };

    await productType.update(req.body);

    // Registrar log de auditoría
    const requestInfo = getRequestInfo(req);
    await logAction({
      userId: req.user?.id,
      username: req.user?.username,
      action: 'UPDATE',
      module: 'product-types',
      entityId: productType.id,
      entityName: productType.name,
      description: `Tipo de producto actualizado: ${productType.name}`,
      oldValues,
      newValues: { name: productType.name, code: productType.code, description: productType.description },
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent
    });

    res.json({
      message: 'Product type updated successfully',
      productType
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar tipo de producto
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productType = await ProductType.findByPk(id);

    if (!productType) {
      return res.status(404).json({ error: 'Product type not found' });
    }

    const productTypeName = productType.name;
    const productTypeCode = productType.code;
    await productType.destroy();

    // Registrar log de auditoría
    const requestInfo = getRequestInfo(req);
    await logAction({
      userId: req.user?.id,
      username: req.user?.username,
      action: 'DELETE',
      module: 'product-types',
      entityId: id,
      entityName: productTypeName,
      description: `Tipo de producto eliminado: ${productTypeName} (${productTypeCode})`,
      oldValues: { name: productTypeName, code: productTypeCode },
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent
    });

    res.json({ message: 'Product type deleted successfully' });
  } catch (error) {
    next(error);
  }
};
