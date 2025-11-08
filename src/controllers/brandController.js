const { Brand } = require('../models');
const { logAction, getRequestInfo } = require('../utils/auditLogger');

// Obtener todas las marcas
exports.getAll = async (req, res, next) => {
  try {
    const brands = await Brand.findAll({
      order: [['name', 'ASC']]
    });
    res.json({ brands });
  } catch (error) {
    next(error);
  }
};

// Obtener marca por ID
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findByPk(id);

    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    res.json({ brand });
  } catch (error) {
    next(error);
  }
};

// Crear marca
exports.create = async (req, res, next) => {
  try {
    const brand = await Brand.create(req.body);

    // Registrar log de auditoría
    const requestInfo = getRequestInfo(req);
    await logAction({
      userId: req.user?.id,
      username: req.user?.username,
      action: 'CREATE',
      module: 'brands',
      entityId: brand.id,
      entityName: brand.name,
      description: `Marca creada: ${brand.name}`,
      newValues: { name: brand.name, description: brand.description },
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent
    });

    res.status(201).json({
      message: 'Brand created successfully',
      brand
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar marca
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findByPk(id);

    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    // Guardar valores anteriores
    const oldValues = { name: brand.name, description: brand.description };

    await brand.update(req.body);

    // Registrar log de auditoría
    const requestInfo = getRequestInfo(req);
    await logAction({
      userId: req.user?.id,
      username: req.user?.username,
      action: 'UPDATE',
      module: 'brands',
      entityId: brand.id,
      entityName: brand.name,
      description: `Marca actualizada: ${brand.name}`,
      oldValues,
      newValues: { name: brand.name, description: brand.description },
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent
    });

    res.json({
      message: 'Brand updated successfully',
      brand
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar marca
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findByPk(id);

    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    const brandName = brand.name;
    await brand.destroy();

    // Registrar log de auditoría
    const requestInfo = getRequestInfo(req);
    await logAction({
      userId: req.user?.id,
      username: req.user?.username,
      action: 'DELETE',
      module: 'brands',
      entityId: id,
      entityName: brandName,
      description: `Marca eliminada: ${brandName}`,
      oldValues: { name: brandName },
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent
    });

    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    next(error);
  }
};
