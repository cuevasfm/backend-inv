const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./src/models');

async function checkAndSeed() {
  try {
    console.log('🔍 Verificando base de datos...');
    
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a base de datos OK');
    
    // Contar usuarios
    const userCount = await User.count();
    console.log(`📊 Usuarios en la base de datos: ${userCount}`);
    
    // Verificar si existe el usuario admin
    const adminUser = await User.findOne({ where: { username: 'admin' } });
    
    if (adminUser) {
      console.log('✅ Usuario admin existe');
      console.log(`   - ID: ${adminUser.id}`);
      console.log(`   - Username: ${adminUser.username}`);
      console.log(`   - Role: ${adminUser.role}`);
    } else {
      console.log('❌ Usuario admin NO existe');
      console.log('🔧 Creando usuario admin...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const newAdmin = await User.create({
        username: 'admin',
        password: hashedPassword,
        fullName: 'Administrador',
        role: 'admin',
        email: 'admin@licoreria.com',
        isActive: true
      });
      
      console.log('✅ Usuario admin creado exitosamente');
      console.log(`   - ID: ${newAdmin.id}`);
      console.log(`   - Username: ${newAdmin.username}`);
      console.log(`   - Password: admin123`);
    }
    
    // Listar todos los usuarios
    console.log('\n📋 Lista de todos los usuarios:');
    const allUsers = await User.findAll({
      attributes: ['id', 'username', 'fullName', 'role', 'isActive']
    });
    
    allUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.role}) - ${user.isActive ? 'Activo' : 'Inactivo'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAndSeed();

