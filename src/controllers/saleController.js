const { Sale, SaleItem, Product, Customer, User } = require('../models');
const { logAction } = require('../utils/auditLogger');
const { sequelize } = require('../config/database');

// Generar número de venta
const generateSaleNumber = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;
  
  // Buscar el último número de venta del día
  const lastSale = await Sale.findOne({
    where: {
      saleNumber: {
        [sequelize.Sequelize.Op.like]: `V-${datePrefix}-%`
      }
    },
    order: [['saleNumber', 'DESC']]
  });

  let sequence = 1;
  if (lastSale) {
    const lastSequence = parseInt(lastSale.saleNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }

  return `V-${datePrefix}-${String(sequence).padStart(4, '0')}`;
};

// Crear venta
exports.create = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const {
      customerId,
      saleType,
      items,
      paymentMethod,
      paymentStatus,
      paidAmount,
      notes
    } = req.body;

    // Validar que haya items
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'La venta debe tener al menos un producto' });
    }

    // Validar stock y precios de cada item
    let subtotal = 0;
    let totalDiscount = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction });
      
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ 
          error: `Producto con ID ${item.productId} no encontrado`,
          productId: item.productId
        });
      }

      if (!product.isActive) {
        await transaction.rollback();
        return res.status(400).json({ 
          error: `El producto "${product.name}" no está activo`,
          productId: item.productId
        });
      }

      if (product.currentStock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({ 
          error: `Stock insuficiente para "${product.name}". Disponible: ${product.currentStock}, Solicitado: ${item.quantity}`,
          productId: item.productId,
          available: product.currentStock,
          requested: item.quantity
        });
      }

      // Determinar precio según tipo de venta
      const unitPrice = saleType === 'wholesale' && product.wholesalePrice 
        ? parseFloat(product.wholesalePrice)
        : parseFloat(product.retailPrice);

      const itemDiscount = parseFloat(item.discountAmount || 0);
      const itemSubtotal = (unitPrice * item.quantity) - itemDiscount;

      subtotal += itemSubtotal;
      totalDiscount += itemDiscount;

      validatedItems.push({
        productId: item.productId,
        product,
        quantity: item.quantity,
        unitPrice,
        discountPercentage: item.discountPercentage || 0,
        discountAmount: itemDiscount,
        subtotal: itemSubtotal
      });
    }

    // Calcular totales
    const taxAmount = 0; // Puedes agregar lógica de impuestos si es necesario
    const totalAmount = subtotal;
    const changeAmount = Math.max(0, (paidAmount || 0) - totalAmount);

    // Generar número de venta
    const saleNumber = await generateSaleNumber();

    // Crear la venta
    const sale = await Sale.create({
      saleNumber,
      customerId: customerId || null,
      saleType: saleType || 'retail',
      subtotal,
      taxAmount,
      discountAmount: totalDiscount,
      totalAmount,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: paymentStatus || 'paid',
      paidAmount: paidAmount || totalAmount,
      changeAmount,
      notes: notes || null,
      userId: req.user.id
    }, { transaction });

    // Crear los items de venta y actualizar stock
    for (const item of validatedItems) {
      await SaleItem.create({
        saleId: sale.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercentage: item.discountPercentage,
        discountAmount: item.discountAmount,
        subtotal: item.subtotal
      }, { transaction });

      // Actualizar stock del producto
      await item.product.decrement('currentStock', {
        by: item.quantity,
        transaction
      });
    }

    await transaction.commit();

    // Log de auditoría
    await logAction(req, 'CREATE', 'sales', sale.id, `Venta ${saleNumber}`, 'Venta creada', null, {
      saleNumber,
      totalAmount,
      items: validatedItems.length
    });

    // Obtener venta completa con relaciones
    const completeSale = await Sale.findByPk(sale.id, {
      include: [
        {
          model: SaleItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        },
        { model: Customer, as: 'customer' },
        { model: User, as: 'user', attributes: ['id', 'username', 'firstName', 'lastName'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Venta creada exitosamente',
      sale: completeSale
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error al crear venta:', error);
    res.status(500).json({ 
      error: 'Error al crear la venta',
      details: error.message 
    });
  }
};

// Obtener todas las ventas
exports.getAll = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      startDate,
      endDate,
      paymentMethod,
      paymentStatus,
      customerId
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Filtros
    if (search) {
      where[sequelize.Sequelize.Op.or] = [
        { saleNumber: { [sequelize.Sequelize.Op.iLike]: `%${search}%` } },
        { notes: { [sequelize.Sequelize.Op.iLike]: `%${search}%` } }
      ];
    }

    if (startDate && endDate) {
      where.created_at = {
        [sequelize.Sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    const { count, rows: sales } = await Sale.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      include: [
        {
          model: SaleItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        },
        { model: Customer, as: 'customer' },
        { model: User, as: 'user', attributes: ['id', 'username', 'firstName', 'lastName'] }
      ]
    });

    res.json({
      data: {
        sales,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ error: 'Error al obtener las ventas' });
  }
};

// Obtener una venta por ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await Sale.findByPk(id, {
      include: [
        {
          model: SaleItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        },
        { model: Customer, as: 'customer' },
        { model: User, as: 'user', attributes: ['id', 'username', 'firstName', 'lastName'] }
      ]
    });

    if (!sale) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    res.json({ data: sale });

  } catch (error) {
    console.error('Error al obtener venta:', error);
    res.status(500).json({ error: 'Error al obtener la venta' });
  }
};

