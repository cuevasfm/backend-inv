# Backend - Sistema de Inventario para Licorería

Backend del sistema de inventario para licorería con capacidades PWA, construido con Node.js, Express y PostgreSQL.

## 🚀 Tecnologías

- **Node.js** & **Express.js** - Framework backend
- **PostgreSQL** - Base de datos relacional
- **Sequelize** - ORM para PostgreSQL
- **JWT** - Autenticación y autorización
- **Bcrypt** - Encriptación de contraseñas
- **Express Validator** - Validación de datos
- **Multer** - Manejo de archivos
- **Helmet** - Seguridad HTTP
- **Morgan** - Logger de peticiones

## 📋 Requisitos Previos

- Node.js (v16 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn

## 🔧 Instalación

### 1. Instalar dependencias

```bash
cd backend-inv
npm install
```

### 2. Configurar base de datos

#### Opción A: Usando psql (recomendado)

```bash
# Crear la base de datos y ejecutar el script de inicialización
psql -U miguelcuevas -d postgres -f src/config/init-db.sql
```

#### Opción B: Manualmente en PostgreSQL

```bash
# Conectarse a PostgreSQL
psql -U miguelcuevas

# Crear la base de datos
CREATE DATABASE licoreria_inventory;

# Salir y ejecutar el script
\q
psql -U miguelcuevas -d licoreria_inventory -f src/config/init-db.sql
```

### 3. Verificar variables de entorno

Las variables de entorno ya están configuradas en el archivo `.env`. Verifica que los valores sean correctos:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=licoreria_inventory
DB_USER=miguelcuevas
DB_PASSWORD=1234
PORT=3000
NODE_ENV=development
```

## 🏃 Ejecutar el servidor

### Modo desarrollo (con nodemon)

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

El servidor estará disponible en: `http://localhost:3000`

## 🔐 Usuario por defecto

El script de inicialización crea un usuario administrador por defecto:

- **Username:** `admin`
- **Email:** `admin@licoreria.com`
- **Password:** `admin123`
- **Role:** `admin`

**⚠️ IMPORTANTE:** Cambia esta contraseña en producción.

### Crear/Actualizar Usuario Admin

Si tienes problemas para iniciar sesión, ejecuta:

```bash
npm run create-admin
```

Este comando generará un hash válido para la contraseña y actualizará el usuario en la base de datos.

## 📚 Estructura del Proyecto

```
backend-inv/
├── src/
│   ├── config/          # Configuraciones (DB, auth)
│   ├── controllers/     # Controladores de la lógica de negocio
│   ├── models/          # Modelos de Sequelize
│   ├── routes/          # Definición de rutas/endpoints
│   ├── middleware/      # Middleware personalizado
│   ├── services/        # Servicios y lógica de negocio
│   ├── utils/           # Utilidades y helpers
│   ├── seeders/         # Seeds para datos iniciales
│   └── app.js           # Configuración de Express
├── tests/               # Tests
├── uploads/             # Archivos subidos
├── .env                 # Variables de entorno
├── .gitignore          # Archivos ignorados por git
├── package.json        # Dependencias
├── server.js           # Punto de entrada
└── README.md           # Este archivo
```

## 🌐 API Endpoints

### Autenticación

```
POST   /api/auth/login       - Login de usuario
POST   /api/auth/register    - Registrar usuario (admin only)
POST   /api/auth/refresh     - Refrescar token
GET    /api/auth/me          - Obtener usuario actual
POST   /api/auth/logout      - Logout
```

### Productos

```
GET    /api/products                  - Listar productos
GET    /api/products/:id              - Obtener producto por ID
GET    /api/products/barcode/:barcode - Buscar por código de barras
POST   /api/products                  - Crear producto
PUT    /api/products/:id              - Actualizar producto
DELETE /api/products/:id              - Eliminar producto (soft delete)
POST   /api/products/:id/adjust-stock - Ajustar stock
GET    /api/products/low-stock        - Productos con stock bajo
```

### Otros Endpoints

Los siguientes endpoints están preparados pero pendientes de implementación:

- `/api/categories` - Categorías
- `/api/brands` - Marcas
- `/api/product-types` - Tipos de producto
- `/api/unit-types` - Tipos de unidad
- `/api/sales` - Ventas / POS
- `/api/customers` - Clientes
- `/api/suppliers` - Proveedores
- `/api/purchase-orders` - Órdenes de compra
- `/api/reports` - Reportes
- `/api/dashboard` - Dashboard
- `/api/promoters` - Promotores y rutas
- `/api/visits` - Visitas de clientes
- `/api/mobile` - API móvil para PWA

## 🧪 Testing

```bash
npm test
```

## 📝 Roles de Usuario

El sistema maneja 5 roles diferentes:

- **admin**: Acceso completo al sistema
- **manager**: Gestión de inventario y reportes
- **cashier**: Punto de venta y consultas
- **warehouse**: Gestión de inventario y compras
- **promoter**: Acceso móvil para ventas en campo

## 🔒 Seguridad

- ✅ Autenticación JWT
- ✅ Encriptación de contraseñas con bcrypt
- ✅ Validación de datos
- ✅ Rate limiting
- ✅ CORS configurado
- ✅ Helmet para headers de seguridad
- ✅ Sanitización de inputs

## 🐛 Solución de Problemas

### Error de conexión a PostgreSQL

```bash
# Verificar que PostgreSQL esté corriendo
psql -U miguelcuevas -d postgres

# Verificar credenciales en .env
```

### Puerto 3000 ya en uso

```bash
# Cambiar el puerto en .env
PORT=3001
```

### Error al crear tablas

```bash
# Ejecutar nuevamente el script de inicialización
psql -U miguelcuevas -d licoreria_inventory -f src/config/init-db.sql
```

## 📈 Próximos Pasos

1. ✅ Estructura base del backend
2. ✅ Autenticación JWT
3. ✅ CRUD de productos
4. ⏳ Implementar controladores completos para todas las entidades
5. ⏳ Sistema de sincronización offline
6. ⏳ API móvil para promotores
7. ⏳ Reportes y dashboard
8. ⏳ Tests unitarios e integración

## 📄 Licencia

Este proyecto es privado y confidencial.

---

**Desarrollado para Sistema de Inventario de Licorería**
