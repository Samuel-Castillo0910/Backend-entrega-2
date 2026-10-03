require('dotenv').config();

const connectDB = require('./config/db');
const app = require('./app');

// Verificar variables de entorno obligatorias
const requeridas = ['MONGO_URI', 'JWT_SECRET'];
const faltantes = requeridas.filter((variable) => !process.env[variable]);

if (faltantes.length > 0) {
  console.error(`Faltan variables de entorno: ${faltantes.join(', ')}`);
  process.exit(1);
}

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});