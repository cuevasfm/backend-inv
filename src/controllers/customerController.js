const Customer = require('../models/Customer');
const { Op } = require('sequelize');
const { logAction, getRequestInfo } = require('../utils/auditLogger');

// Obtener todos los clientes
exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { companyName: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Customer.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      customers: rows,
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

// Obtener un cliente por ID
exports.getById = async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(customer);
  } catch (error) {
    next(error);
  }
};

// Crear nuevo cliente
exports.create = async (req, res, next) => {
  try {
    const {
      customerType,
      firstName,
      lastName,
      companyName,
      taxId,
      email,
      phone,
      street,
      exteriorNumber,
      interiorNumber,
      neighborhood,
      postalCode,
      municipality,
      state,
      creditLimit,
      isWholesale,
      notes
    } = req.body;

    // Validar que al menos haya un nombre (firstName/lastName para individual o companyName para empresa)
    if (customerType === 'business' && !companyName) {
      return res.status(400).json({ error: 'El nombre de la empresa es requerido' });
    }

    if (customerType === 'individual' && !firstName && !lastName) {
      return res.status(400).json({ error: 'El nombre del cliente es requerido' });
    }

    // Si no se especifica customerType, determinar por los campos
    let finalCustomerType = customerType;
    if (!finalCustomerType) {
      finalCustomerType = companyName ? 'business' : 'individual';
    }

    const customer = await Customer.create({
      customerType: finalCustomerType,
      firstName,
      lastName,
      companyName,
      taxId,
      email: email || null,
      phone,
      street,
      exteriorNumber,
      interiorNumber,
      neighborhood,
      postalCode,
      municipality,
      state,
      creditLimit: creditLimit || 0,
      currentBalance: 0,
      loyaltyPoints: 0,
      isWholesale: isWholesale || false,
      notes,
      isActive: true
    });

    // Registrar log de auditoría
    const customerName = customer.customerType === 'business' ? customer.companyName : `${customer.firstName} ${customer.lastName}`;
    const requestInfo = getRequestInfo(req);
    await logAction({
      userId: req.user?.id,
      username: req.user?.username,
      action: 'CREATE',
      module: 'customers',
      entityId: customer.id,
      entityName: customerName,
      description: `Cliente creado: ${customerName} (${customer.customerType === 'business' ? 'Empresa' : 'Individual'})`,
      newValues: {
        customerType: customer.customerType,
        name: customerName,
        email: customer.email,
        phone: customer.phone,
        isWholesale: customer.isWholesale
      },
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent
    });

    res.status(201).json(customer);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }
    next(error);
  }
};

// Actualizar cliente
exports.update = async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const {
      customerType,
      firstName,
      lastName,
      companyName,
      taxId,
      email,
      phone,
      street,
      exteriorNumber,
      interiorNumber,
      neighborhood,
      postalCode,
      municipality,
      state,
      creditLimit,
      isWholesale,
      notes,
      isActive
    } = req.body;

    // Validar que al menos haya un nombre
    const newCustomerType = customerType || customer.customerType;
    if (newCustomerType === 'business' && !companyName && !customer.companyName) {
      return res.status(400).json({ error: 'El nombre de la empresa es requerido' });
    }

    if (newCustomerType === 'individual' && !firstName && !customer.firstName && !lastName && !customer.lastName) {
      return res.status(400).json({ error: 'El nombre del cliente es requerido' });
    }

    // Guardar valores anteriores para auditoría
    const oldCustomerName = customer.customerType === 'business' ? customer.companyName : `${customer.firstName} ${customer.lastName}`;
    const oldValues = {
      customerType: customer.customerType,
      email: customer.email,
      phone: customer.phone,
      isWholesale: customer.isWholesale,
      isActive: customer.isActive
    };

    await customer.update({
      customerType,
      firstName,
      lastName,
      companyName,
      taxId,
      email: email || null,
      phone,
      street,
      exteriorNumber,
      interiorNumber,
      neighborhood,
      postalCode,
      municipality,
      state,
      creditLimit,
      isWholesale,
      notes,
      isActive
    });

    // Registrar log de auditoría
    const newCustomerName = customer.customerType === 'business' ? customer.companyName : `${customer.firstName} ${customer.lastName}`;
    const requestInfo = getRequestInfo(req);
    await logAction({
      userId: req.user?.id,
      username: req.user?.username,
      action: 'UPDATE',
      module: 'customers',
      entityId: customer.id,
      entityName: newCustomerName,
      description: `Cliente actualizado: ${newCustomerName}`,
      oldValues,
      newValues: {
        customerType: customer.customerType,
        email: customer.email,
        phone: customer.phone,
        isWholesale: customer.isWholesale,
        isActive: customer.isActive
      },
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent
    });

    res.json(customer);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }
    next(error);
  }
};

// Eliminar cliente (soft delete)
exports.delete = async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.id);

    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    await customer.update({ isActive: false });

    // Registrar log de auditoría
    const customerName = customer.customerType === 'business' ? customer.companyName : `${customer.firstName} ${customer.lastName}`;
    const requestInfo = getRequestInfo(req);
    await logAction({
      userId: req.user?.id,
      username: req.user?.username,
      action: 'DELETE',
      module: 'customers',
      entityId: customer.id,
      entityName: customerName,
      description: `Cliente desactivado: ${customerName}`,
      oldValues: { isActive: true },
      newValues: { isActive: false },
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent
    });

    res.json({ message: 'Cliente desactivado exitosamente' });
  } catch (error) {
    next(error);
  }
};
