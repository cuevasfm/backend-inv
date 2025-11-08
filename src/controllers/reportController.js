const { Product, Category, Brand, ProductType, sequelize } = require('../models');
const { Op } = require('sequelize');

// Reporte de inventario
exports.getInventoryReport = async (req, res, next) => {
  try {
    // Obtener todos los productos activos con sus relaciones
    const products = await Product.findAll({
      where: { isActive: true },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Brand, as: 'brand', attributes: ['id', 'name'] },
        { model: ProductType, as: 'productType', attributes: ['id', 'name'] }
      ]
    });

    // Calcular estadísticas generales
    const totalProducts = products.length;
    const totalItems = products.reduce((sum, p) => sum + (p.currentStock || 0), 0);

    const totalPurchaseValue = products.reduce((sum, p) => {
      return sum + ((p.currentStock || 0) * (parseFloat(p.purchasePrice) || 0));
    }, 0);

    const totalRetailValue = products.reduce((sum, p) => {
      return sum + ((p.currentStock || 0) * (parseFloat(p.retailPrice) || 0));
    }, 0);

    const potentialProfit = totalRetailValue - totalPurchaseValue;
    const profitMargin = totalPurchaseValue > 0
      ? ((potentialProfit / totalPurchaseValue) * 100).toFixed(2)
      : 0;

    // Productos con bajo stock
    const lowStockProducts = products.filter(p =>
      p.currentStock <= p.minStock
    ).length;

    // Productos sin stock
    const outOfStockProducts = products.filter(p =>
      (p.currentStock || 0) === 0
    ).length;

    // Distribución por categorías
    const categoryDistribution = products.reduce((acc, product) => {
      const categoryName = product.category?.name || 'Sin categoría';
      if (!acc[categoryName]) {
        acc[categoryName] = {
          count: 0,
          totalStock: 0,
          purchaseValue: 0,
          retailValue: 0
        };
      }
      acc[categoryName].count += 1;
      acc[categoryName].totalStock += product.currentStock || 0;
      acc[categoryName].purchaseValue += (product.currentStock || 0) * (parseFloat(product.purchasePrice) || 0);
      acc[categoryName].retailValue += (product.currentStock || 0) * (parseFloat(product.retailPrice) || 0);
      return acc;
    }, {});

    // Convertir a array y ordenar
    const categoryStats = Object.entries(categoryDistribution)
      .map(([name, stats]) => ({
        category: name,
        ...stats,
        profit: stats.retailValue - stats.purchaseValue
      }))
      .sort((a, b) => b.retailValue - a.retailValue);

    // Distribución por marcas
    const brandDistribution = products.reduce((acc, product) => {
      const brandName = product.brand?.name || 'Sin marca';
      if (!acc[brandName]) {
        acc[brandName] = {
          count: 0,
          totalStock: 0,
          purchaseValue: 0,
          retailValue: 0
        };
      }
      acc[brandName].count += 1;
      acc[brandName].totalStock += product.currentStock || 0;
      acc[brandName].purchaseValue += (product.currentStock || 0) * (parseFloat(product.purchasePrice) || 0);
      acc[brandName].retailValue += (product.currentStock || 0) * (parseFloat(product.retailPrice) || 0);
      return acc;
    }, {});

    const brandStats = Object.entries(brandDistribution)
      .map(([name, stats]) => ({
        brand: name,
        ...stats,
        profit: stats.retailValue - stats.purchaseValue
      }))
      .sort((a, b) => b.retailValue - a.retailValue)
      .slice(0, 10); // Top 10 marcas

    // Productos más valiosos en inventario
    const topValueProducts = products
      .map(p => ({
        id: p.id,
        name: p.name,
        category: p.category?.name || 'Sin categoría',
        brand: p.brand?.name || 'Sin marca',
        currentStock: p.currentStock || 0,
        purchasePrice: parseFloat(p.purchasePrice) || 0,
        retailPrice: parseFloat(p.retailPrice) || 0,
        totalPurchaseValue: (p.currentStock || 0) * (parseFloat(p.purchasePrice) || 0),
        totalRetailValue: (p.currentStock || 0) * (parseFloat(p.retailPrice) || 0),
        potentialProfit: ((p.currentStock || 0) * (parseFloat(p.retailPrice) || 0)) -
                        ((p.currentStock || 0) * (parseFloat(p.purchasePrice) || 0))
      }))
      .sort((a, b) => b.totalRetailValue - a.totalRetailValue)
      .slice(0, 20);

    // Respuesta final
    res.json({
      summary: {
        totalProducts,
        totalItems,
        totalPurchaseValue: parseFloat(totalPurchaseValue.toFixed(2)),
        totalRetailValue: parseFloat(totalRetailValue.toFixed(2)),
        potentialProfit: parseFloat(potentialProfit.toFixed(2)),
        profitMargin: parseFloat(profitMargin),
        lowStockProducts,
        outOfStockProducts
      },
      categoryStats,
      brandStats,
      topValueProducts,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};
