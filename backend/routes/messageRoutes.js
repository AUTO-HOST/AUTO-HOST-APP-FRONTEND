const express = require('express');
const router = express.Router();
const { admin } = require('../firebaseAdmin'); // Para verificar el token y acceder a admin.firestore()

const authMiddleware = require('../middleware/authMiddleware').authMiddleware; // Importar el middleware

// --- RUTA PARA ENVIAR UN NUEVO MENSAJE (POST /api/messages) ---
router.post('/', authMiddleware, async (req, res) => {
  console.log("DEBUG: Solicitud POST /api/messages recibida.");
  try {
    const { senderId, senderEmail, receiverId, receiverEmail, productId, productName, content } = req.body;

    if (!senderId || !receiverId || !content) {
      console.error("Error de validación: Datos de mensaje incompletos.");
      return res.status(400).json({ message: 'Datos de mensaje incompletos (remitente, receptor o contenido).' });
    }

    const messagesCollection = admin.firestore().collection('messages'); 
    
    const newMessage = {
      senderId,
      senderEmail,
      receiverId,
      receiverEmail,
      productId,
      productName,
      content,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      read: false 
    };

    const docRef = await messagesCollection.add(newMessage);

    console.log("DEBUG: Mensaje guardado en Firestore con ID:", docRef.id);
    res.status(201).json({ message: 'Mensaje enviado con éxito', messageId: docRef.id });

  } catch (error) {
    console.error("Error en la ruta POST /api/messages:", error);
    res.status(500).json({ message: 'Error interno del servidor al enviar el mensaje.', error: error.message });
  }
});

// --- RUTA PARA OBTENER CONVERSACIONES DEL USUARIO (GET /api/messages/conversations) ---
router.get('/conversations', authMiddleware, async (req, res) => {
  console.log("DEBUG: Solicitud GET /api/messages/conversations recibida.");
  try {
    const userId = req.user.userId; // El UID del usuario logueado, obtenido del authMiddleware

    if (!userId) {
      return res.status(400).json({ message: 'ID de usuario no proporcionado.' });
    }

    const messagesCollection = admin.firestore().collection('messages');

    // Buscar mensajes donde el usuario es el remitente O el receptor
    const sentMessagesSnapshot = await messagesCollection
      .where('senderId', '==', userId)
      .get();
    
    const receivedMessagesSnapshot = await messagesCollection
      .where('receiverId', '==', userId)
      .get();

    // Combinar todos los mensajes (enviados y recibidos)
    const allMessages = [];
    sentMessagesSnapshot.forEach(doc => allMessages.push(doc.data()));
    receivedMessagesSnapshot.forEach(doc => allMessages.push(doc.data()));

    // Procesar para agrupar por conversación (un ID de producto y los dos participantes)
    const conversationsMap = new Map(); // Mapa para almacenar conversaciones únicas

    allMessages.forEach(msg => {
      // Crear una clave única para la conversación basada en productId y los dos UIDs
      // El orden de los UIDs no importa para la clave
      const participants = [msg.senderId, msg.receiverId].sort().join('-');
      const conversationKey = `${msg.productId}-${participants}`;

      if (!conversationsMap.has(conversationKey)) {
        conversationsMap.set(conversationKey, {
          productId: msg.productId,
          productName: msg.productName,
          lastMessage: msg.content,
          lastMessageTimestamp: msg.timestamp,
          otherParticipantId: msg.senderId === userId ? msg.receiverId : msg.senderId,
          otherParticipantEmail: msg.senderId === userId ? msg.receiverEmail : msg.senderEmail,
          unreadCount: 0 // Esto es un placeholder. Con lógica de lectura sería dinámico
        });
      } else {
        // Si ya existe la conversación, actualizamos el último mensaje si es más reciente
        const existingConv = conversationsMap.get(conversationKey);
        if (msg.timestamp.toDate() > existingConv.lastMessageTimestamp.toDate()) {
          existingConv.lastMessage = msg.content;
          existingConv.lastMessageTimestamp = msg.timestamp;
        }
      }
    });

    // Convertir el mapa a un array y ordenar por el último mensaje (más reciente primero)
    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => b.lastMessageTimestamp.toDate() - a.lastMessageTimestamp.toDate());

    console.log(`DEBUG: ${conversations.length} conversaciones encontradas para ${userId}.`);
    res.status(200).json(conversations);

  } catch (error) {
    console.error("Error en la ruta GET /api/messages/conversations:", error);
    res.status(500).json({ message: 'Error interno del servidor al obtener conversaciones.', error: error.message });
  }
});

