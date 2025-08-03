import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ConversationDetailModal = ({ isOpen, onClose, productId, otherUserId, productName, otherUserEmail }) => {
  const { currentUser, loadingAuth } = useAuth();
  const [messages, setMessages] = useState([]);
  const [replyContent, setReplyContent] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null); // Para hacer scroll automático al último mensaje

  // Función para obtener los mensajes de la conversación específica
  const fetchConversationMessages = useCallback(async () => {
    if (loadingAuth || !currentUser || !productId || !otherUserId) {
      setIsLoadingMessages(false);
      return;
    }

    setIsLoadingMessages(true);
    setError(null);

    try {
      const idToken = await currentUser.getIdToken();
      const response = await axios.get(`https://us-central1-blissful-land-465502-f0.cloudfunctions.net/api/api/messages/${productId}/${otherUserId}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      // Asegurarse de que los mensajes estén ordenados por timestamp
      const sortedMessages = response.data.map(msg => ({
        ...msg,
        // Convierte el objeto de timestamp de Firestore a un objeto Date de JS
        timestamp: msg.timestamp ? new Date(msg.timestamp._seconds * 1000) : null
      })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()); // Ordenar por fecha para mostrar cronológicamente

      setMessages(sortedMessages);
      setIsLoadingMessages(false);
      console.log("Mensajes de conversación obtenidos:", sortedMessages);
    } catch (err) {
      console.error("Error al obtener mensajes de la conversación:", err.response ? err.response.data : err.message);
      setError("No se pudo cargar la conversación.");
    } finally {
      setIsLoadingMessages(false);
    }
  }, [currentUser, loadingAuth, productId, otherUserId]);

  // Función para enviar una respuesta
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSendingReply(true);
    setError(null);

    try {
      const idToken = await currentUser.getIdToken();
      const response = await axios.post('https://us-central1-blissful-land-465502-f0.cloudfunctions.net/api/api/messages/reply', {
        receiverId: otherUserId,
        productId,
        productName,
        content: replyContent.trim(),
        receiverEmail: otherUserEmail, // Pasamos el email del receptor
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });

      console.log("Respuesta enviada:", response.data);
      setReplyContent(''); // Limpiar input
      // Volver a cargar los mensajes para ver la nueva respuesta (o añadirla directamente al estado)
      await fetchConversationMessages();
    } catch (err) {
      console.error("Error al enviar respuesta:", err.response ? err.response.data : err.message);
      setError("No se pudo enviar la respuesta.");
    } finally {
      setIsSendingReply(false);
    }
  };

  // Cargar mensajes cuando el modal se abre o los props cambian
  useEffect(() => {
    if (isOpen) { // Solo si el modal está abierto
      fetchConversationMessages();
    }
  }, [isOpen, fetchConversationMessages]);

  // Scroll al final de los mensajes cada vez que se actualizan
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  // Aquí, y solo aquí, va el return condicional si el modal no está abierto
  if (!isOpen) {
    return null;
  }

  return (
    // Fondo oscuro semitransparente del modal
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose} // Permite cerrar el modal haciendo clic fuera de él
    >
      {/* Contenedor del Modal */}
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl h-5/6 flex flex-col" // Altura fija y flex col
        onClick={e => e.stopPropagation()} // Evita que el modal se cierre al hacer clic dentro de él
      >
        {/* Encabezado del Modal */}
        <div className="p-4 border-b flex justify-between items-center bg-blue-600 text-white rounded-t-lg">
          <div>
            <h2 className="text-xl font-bold">Conversación con {otherUserEmail}</h2>
            <p className="text-sm">Sobre: {productName}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-full text-white hover:bg-blue-700">
            {/* Icono X de lucide-react eliminado. Puedes poner un texto o un SVG simple si lo necesitas. */}
            X
          </button>
        </div>

        {/* Cuerpo de Mensajes */}
        <div className="flex-grow p-4 overflow-y-auto space-y-4">
          {isLoadingMessages ? (
            <div className="text-center text-blue-600">Cargando mensajes...</div>
          ) : error ? (
            <div className="text-center text-red-600">{error}</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-600">No hay mensajes en esta conversación.</div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`flex ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] p-3 rounded-lg shadow-md ${
                  msg.senderId === currentUser.uid ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                }`}>
                  <p className="text-xs font-semibold mb-1">
                    {msg.senderId === currentUser.uid ? 'Tú' : msg.senderEmail || 'Usuario'}
                  </p>
                  <p>{msg.content}</p>
                  <p className="text-right text-xs mt-1 opacity-75">
                    {msg.timestamp ? msg.timestamp.toLocaleString() : ''}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Formulario de Respuesta */}
        <form onSubmit={handleSendReply} className="p-4 border-t bg-gray-50 flex items-center gap-2">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-grow p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            rows="1"
            disabled={isSendingReply || !currentUser}
            style={{ resize: 'none' }}
          ></textarea>
          <button
            type="submit"
            disabled={isSendingReply || !currentUser || !replyContent.trim()}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-gray-400"
          >
            {/* Icono Send de lucide-react eliminado. Puedes poner un SVG simple si lo necesitas o dejar solo texto. */}
            <span>&#10148;</span> {/* Ejemplo de flecha Unicode */}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConversationDetailModal;