const mongoose = require('mongoose');

// --- Modelo de Mensaje ---
// Este esquema define la estructura de un único mensaje.

const messageSchema = new mongoose.Schema(
  {
    // 'conversationId' vincula este mensaje a una conversación específica.
    // Es la forma en que sabemos a qué "carpeta" de conversación pertenece este mensaje.
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation', // Hace referencia al modelo 'Conversation' que acabamos de crear.
      required: true,
    },
    // 'sender' es el ID del usuario que envió el mensaje.
    // Nos permite saber quién dijo qué y alinear los mensajes a la izquierda o derecha en la interfaz del chat.
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Hace referencia al modelo 'User'.
      required: true,
    },
    // 'text' es el contenido del mensaje en sí.
    text: {
      type: String,
      required: true,
    },
    // 'isRead' nos ayudará en el futuro a saber si el receptor ya leyó el mensaje.
    // Por defecto, un mensaje nuevo no está leído.
    isRead: {
        type: Boolean,
        default: false,
    }
  },
  {
    // 'timestamps' añade automáticamente la fecha y hora de creación (`createdAt`)
    // para cada mensaje, permitiéndonos mostrarlos en orden cronológico.
    timestamps: true,
  }
);

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
