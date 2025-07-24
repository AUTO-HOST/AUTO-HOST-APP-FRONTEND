// Importamos la instancia de admin de nuestro firebaseAdmin.js
const { admin } = require('../firebaseAdmin'); // <-- ¡IMPORTAMOS ADMIN AQUÍ!

const authMiddleware = async (req, res, next) => { // <-- Hacemos la función 'async'
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Acceso denegado. No se proporcionó un token.' });
  }

  const token = authHeader.split(' ')[1]; // Obtenemos el token

  try {
    // Verificamos el token usando el SDK de Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token); // <-- ¡CORRECCIÓN CLAVE AQUÍ!
    
    // Si el token es válido, adjuntamos la información del usuario a req.user
    req.user = { 
      userId: decodedToken.uid, // UID del usuario de Firebase
      email: decodedToken.email // Email del usuario
      // Puedes añadir más campos del token decodificado si los necesitas
    };

    console.log("DEBUG: authMiddleware procesado. Token válido para usuario:", req.user.userId); // Log de éxito
    next(); // Pasamos al siguiente middleware o a la lógica de la ruta
  } catch (error) {
    // Manejo de errores de verificación del token de Firebase
    console.error("DEBUG: Error al verificar token de Firebase:", error.message); // <-- Mensaje de error detallado
    
    let errorMessage = 'Token no es válido.';
    // Mensajes más específicos para el usuario si es necesario
    switch (error.code) {
        case 'auth/id-token-expired':
            errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.';
            break;
        case 'auth/argument-error': // Si el formato del token es incorrecto
            errorMessage = 'Formato de token inválido.';
            break;
        // Puedes añadir más casos según los errores de Firebase Admin SDK
    }

    res.status(401).json({ message: errorMessage });
  }
};

// La exportación correcta y limpia.
module.exports = { authMiddleware };