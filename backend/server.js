const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Importa cors
require('dotenv').config();

const app = express();

// Configuración de CORS: Permite todas las solicitudes de cualquier origen
// y maneja las solicitudes OPTIONS (preflight)
app.use(cors({
  origin: '*', // Permite cualquier origen. Para producción, cambiar a tu dominio específico
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
  preflightContinue: false, // No pasa a otros middlewares antes de la respuesta preflight
  optionsSuccessStatus: 204 // Código de estado para respuestas OPTIONS exitosas
}));
// Middleware para manejar el cuerpo de las solicitudes JSON y URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ ERROR: La variable de entorno MONGO_URI no está definida en el archivo .env');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado exitosamente'))
  .catch(err => {
    console.error('❌ ERROR al conectar con MongoDB:', err.message);
    process.exit(1);
  });

try {
  console.log("🔄 Cargando rutas...");

  const userRoutes = require('./routes/userRoutes');
  app.use('/api/users', userRoutes);
  console.log("✅ Rutas de usuario (/api/users) cargadas.");

  const productRoutes = require('./routes/productRoutes');
  app.use('/api/products', productRoutes);
  console.log("✅ Rutas de productos (/api/products) cargadas.");

  const messageRoutes = require('./routes/messageRoutes');
  app.use('/api/messages', messageRoutes);
  console.log("✅ Rutas de mensajes (/api/messages) cargadas.");
  
  console.log("🎉 Todas las rutas se cargaron exitosamente.");

} catch (error) {
    console.error('❌ ERROR FATAL AL CARGAR RUTAS:', error.message);
    process.exit(1);
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend arrancado en el puerto ${PORT}`);
});
