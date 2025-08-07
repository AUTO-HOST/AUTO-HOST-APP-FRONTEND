import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config';
import ConversationDetailModal from '../components/ConversationDetailModal';

const MessagesPage = () => {
    const navigate = useNavigate();
    const { currentUser, loadingAuth } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedConversation, setSelectedConversation] = useState(null);

    const fetchConversations = useCallback(async () => {
        if (loadingAuth || !currentUser) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const idToken = await currentUser.getIdToken();
            const response = await axios.get(`${API_BASE_URL}/messages/conversations`, {
                headers: { 'Authorization': `Bearer ${idToken}` },
            });
            setConversations(response.data);
        } catch (err) {
            console.error("Error al obtener conversaciones:", err);
            setError("No se pudieron cargar tus conversaciones. Intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    }, [currentUser, loadingAuth]);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    const handleCloseConversationModal = () => {
        setSelectedConversation(null);
        fetchConversations(); // Recarga las conversaciones para ver el último mensaje actualizado
    };

    if (loadingAuth || loading) {
        return <div className="text-center mt-20">Cargando tus mensajes...</div>;
    }

    if (error) {
        return <div className="text-center mt-20 text-red-600">{error}</div>;
    }

    return (
        <div className="container mx-auto p-8 my-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-blue-800 text-center mb-8">Mis Mensajes</h2>
            {conversations.length === 0 ? (
                <p className="text-center text-gray-600">No tienes conversaciones aún.</p>
            ) : (
                <div className="space-y-4">
                    {conversations.map((conv) => (
                        <div
                            key={conv.id}
                            className="p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 cursor-pointer"
                            onClick={() => setSelectedConversation(conv)}
                        >
                            <p className="font-semibold">Con: {conv.otherParticipantEmail}</p>
                            <p className="text-sm text-gray-700">Sobre: {conv.productName}</p>
                            <p className="text-sm text-gray-500 italic">"{conv.lastMessageContent}"</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {new Date(conv.lastMessageAt).toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {selectedConversation && (
                <ConversationDetailModal
                    isOpen={!!selectedConversation}
                    onClose={handleCloseConversationModal}
                    conversation={selectedConversation}
                />
            )}
        </div>
    );
};

export default MessagesPage;