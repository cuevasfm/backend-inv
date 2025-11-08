const bcrypt = require('bcryptjs');
const { User } = require('./src/models');
const { sequelize } = require('./src/config/database');

async function createAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    // Generar hash de la contraseña
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    console.log('\n🔐 Creando usuario administrador...');
    console.log('Usuario: admin');
    console.log('Contraseña: admin123');
    console.log('Hash generado:', passwordHash);

    // Buscar si el usuario ya existe
    const existingUser = await User.findOne({ where: { username: 'admin' } });

    if (existingUser) {
      // Actualizar contraseña usando query SQL directa (evita el hook que hashea nuevamente)
      await sequelize.query(
        'UPDATE users SET password_hash = :hash, updated_at = NOW() WHERE username = :username',
        {
          replacements: { hash: passwordHash, username: 'admin' }
        }
      );
      console.log('\n✅ Usuario admin actualizado correctamente');
    } else {
      // Crear nuevo usuario - IMPORTANTE: No pasar passwordHash, crear directamente en SQL
      await sequelize.query(
        `INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active, created_at, updated_at)
         VALUES (:username, :email, :hash, :firstName, :lastName, :role, :isActive, NOW(), NOW())`,
        {
          replacements: {
            username: 'admin',
            email: 'admin@licoreria.com',
            hash: passwordHash,
            firstName: 'Administrador',
            lastName: 'Sistema',
            role: 'admin',
            isActive: true
          }
        }
      );
      console.log('\n✅ Usuario admin creado correctamente');
    }

    console.log('\n📝 Credenciales de acceso:');
    console.log('   Usuario: admin');
    console.log('   Contraseña: admin123');
    console.log('\n✅ Ahora puedes iniciar sesión en el sistema');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
