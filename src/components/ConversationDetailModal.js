import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config';

const ConversationDetailModal = ({ isOpen, onClose, conversation }) => {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [replyContent, setReplyContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);

    const fetchMessages = useCallback(async () => {
        if (!currentUser || !conversation?.id) return;
        setIsLoading(true);
        setError(null);
        try {
            const idToken = await currentUser.getIdToken();
            const response = await axios.get(`${API_BASE_URL}/messages/${conversation.id}/messages`, {
                headers: { 'Authorization': `Bearer ${idToken}` },
            });
            const formattedMessages = response.data.map(msg => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
            }));
            setMessages(formattedMessages);
        } catch (err) {
            console.error("Error al obtener mensajes:", err);
            setError("No se pudo cargar la conversación.");
        } finally {
            setIsLoading(false);
        }
    }, [currentUser, conversation]);

    useEffect(() => {
        if (isOpen) {
            fetchMessages();
        }
    }, [isOpen, fetchMessages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyContent.trim() || !currentUser) return;
        setIsSending(true);
        setError(null);
        try {
            const idToken = await currentUser.getIdToken();
            await axios.post(`${API_BASE_URL}/messages/reply/${conversation.id}`,
            {
                content: replyContent.trim(),
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
            });
            setReplyContent('');
            await fetchMessages(); // Recargar mensajes para ver la nueva respuesta
        } catch (err) {
            console.error("Error al enviar respuesta:", err);
            setError("No se pudo enviar la respuesta.");
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl h-5/6 flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center bg-blue-600 text-white rounded-t-lg">
                    <div>
                        <h2 className="text-xl font-bold">Conversación con {conversation.otherParticipantEmail}</h2>
                        <p className="text-sm">Sobre: {conversation.productName}</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-white hover:bg-blue-700">X</button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {isLoading ? <p>Cargando mensajes...</p> :
                     error ? <p className="text-red-500">{error}</p> :
                     messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-3 rounded-lg ${msg.senderId === currentUser.uid ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                                <p>{msg.content}</p>
                                <p className="text-right text-xs mt-1 opacity-75">{msg.timestamp.toLocaleTimeString()}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendReply} className="p-4 border-t bg-gray-50 flex items-center gap-2">
                    <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Escribe tu mensaje..."
                        className="flex-grow p-2 border rounded-lg"
                        rows="1"
                        disabled={isSending}
                    ></textarea>
                    <button type="submit" disabled={isSending || !replyContent.trim()} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-gray-400">
                        <span>&#10148;</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ConversationDetailModal;