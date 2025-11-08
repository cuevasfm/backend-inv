const bcrypt = require('bcryptjs');
const { User } = require('./src/models');
const { sequelize } = require('./src/config/database');

async function testLogin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos\n');

    const user = await User.findOne({ where: { username: 'admin' } });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      process.exit(1);
    }

    console.log('👤 Usuario encontrado:');
    console.log('   Username:', user.username);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Hash:', user.passwordHash.substring(0, 30) + '...\n');

    // Probar con contraseña correcta
    const testPassword = 'admin123';
    const isValid = await bcrypt.compare(testPassword, user.passwordHash);

    console.log('🔐 Prueba de contraseña:');
    console.log('   Contraseña probada:', testPassword);
    console.log('   Resultado:', isValid ? '✅ CORRECTA' : '❌ INCORRECTA');

    // Probar con el método del modelo
    const isValidModel = await user.validatePassword(testPassword);
    console.log('   Método validatePassword:', isValidModel ? '✅ CORRECTA' : '❌ INCORRECTA');

    if (isValid && isValidModel) {
      console.log('\n✅ ¡Login funcionará correctamente!');
    } else {
      console.log('\n❌ Hay un problema con el hash');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testLogin();
