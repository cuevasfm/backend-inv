const AuditLog = require('../models/AuditLog');

/**
 * Registra una acción en el log de auditoría
 * @param {Object} params - Parámetros del log
 * @param {Number} params.userId - ID del usuario que realiza la acción
 * @param {String} params.username - Nombre de usuario
 * @param {String} params.action - Acción realizada (CREATE, UPDATE, DELETE, LOGIN, etc.)
 * @param {String} params.module - Módulo afectado (products, users, customers, etc.)
 * @param {Number} params.entityId - ID del registro afectado
 * @param {String} params.entityName - Nombre o descripción del registro
 * @param {String} params.description - Descripción detallada
 * @param {Object} params.oldValues - Valores anteriores (para UPDATE)
 * @param {Object} params.newValues - Valores nuevos (para CREATE y UPDATE)
 * @param {String} params.ipAddress - Dirección IP del cliente
 * @param {String} params.userAgent - User agent del cliente
 */
async function logAction({
  userId,
  username,
  action,
  module,
  entityId = null,
  entityName = null,
  description = null,
  oldValues = null,
  newValues = null,
  ipAddress = null,
  userAgent = null
}) {
  try {
    await AuditLog.create({
      userId,
      username,
      action,
      module,
      entityId,
      entityName,
      description,
      oldValues,
      newValues,
      ipAddress,
      userAgent
    });
  } catch (error) {
    // No lanzar error para no interrumpir la operación principal
    console.error('Error al registrar log de auditoría:', error);
  }
}

/**
 * Extrae información del request para el log
 * @param {Object} req - Request de Express
 */
function getRequestInfo(req) {
  return {
    userId: req.user?.userId,
    username: req.user?.username,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent')
  };
}

module.exports = {
  logAction,
  getRequestInfo
};
