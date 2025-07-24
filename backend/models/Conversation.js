const mongoose = require('mongoose');

// --- Modelo de Conversación ---
// Este esquema define una conversación entre dos o más usuarios.
// Su propósito principal es agrupar todos los mensajes que pertenecen
// a una misma interacción (por ejemplo, un comprador preguntando sobre un producto).

const conversationSchema = new mongoose.Schema(
  {
    // 'members' es un array que guardará los IDs de los usuarios que participan en la conversación.
    // Esto nos permitirá encontrar fácilmente todas las conversaciones de un usuario específico.
    // Por ejemplo: [ 'ID_del_comprador', 'ID_del_vendedor' ]
    members: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User', // Hace referencia al modelo 'User' que ya tenemos.
      required: true,
    },
    // También guardaremos una referencia al producto sobre el cual se está conversando.
    // Esto nos permitirá, en el futuro, mostrar la conversación en la página del producto.
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', // Hace referencia al modelo 'Product'.
      required: true,
    },
  },
  {
    // 'timestamps' añade automáticamente dos campos a cada conversación:
    // `createdAt`: la fecha y hora en que se creó la conversación.
    // `updatedAt`: la fecha y hora de la última vez que se actualizó (es decir, cuando se envió el último mensaje).
    // Esto es muy útil para ordenar las conversaciones de la más reciente a la más antigua.
    timestamps: true,
  }
);

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
// Exportamos el modelo de Conversación para que pueda ser utilizado en otras partes de la aplicación.
// Este modelo nos permitirá crear, leer y gestionar conversaciones entre usuarios de manera eficiente.
// Este modelo es esencial para implementar la funcionalidad de chat en nuestra aplicación,
// permitiendo a los usuarios comunicarse sobre productos específicos de manera organizada.
