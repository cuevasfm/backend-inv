const { sequelize } = require('../config/database');

// Importar todos los modelos
const Category = require('./Category');
const Brand = require('./Brand');
const ProductType = require('./ProductType');
const UnitType = require('./UnitType');
const Product = require('./Product');
const Supplier = require('./Supplier');
const Customer = require('./Customer');
const User = require('./User');
const InventoryMovement = require('./InventoryMovement');
const Sale = require('./Sale');
const SaleItem = require('./SaleItem');
const PurchaseOrder = require('./PurchaseOrder');
const PurchaseOrderItem = require('./PurchaseOrderItem');
const PromoterRoute = require('./PromoterRoute');
const RouteCustomer = require('./RouteCustomer');
const CustomerVisit = require('./CustomerVisit');
const OfflineSyncQueue = require('./OfflineSyncQueue');

// Definir relaciones

// Product relationships
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Product.belongsTo(Brand, { foreignKey: 'brandId', as: 'brand' });
Product.belongsTo(ProductType, { foreignKey: 'productTypeId', as: 'productType' });
Product.belongsTo(UnitType, { foreignKey: 'unitTypeId', as: 'unitType' });

Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Brand.hasMany(Product, { foreignKey: 'brandId', as: 'products' });
ProductType.hasMany(Product, { foreignKey: 'productTypeId', as: 'products' });
UnitType.hasMany(Product, { foreignKey: 'unitTypeId', as: 'products' });

// Sale relationships
Sale.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Sale.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Sale.hasMany(SaleItem, { foreignKey: 'saleId', as: 'items' });

Customer.hasMany(Sale, { foreignKey: 'customerId', as: 'sales' });
User.hasMany(Sale, { foreignKey: 'userId', as: 'sales' });

// SaleItem relationships
SaleItem.belongsTo(Sale, { foreignKey: 'saleId', as: 'sale' });
SaleItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasMany(SaleItem, { foreignKey: 'productId', as: 'saleItems' });

// InventoryMovement relationships
InventoryMovement.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
InventoryMovement.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Product.hasMany(InventoryMovement, { foreignKey: 'productId', as: 'movements' });
User.hasMany(InventoryMovement, { foreignKey: 'userId', as: 'inventoryMovements' });

// PurchaseOrder relationships
PurchaseOrder.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });
PurchaseOrder.belongsTo(User, { foreignKey: 'userId', as: 'user' });
PurchaseOrder.hasMany(PurchaseOrderItem, { foreignKey: 'purchaseOrderId', as: 'items' });

Supplier.hasMany(PurchaseOrder, { foreignKey: 'supplierId', as: 'purchaseOrders' });
User.hasMany(PurchaseOrder, { foreignKey: 'userId', as: 'purchaseOrders' });

// PurchaseOrderItem relationships
PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: 'purchaseOrderId', as: 'purchaseOrder' });
PurchaseOrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasMany(PurchaseOrderItem, { foreignKey: 'productId', as: 'purchaseOrderItems' });

// PromoterRoute relationships
PromoterRoute.belongsTo(User, { foreignKey: 'promoterId', as: 'promoter' });
PromoterRoute.hasMany(RouteCustomer, { foreignKey: 'routeId', as: 'routeCustomers' });

User.hasMany(PromoterRoute, { foreignKey: 'promoterId', as: 'routes' });

// RouteCustomer relationships
RouteCustomer.belongsTo(PromoterRoute, { foreignKey: 'routeId', as: 'route' });
RouteCustomer.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

Customer.hasMany(RouteCustomer, { foreignKey: 'customerId', as: 'routeCustomers' });

// CustomerVisit relationships
CustomerVisit.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
CustomerVisit.belongsTo(User, { foreignKey: 'promoterId', as: 'promoter' });
CustomerVisit.belongsTo(Sale, { foreignKey: 'saleId', as: 'sale' });

Customer.hasMany(CustomerVisit, { foreignKey: 'customerId', as: 'visits' });
User.hasMany(CustomerVisit, { foreignKey: 'promoterId', as: 'visits' });

// OfflineSyncQueue relationships
OfflineSyncQueue.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(OfflineSyncQueue, { foreignKey: 'userId', as: 'syncQueue' });

// Exportar todos los modelos y sequelize
module.exports = {
  sequelize,
  Category,
  Brand,
  ProductType,
  UnitType,
  Product,
  Supplier,
  Customer,
  User,
  InventoryMovement,
  Sale,
  SaleItem,
  PurchaseOrder,
  PurchaseOrderItem,
  PromoterRoute,
  RouteCustomer,
  CustomerVisit,
  OfflineSyncQueue
};
