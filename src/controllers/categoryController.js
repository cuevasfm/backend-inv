const { Category } = require('../models');
const { logAction, getRequestInfo } = require('../utils/auditLogger');

// Obtener todas las categorías
exports.getAll = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });
    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

// Obtener categoría por ID
exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ category });
  } catch (error) {
    next(error);
  }
};

// Crear categoría
exports.create = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);

    // Registrar log de auditoría
    const requestInfo = getRequestInfo(req);
    await logAction({
      userId: req.user?.id,
      username: req.user?.username,
      action: 'CREATE',
      module: 'categories',
      entityId: category.id,
      entityName: category.name,
      description: `Categoría creada: ${category.name}`,
      newValues: { name: category.name, description: category.description },
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent
    });

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar categoría
exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Guardar valores anteriores
    const oldValues = { name: category.name, description: category.description };

    await category.update(req.body);

    // Registrar log de auditoría
    const requestInfo = getRequestInfo(req);
    await logAction({
      userId: req.user?.id,
      username: req.user?.username,
      action: 'UPDATE',
      module: 'categories',
      entityId: category.id,
      entityName: category.name,
      description: `Categoría actualizada: ${category.name}`,
      oldValues,
      newValues: { name: category.name, description: category.description },
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent
    });

    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar categoría
exports.delete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const categoryName = category.name;
    await category.destroy();

    // Registrar log de auditoría
    const requestInfo = getRequestInfo(req);
    await logAction({
      userId: req.user?.id,
      username: req.user?.username,
      action: 'DELETE',
      module: 'categories',
      entityId: id,
      entityName: categoryName,
      description: `Categoría eliminada: ${categoryName}`,
      oldValues: { name: categoryName },
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};
