/**
 * Script de Prueba del Sistema de Auditoría
 * 
 * Este script verifica que el sistema de auditoría esté funcionando correctamente
 * creando registros de prueba y consultando los logs generados.
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';
let authToken = null;
let testData = {
  brandId: null,
  categoryId: null,
  productId: null,
  customerId: null
};

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function login() {
  try {
    logInfo('Iniciando sesión...');
    const response = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    authToken = response.data.token;
    logSuccess('Login exitoso');
    return true;
  } catch (error) {
    logError(`Error en login: ${error.message}`);
    if (error.response) {
      logWarning('Asegúrate de tener un usuario admin con contraseña admin123');
      logWarning('Puedes crear uno con: node backend-inv/create-admin.js');
    }
    return false;
  }
}

async function createBrand() {
  try {
    logInfo('Creando marca de prueba...');
    const response = await axios.post(
      `${API_BASE}/brands`,
      {
        name: 'Marca Test Auditoría',
        description: 'Marca creada para probar el sistema de auditoría'
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    testData.brandId = response.data.brand.id;
    logSuccess(`Marca creada con ID: ${testData.brandId}`);
    return true;
  } catch (error) {
    logError(`Error creando marca: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function createCategory() {
  try {
    logInfo('Creando categoría de prueba...');
    const response = await axios.post(
      `${API_BASE}/categories`,
      {
        name: 'Categoría Test Auditoría',
        description: 'Categoría creada para probar el sistema de auditoría'
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    testData.categoryId = response.data.category.id;
    logSuccess(`Categoría creada con ID: ${testData.categoryId}`);
    return true;
  } catch (error) {
    logError(`Error creando categoría: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function createProduct() {
  try {
    logInfo('Creando producto de prueba...');
    const response = await axios.post(
      `${API_BASE}/products`,
      {
        name: 'Producto Test Auditoría',
        sku: 'TEST-AUDIT-001',
        barcode: '1234567890123',
        categoryId: testData.categoryId,
        brandId: testData.brandId,
        retailPrice: 100.00,
        wholesalePrice: 80.00,
        currentStock: 50,
        reorderPoint: 10,
        isActive: true
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    testData.productId = response.data.product.id;
    logSuccess(`Producto creado con ID: ${testData.productId}`);
    return true;
  } catch (error) {
    logError(`Error creando producto: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function updateProduct() {
  try {
    logInfo('Actualizando producto...');
    await axios.put(
      `${API_BASE}/products/${testData.productId}`,
      {
        retailPrice: 120.00,
        wholesalePrice: 95.00
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    logSuccess('Producto actualizado exitosamente');
    return true;
  } catch (error) {
    logError(`Error actualizando producto: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function adjustStock() {
  try {
    logInfo('Ajustando stock del producto...');
    await axios.post(
      `${API_BASE}/products/${testData.productId}/adjust-stock`,
      {
        quantity: 25,
        notes: 'Ajuste de prueba para auditoría'
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    logSuccess('Stock ajustado exitosamente (+25 unidades)');
    return true;
  } catch (error) {
    logError(`Error ajustando stock: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function createCustomer() {
  try {
    logInfo('Creando cliente de prueba...');
    const response = await axios.post(
      `${API_BASE}/customers`,
      {
        customerType: 'individual',
        firstName: 'Cliente Test',
        lastName: 'Auditoría',
        phone: '5551234567',
        email: 'test-audit@example.com',
        isWholesale: false
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    testData.customerId = response.data.id;
    logSuccess(`Cliente creado con ID: ${testData.customerId}`);
    return true;
  } catch (error) {
    logError(`Error creando cliente: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function getAuditLogs() {
  try {
    logInfo('Consultando logs de auditoría...');
    const response = await axios.get(
      `${API_BASE}/audit-logs?limit=50`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const logs = response.data.logs;
    const total = response.data.pagination.total;
    
    logSuccess(`Se encontraron ${total} logs de auditoría`);
    
    // Mostrar últimos 10 logs
    log('\n' + '='.repeat(80), 'cyan');
    log('ÚLTIMOS LOGS DE AUDITORÍA', 'cyan');
    log('='.repeat(80), 'cyan');
    
    logs.slice(0, 10).forEach((log, index) => {
      console.log(`\n${index + 1}. ${log.action} - ${log.module}`);
      console.log(`   Usuario: ${log.username || 'N/A'}`);
      console.log(`   Descripción: ${log.description}`);
      console.log(`   Fecha: ${new Date(log.created_at).toLocaleString('es-ES')}`);
      if (log.entityName) {
        console.log(`   Entidad: ${log.entityName}`);
      }
    });
    
    log('\n' + '='.repeat(80), 'cyan');
    
    return true;
  } catch (error) {
    logError(`Error consultando logs: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function getAuditStats() {
  try {
    logInfo('Consultando estadísticas de auditoría...');
    const response = await axios.get(
      `${API_BASE}/audit-logs/stats`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    const stats = response.data;
    
    log('\n' + '='.repeat(80), 'cyan');
    log('ESTADÍSTICAS DE AUDITORÍA', 'cyan');
    log('='.repeat(80), 'cyan');
    
    console.log(`\nTotal de logs: ${stats.total}`);
    
    console.log('\nLogs por módulo:');
    stats.byModule.forEach(item => {
      console.log(`  - ${item.module}: ${item.count}`);
    });
    
    console.log('\nLogs por acción:');
    stats.byAction.forEach(item => {
      console.log(`  - ${item.action}: ${item.count}`);
    });
    
    console.log('\nUsuarios más activos:');
    stats.topUsers.slice(0, 5).forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.username}: ${item.count} acciones`);
    });
    
    log('\n' + '='.repeat(80), 'cyan');
    
    logSuccess('Estadísticas consultadas exitosamente');
    return true;
  } catch (error) {
    logError(`Error consultando estadísticas: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

async function cleanup() {
  try {
    logInfo('Limpiando datos de prueba...');
    
    // Eliminar producto
    if (testData.productId) {
      await axios.delete(
        `${API_BASE}/products/${testData.productId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      logSuccess('Producto eliminado');
    }
    
    // Eliminar marca
    if (testData.brandId) {
      await axios.delete(
        `${API_BASE}/brands/${testData.brandId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      logSuccess('Marca eliminada');
    }
    
    // Eliminar categoría
    if (testData.categoryId) {
      await axios.delete(
        `${API_BASE}/categories/${testData.categoryId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      logSuccess('Categoría eliminada');
    }
    
    // Eliminar cliente
    if (testData.customerId) {
      await axios.delete(
        `${API_BASE}/customers/${testData.customerId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      logSuccess('Cliente eliminado');
    }
    
    return true;
  } catch (error) {
    logWarning(`Error en limpieza: ${error.message}`);
    logWarning('Algunos registros de prueba pueden no haberse eliminado');
    return false;
  }
}

async function logout() {
  try {
    logInfo('Cerrando sesión...');
    await axios.post(
      `${API_BASE}/auth/logout`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    logSuccess('Logout exitoso');
    return true;
  } catch (error) {
    logError(`Error en logout: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.clear();
  log('='.repeat(80), 'cyan');
  log('PRUEBA DEL SISTEMA DE AUDITORÍA', 'cyan');
  log('='.repeat(80), 'cyan');
  
  logInfo('Iniciando pruebas del sistema de auditoría...\n');
  
  // Verificar que el servidor esté corriendo
  try {
    await axios.get(`${API_BASE.replace('/api', '')}/health`);
    logSuccess('Servidor backend está corriendo\n');
  } catch (error) {
    logError('El servidor backend no está corriendo');
    logWarning('Por favor inicia el servidor con: cd backend-inv && npm start');
    process.exit(1);
  }
  
  let success = true;
  
  // 1. Login (genera log de LOGIN)
  success = await login() && success;
  if (!success) {
    process.exit(1);
  }
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 2. Crear marca (genera log de CREATE en brands)
  success = await createBrand() && success;
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 3. Crear categoría (genera log de CREATE en categories)
  success = await createCategory() && success;
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 4. Crear producto (genera log de CREATE en products)
  success = await createProduct() && success;
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 5. Actualizar producto (genera log de UPDATE en products)
  success = await updateProduct() && success;
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 6. Ajustar stock (genera log de UPDATE en products)
  success = await adjustStock() && success;
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 7. Crear cliente (genera log de CREATE en customers)
  success = await createCustomer() && success;
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 8. Consultar logs de auditoría
  success = await getAuditLogs() && success;
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 9. Consultar estadísticas
  success = await getAuditStats() && success;
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 10. Limpiar datos de prueba
  log('\n');
  success = await cleanup() && success;
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 11. Logout (genera log de LOGOUT)
  success = await logout() && success;
  
  // Resultado final
  log('\n' + '='.repeat(80), 'cyan');
  if (success) {
    logSuccess('✅ TODAS LAS PRUEBAS PASARON EXITOSAMENTE');
    log('='.repeat(80), 'cyan');
    log('\nEl sistema de auditoría está funcionando correctamente.', 'green');
    log('Verifica los logs generados en la interfaz web o en la base de datos.\n', 'green');
  } else {
    logError('❌ ALGUNAS PRUEBAS FALLARON');
    log('='.repeat(80), 'cyan');
    log('\nRevisa los errores anteriores para más detalles.\n', 'red');
  }
}

// Ejecutar pruebas
runTests().catch(error => {
  logError(`Error inesperado: ${error.message}`);
  console.error(error);
  process.exit(1);
});