// Cancelar venta
exports.cancel = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { reason } = req.body;

    const sale = await Sale.findByPk(id, {
      include: [{ model: SaleItem, as: 'items' }],
      transaction
    });

    if (!sale) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    if (sale.paymentStatus === 'cancelled') {
      await transaction.rollback();
      return res.status(400).json({ error: 'La venta ya está cancelada' });
    }

    // Restaurar stock de todos los productos
    for (const item of sale.items) {
      const product = await Product.findByPk(item.productId, { transaction });
      if (product) {
        await product.increment('currentStock', {
          by: item.quantity,
          transaction
        });
      }
    }

    // Actualizar estado de la venta
    await sale.update({
      paymentStatus: 'cancelled',
      notes: sale.notes 
        ? `${sale.notes}\n\n[CANCELADA] ${reason || 'Sin motivo especificado'}`
        : `[CANCELADA] ${reason || 'Sin motivo especificado'}`
    }, { transaction });

    await transaction.commit();

    // Log de auditoría
    await logAction(req, 'UPDATE', 'sales', sale.id, `Venta ${sale.saleNumber}`, 
      `Venta cancelada: ${reason || 'Sin motivo'}`, 
      { paymentStatus: 'paid' }, 
      { paymentStatus: 'cancelled' }
    );

    res.json({
      success: true,
      message: 'Venta cancelada exitosamente',
      sale
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error al cancelar venta:', error);
    res.status(500).json({ error: 'Error al cancelar la venta' });
  }
};

// Obtener resumen de ventas (para dashboard)
exports.getSummary = async (req, res) => {
  try {
    const baseWhere = { paymentStatus: { [sequelize.Sequelize.Op.ne]: 'cancelled' } };
    
    // Calcular fechas
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Ventas de hoy
    const todaySales = await Sale.findAll({
      where: {
        ...baseWhere,
        created_at: { [sequelize.Sequelize.Op.gte]: todayStart }
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_amount')), 0), 'total']
      ],
      raw: true
    });

    // Ventas de la semana
    const weekSales = await Sale.findAll({
      where: {
        ...baseWhere,
        created_at: { [sequelize.Sequelize.Op.gte]: weekStart }
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_amount')), 0), 'total']
      ],
      raw: true
    });

    // Ventas del mes
    const monthSales = await Sale.findAll({
      where: {
        ...baseWhere,
        created_at: { [sequelize.Sequelize.Op.gte]: monthStart }
      },
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_amount')), 0), 'total']
      ],
      raw: true
    });

    // Ventas por método de pago (últimos 30 días)
    const byPaymentMethod = await Sale.findAll({
      where: {
        ...baseWhere,
        created_at: { [sequelize.Sequelize.Op.gte]: monthStart }
      },
      attributes: [
        'payment_method',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total']
      ],
      group: ['payment_method'],
      raw: true
    });

    // Productos más vendidos (últimos 30 días)
    const topProducts = await SaleItem.findAll({
      attributes: [
        'product_id',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
        [sequelize.fn('SUM', sequelize.col('subtotal')), 'totalRevenue']
      ],
      include: [{
        model: Sale,
        as: 'sale',
        where: {
          ...baseWhere,
          created_at: { [sequelize.Sequelize.Op.gte]: monthStart }
        },
        attributes: []
      }, {
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'barcode']
      }],
      group: ['SaleItem.product_id', 'product.id', 'product.name', 'product.barcode'],
      order: [[sequelize.literal('"totalQuantity"'), 'DESC']],
      limit: 10,
      raw: true,
      nest: true
    });

    res.json({
      data: {
        todaySales: parseFloat(todaySales[0]?.total || 0),
        todayCount: parseInt(todaySales[0]?.count || 0),
        weekSales: parseFloat(weekSales[0]?.total || 0),
        weekCount: parseInt(weekSales[0]?.count || 0),
        monthSales: parseFloat(monthSales[0]?.total || 0),
        monthCount: parseInt(monthSales[0]?.count || 0),
        byPaymentMethod: byPaymentMethod || [],
        topProducts: topProducts || []
      }
    });

  } catch (error) {
    console.error('Error al obtener resumen de ventas:', error);
    res.status(500).json({ error: 'Error al obtener el resumen de ventas' });
  }
};

