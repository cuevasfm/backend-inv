/**
 * Script para verificar el estado de la tabla de auditoría
 */

const { sequelize } = require('./src/config/database');
const AuditLog = require('./src/models/AuditLog');

async function checkAuditSystem() {
  try {
    console.log('\n🔍 Verificando sistema de auditoría...\n');

    // 1. Verificar conexión a la base de datos
    console.log('1. Probando conexión a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión exitosa\n');

    // 2. Verificar si la tabla existe
    console.log('2. Verificando si la tabla audit_logs existe...');
    const [results] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'audit_logs'
      );
    `);
    
    if (results[0].exists) {
      console.log('✅ La tabla audit_logs existe\n');
    } else {
      console.log('❌ La tabla audit_logs NO existe\n');
      console.log('Creando la tabla...');
      await AuditLog.sync({ force: false });
      console.log('✅ Tabla creada\n');
    }

    // 3. Contar registros existentes
    console.log('3. Contando registros en audit_logs...');
    const count = await AuditLog.count();
    console.log(`📊 Total de registros: ${count}\n`);

    // 4. Intentar crear un log de prueba
    console.log('4. Intentando crear un log de prueba...');
    const testLog = await AuditLog.create({
      userId: 1,
      username: 'test',
      action: 'TEST',
      module: 'system',
      description: 'Log de prueba para verificar funcionamiento',
      ipAddress: '127.0.0.1',
      userAgent: 'Test Script'
    });
    console.log('✅ Log de prueba creado con ID:', testLog.id);

    // 5. Consultar los últimos 5 logs
    console.log('\n5. Consultando últimos 5 logs...');
    const logs = await AuditLog.findAll({
      limit: 5,
      order: [['created_at', 'DESC']]
    });
    
    if (logs.length > 0) {
      console.log(`\n📋 Últimos ${logs.length} logs:`);
      logs.forEach((log, index) => {
        console.log(`\n${index + 1}. ${log.action} - ${log.module}`);
        console.log(`   Usuario: ${log.username || 'N/A'}`);
        console.log(`   Descripción: ${log.description}`);
        console.log(`   Fecha: ${log.created_at}`);
      });
    } else {
      console.log('⚠️  No hay logs en la base de datos\n');
    }

    // 6. Verificar estructura de la tabla
    console.log('\n6. Verificando estructura de la tabla...');
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'audit_logs'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Columnas de la tabla audit_logs:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });

    // 7. Limpiar log de prueba
    console.log('\n7. Limpiando log de prueba...');
    await testLog.destroy();
    console.log('✅ Log de prueba eliminado\n');

    console.log('✅ Verificación completa\n');
    console.log('='.repeat(60));
    console.log('RESUMEN:');
    console.log(`- Tabla existe: ✅`);
    console.log(`- Registros actuales: ${count}`);
    console.log(`- Sistema funcional: ✅`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error durante la verificación:', error.message);
    console.error('\nDetalles del error:');
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar verificación
checkAuditSystem();

