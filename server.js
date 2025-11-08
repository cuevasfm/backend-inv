const app = require('./src/app');
const { testConnection } = require('./src/config/database');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Iniciar servidor
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos. Verifica tu configuración.');
      process.exit(1);
    }

    // Iniciar servidor Express
    app.listen(PORT, () => {
      console.log('');
      console.log('='.repeat(50));
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log('='.repeat(50));
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejar errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Iniciar
startServer();
