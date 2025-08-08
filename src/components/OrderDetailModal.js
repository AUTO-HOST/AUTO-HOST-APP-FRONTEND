import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config';

const OrderDetailModal = ({ isOpen, onClose, orderId }) => {
    const { currentUser } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchOrderDetails = useCallback(async () => {
        if (!orderId || !currentUser) return;

        setLoading(true);
        setError(null);
        try {
            const idToken = await currentUser.getIdToken();
            const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`, {
                headers: { 'Authorization': `Bearer ${idToken}` },
            });
            setOrder(response.data);
        } catch (err) {
            console.error("Error fetching order details:", err);
            setError("No se pudieron cargar los detalles del pedido.");
        } finally {
            setLoading(false);
        }
    }, [orderId, currentUser]);

    useEffect(() => {
        if (isOpen) {
            fetchOrderDetails();
        }
    }, [isOpen, fetchOrderDetails]);

    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">Detalles del Pedido</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 font-bold">X</button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {loading && <p className="text-center">Cargando...</p>}
                    {error && <p className="text-center text-red-500">{error}</p>}
                    {order && (
                        <div className="space-y-4">
                            <div>
                                <p><strong>ID del Pedido:</strong> <span className="text-gray-600">{order.id}</span></p>
                                <p><strong>Fecha:</strong> <span className="text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</span></p>
                                <p><strong>Total:</strong> <span className="font-bold text-blue-600">${order.orderTotal.toLocaleString('es-MX')}</span></p>
                                <p><strong>Estado:</strong> <span className="font-semibold text-green-600">{order.status}</span></p>
                            </div>
                            
                            <div className="border-t pt-4">
                                <h4 className="font-semibold text-lg mb-2">Productos:</h4>
                                <div className="space-y-3">
                                    {order.items.map(item => (
                                        <div key={item.productId} className="flex items-center">
                                            <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-md object-cover mr-4" />
                                            <div>
                                                <p className="font-semibold">{item.name}</p>
                                                <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                                                <p className="text-sm text-gray-600">Precio: ${item.pricePerUnit.toLocaleString('es-MX')}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t bg-gray-50 text-right rounded-b-lg">
                    <button 
                        onClick={onClose}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;