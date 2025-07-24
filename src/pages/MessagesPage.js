import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
// Importamos la instancia de Firestore del frontend SDK si la vas a usar aquí para listeners en tiempo real
// import { db } from '../firebaseConfig'; 
// import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'; 
import ConversationDetailModal from '../components/ConversationDetailModal'; // <-- ¡Importamos el nuevo modal!

const MessagesPage = () => {
  const navigate = useNavigate();
  const { currentUser, loadingAuth } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Estados para controlar el modal de conversación ---
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null); // Almacena los datos de la conversación seleccionada

  const fetchConversations = useCallback(async () => {
    if (loadingAuth) return;

    if (!currentUser) {
      setLoading(false);
      setError("Debes iniciar sesión para ver tus mensajes.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const idToken = await currentUser.getIdToken();
      const response = await axios.get('http://localhost:5000/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      console.log("Conversaciones obtenidas:", response.data);
      // Asegurarse de que los timestamps se manejen como objetos Date para ordenar en frontend si es necesario
      const fetchedConversations = response.data.map(conv => ({
        ...conv,
        // Convierte el objeto de timestamp de Firestore a un objeto Date de JS para manejarlo en el frontend
        lastMessageTimestamp: conv.lastMessageTimestamp ? new Date(conv.lastMessageTimestamp._seconds * 1000) : null
      }));
      setConversations(fetchedConversations);
      setLoading(false);
    } catch (err) {
      console.error("Error al obtener conversaciones:", err.response ? err.response.data : err.message);
      setError("No se pudieron cargar tus conversaciones. Intenta de nuevo.");
      setLoading(false);
    }
  }, [currentUser, loadingAuth]);

  useEffect(() => {
    fetchConversations();
    // Opcional: Polling o listeners para actualizar conversaciones en tiempo real
    // const interval = setInterval(fetchConversations, 30000); // Recargar cada 30 segundos
    // return () => clearInterval(interval);
  }, [fetchConversations]);

  // --- Función para abrir el modal de conversación ---
  const handleViewConversation = (conv) => { // Ahora recibe el objeto de conversación completo
    setSelectedConversation(conv); // Guarda la conversación seleccionada
    setShowConversationModal(true); // Abre el modal
  };

  // Función para cerrar el modal de conversación
  const handleCloseConversationModal = () => {
    setShowConversationModal(false);
    setSelectedConversation(null); // Limpiar la selección
    fetchConversations(); // Recargar conversaciones para ver nuevos mensajes o estados de leído
  };

  if (loadingAuth || loading) {
    return <div className="text-center mt-20 text-blue-600 text-xl">Cargando tus mensajes...</div>;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-600 text-xl">{error}</div>;
  }

  if (!currentUser) {
    return (
      <div className="text-center mt-20">
        <p className="text-red-600 text-xl mb-4">Debes iniciar sesión para ver tus mensajes.</p>
        <button onClick={() => navigate('/login')} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
          Inicia Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 my-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-blue-800 text-center mb-6">Mis Mensajes</h2>
      <p className="text-gray-600 text-center mb-8">Aquí puedes ver todas tus conversaciones con otros usuarios.</p>

      {conversations.length === 0 ? (
        <p className="text-center text-gray-600 mt-10">No tienes conversaciones aún. Contacta a un vendedor desde un producto.</p>
      ) : (
        <div className="space-y-4">
          {conversations.map((conv) => (
            <div 
              key={`${conv.productId}-${conv.otherParticipantId}`} 
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 cursor-pointer"
              onClick={() => handleViewConversation(conv)} // <-- ¡Pasamos el objeto de conversación completo!
            >
              <div>
                <p className="text-lg font-semibold text-gray-800">
                  {conv.otherParticipantEmail ? `Con: ${conv.otherParticipantEmail}` : `Producto: ${conv.productName}`}
                </p>
                <p className="text-sm text-gray-700">Sobre: {conv.productName}</p>
                <p className="text-sm text-gray-500">Último mensaje: "{conv.lastMessage}"</p>
                <p className="text-xs text-gray-400">
                  {/* Ya convertido a Date en fetchConversations */}
                  {conv.lastMessageTimestamp ? conv.lastMessageTimestamp.toLocaleString() : 'Fecha desconocida'}
                </p>
              </div>
              {/* Opcional: Mostrar contador de no leídos */}
              {conv.unreadCount > 0 && (
                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">{conv.unreadCount}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* --- Renderiza el Modal de Detalle de Conversación --- */}
      {showConversationModal && selectedConversation && (
        <ConversationDetailModal 
          isOpen={showConversationModal}
          onClose={handleCloseConversationModal}
          productId={selectedConversation.productId}
          otherUserId={selectedConversation.otherParticipantId}
          productName={selectedConversation.productName}
          otherUserEmail={selectedConversation.otherParticipantEmail}
        />
      )}
    </div>
  );
};

export default MessagesPage;