// --- RUTA PARA OBTENER MENSAJES DE UNA CONVERSACIÓN ESPECÍFICA (GET /api/messages/:productId/:otherUserId) ---
// Esta ruta la implementaremos después, si necesitas ver el historial completo de un chat.
router.get('/:productId/:otherUserId', authMiddleware, async (req, res) => {
  console.log(`DEBUG: Solicitud GET /api/messages/${req.params.productId}/${req.params.otherUserId} recibida.`);
  try {
    const userId = req.user.userId;
    const { productId, otherUserId } = req.params;

    if (!userId || !productId || !otherUserId) {
      return res.status(400).json({ message: 'Parámetros de conversación incompletos.' });
    }

    const messagesCollection = admin.firestore().collection('messages');

    // Buscar mensajes donde los participantes son userId y otherUserId Y el productId
    // Se asegura que ambos IDs estén presentes en senderId O receiverId
    const messages = await messagesCollection
      .where('productId', '==', productId)
      .where('senderId', 'in', [userId, otherUserId]) // sender es uno de los dos
      .where('receiverId', 'in', [userId, otherUserId]) // receiver es el otro
      .orderBy('timestamp', 'asc') // Ordenar por fecha para mostrar la conversación
      .get();

    // Filtro adicional en caso de que las condiciones de Firestore no sean exclusivas
    const conversationMessages = [];
    messages.forEach(doc => {
        const msg = doc.data();
        // Asegurarse que el mensaje es entre los dos usuarios y no un tercero con el mismo productID
        if (
            (msg.senderId === userId && msg.receiverId === otherUserId) ||
            (msg.senderId === otherUserId && msg.receiverId === userId)
        ) {
            conversationMessages.push({ id: doc.id, ...msg });
        }
    });

    console.log(`DEBUG: ${conversationMessages.length} mensajes encontrados para la conversación ${productId}.`);
    res.status(200).json(conversationMessages);

  } catch (error) {
    console.error("Error en la ruta GET /api/messages/:productId/:otherUserId:", error);
    res.status(500).json({ message: 'Error interno del servidor al obtener mensajes de conversación.', error: error.message });
  }
});

// --- RUTA PARA ENVIAR RESPUESTA A UN MENSAJE (POST /api/messages/reply) ---
// Se reutiliza la lógica de envío de mensajes, pero con contexto de conversación
router.post('/reply', authMiddleware, async (req, res) => {
  console.log("DEBUG: Solicitud POST /api/messages/reply recibida.");
  try {
    const { receiverId, productId, productName, content } = req.body;
    const senderId = req.user.userId;
    const senderEmail = req.user.email; // Email del remitente desde el token

    if (!senderId || !receiverId || !productId || !content) {
      console.error("Error de validación: Datos de respuesta incompletos.");
      return res.status(400).json({ message: 'Datos de respuesta incompletos.' });
    }

    // Opcional: Obtener el email del receptor si no se envía, buscando en Firestore users
    let receiverEmail = req.body.receiverEmail; // Si ya se envía desde el frontend
    if (!receiverEmail) {
        const receiverDoc = await admin.firestore().collection('users').doc(receiverId).get();
        if (receiverDoc.exists) {
            receiverEmail = receiverDoc.data().email;
        }
    }


    const messagesCollection = admin.firestore().collection('messages');
    
    const newMessage = {
      senderId,
      senderEmail,
      receiverId,
      receiverEmail,
      productId,
      productName,
      content,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      read: false
    };

    const docRef = await messagesCollection.add(newMessage);

    console.log("DEBUG: Respuesta guardada en Firestore con ID:", docRef.id);
    res.status(201).json({ message: 'Respuesta enviada con éxito', messageId: docRef.id });

  } catch (error) {
    console.error("Error en la ruta POST /api/messages/reply:", error);
    res.status(500).json({ message: 'Error interno del servidor al enviar respuesta.', error: error.message });
  }
});


module.exports = router;