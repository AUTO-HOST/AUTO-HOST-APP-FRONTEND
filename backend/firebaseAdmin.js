const admin = require('firebase-admin');
require('dotenv').config(); // Nos aseguramos de que las variables de entorno se carguen

// Este código asume que tu archivo de credenciales 'serviceAccountKey.json'
// está en la misma carpeta 'backend'.
try {
  const serviceAccount = require('./serviceAccountKey.json');

  // --- LECTURA DE LA VARIABLE DE ENTORNO (CORREGIDO) ---
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
  if (!storageBucket) {
    console.error('❌ ERROR: La variable de entorno FIREBASE_STORAGE_BUCKET no está definida en el archivo .env');
    process.exit(1);
  }

  // --- INICIALIZACIÓN DE FIREBASE ---
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: storageBucket // Ahora sí usamos la variable del archivo .env
  });

  // Este mensaje solo aparecerá si todo lo anterior funciona.
    console.log('✅ Firebase Admin SDK inicializado correctamente.');

  // Exportamos el objeto 'admin' para que otras partes de la app puedan usarlo.
  module.exports = { admin };

} catch (error) {
  console.error('❌ ERROR: No se pudo inicializar Firebase Admin SDK.');
  if (error.code === 'MODULE_NOT_FOUND') {
      console.error('Asegúrate de que el archivo "serviceAccountKey.json" exista en la carpeta "backend".');
  } else {
      console.error('Error original:', error.message);
  }
  process.exit(1);
}
