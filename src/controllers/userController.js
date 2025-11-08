const User = require('../models/User');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { logAction, getRequestInfo } = require('../utils/auditLogger');

// Obtener todos los usuarios
exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: offset,
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['passwordHash'] }
    });

    res.json({
      users: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un usuario por ID
exports.getById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['passwordHash'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Crear nuevo usuario
exports.create = async (req, res, next) => {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      role,
      isActive
    } = req.body;

    // Validaciones
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'El nombre de usuario, email y contraseña son requeridos'
      });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Crear usuario
    const user = await User.create({
      username,
      email,
      passwordHash: password, // El hook beforeCreate se encargará del hash
      firstName: firstName || null,
      lastName: lastName || null,
      role: role || 'cashier',
      isActive: isActive !== undefined ? isActive : true
    });

    // Obtener el usuario sin el passwordHash
    const userResponse = await User.findByPk(user.id, {
      attributes: { exclude: ['passwordHash'] }
    });

    // Registrar log de auditoría
    const requestInfo = getRequestInfo(req);
    await logAction({
      userId: req.user?.id,
      username: req.user?.username,
      action: 'CREATE',
      module: 'users',
      entityId: user.id,
      entityName: username,
      description: `Usuario creado: ${username} (${email}) - Rol: ${user.role}`,
      newValues: {
        username,
        email,
        role: user.role,
        isActive: user.isActive
      },
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent
    });

    res.status(201).json(userResponse);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0].path;
      if (field === 'username') {
        return res.status(400).json({ error: 'El nombre de usuario ya está registrado' });
      }
      if (field === 'email') {
        return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
      }
    }
    next(error);
  }
};

// Actualizar usuario
exports.update = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const {
      username,
      email,
      password,
      firstName,
      lastName,
      role,
      isActive
    } = req.body;

    // Guardar valores anteriores para auditoría
    const oldValues = {
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    };

    const newValues = {
      username: username || user.username,
      email: email || user.email,
      role: role || user.role,
      isActive: isActive !== undefined ? isActive : user.isActive
    };

    // Indicar si se cambió la contraseña (sin guardar el valor por seguridad)
    let passwordChanged = false;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          error: 'La contraseña debe tener al menos 6 caracteres'
        });
      }
      oldValues.passwordChanged = false;
      newValues.passwordChanged = true;
      passwordChanged = true;
    }

    // Preparar datos para actualizar
    const updateData = {
      username,
      email,
      firstName,
      lastName,
      role,
      isActive
    };

    if (passwordChanged) {
      updateData.passwordHash = password; // El hook beforeUpdate se encargará del hash
    }

    await user.update(updateData);

    // Obtener el usuario actualizado sin el passwordHash
    const userResponse = await User.findByPk(user.id, {
      attributes: { exclude: ['passwordHash'] }
    });

    // Registrar log de auditoría
    const requestInfo = getRequestInfo(req);
    await logAction({
      userId: req.user?.id,
      username: req.user?.username,
      action: 'UPDATE',
      module: 'users',
      entityId: user.id,
      entityName: user.username,
      description: `Usuario actualizado: ${user.username}${passwordChanged ? ' (contraseña modificada)' : ''}`,
      oldValues,
      newValues,
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent
    });

    res.json(userResponse);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0].path;
      if (field === 'username') {
        return res.status(400).json({ error: 'El nombre de usuario ya está registrado' });
      }
      if (field === 'email') {
        return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
      }
    }
    next(error);
  }
};

// Eliminar usuario (soft delete)
exports.delete = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // No permitir eliminar/desactivar al usuario actual
    if (user.id === req.user.userId) {
      return res.status(400).json({
        error: 'No puedes desactivar tu propia cuenta'
      });
    }

    // No permitir eliminar/desactivar usuarios con rol admin
    if (user.role === 'admin') {
      return res.status(400).json({
        error: 'No se puede desactivar un usuario administrador'
      });
    }

    await user.update({ isActive: false });

    // Registrar log de auditoría
    const requestInfo = getRequestInfo(req);
    await logAction({
      userId: req.user?.id,
      username: req.user?.username,
      action: 'DELETE',
      module: 'users',
      entityId: user.id,
      entityName: user.username,
      description: `Usuario desactivado: ${user.username} (${user.email})`,
      oldValues: { isActive: true },
      newValues: { isActive: false },
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent
    });

    res.json({ message: 'Usuario desactivado exitosamente' });
  } catch (error) {
    next(error);
  }
};
