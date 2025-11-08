const AuditLog = require('../models/AuditLog');
const { Op } = require('sequelize');

// Obtener todos los logs con filtros
exports.getAll = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = '',
      module = '',
      action = '',
      userId = '',
      startDate = '',
      endDate = ''
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const whereClause = {};

    // Filtro por búsqueda (username, description, entityName)
    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { entityName: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Filtro por módulo
    if (module) {
      whereClause.module = module;
    }

    // Filtro por acción
    if (action) {
      whereClause.action = action;
    }

    // Filtro por usuario
    if (userId) {
      whereClause.userId = parseInt(userId);
    }

    // Filtro por rango de fechas
    if (startDate || endDate) {
      whereClause.created_at = {};
      if (startDate) {
        whereClause.created_at[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.created_at[Op.lte] = end;
      }
    }

    const { count, rows } = await AuditLog.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      logs: rows,
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

// Obtener estadísticas de logs
exports.getStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const whereClause = {};

    if (startDate || endDate) {
      whereClause.created_at = {};
      if (startDate) {
        whereClause.created_at[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.created_at[Op.lte] = end;
      }
    }

    // Total de logs
    const total = await AuditLog.count({ where: whereClause });

    // Logs por módulo
    const byModule = await AuditLog.findAll({
      where: whereClause,
      attributes: [
        'module',
        [AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('id')), 'count']
      ],
      group: ['module'],
      order: [[AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('id')), 'DESC']]
    });

    // Logs por acción
    const byAction = await AuditLog.findAll({
      where: whereClause,
      attributes: [
        'action',
        [AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('id')), 'count']
      ],
      group: ['action'],
      order: [[AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('id')), 'DESC']]
    });

    // Usuarios más activos
    const topUsers = await AuditLog.findAll({
      where: {
        ...whereClause,
        userId: { [Op.not]: null }
      },
      attributes: [
        'userId',
        'username',
        [AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('id')), 'count']
      ],
      group: ['userId', 'username'],
      order: [[AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('id')), 'DESC']],
      limit: 10
    });

    res.json({
      total,
      byModule,
      byAction,
      topUsers
    });
  } catch (error) {
    next(error);
  }
};
