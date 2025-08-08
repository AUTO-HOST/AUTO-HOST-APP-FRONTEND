import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import OrderDetailModal from '../components/OrderDetailModal'; // <-- PASO 1: Importar el nuevo modal

const OrderHistoryPage = () => {
    const navigate = useNavigate();
    const { currentUser, loadingAuth } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- PASO 2: Añadir estados para controlar el modal ---
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // --- FIN ---

    const fetchOrders = useCallback(async () => {
        if (loadingAuth || !currentUser) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const userId = currentUser.uid;
            const ordersCollectionRef = collection(db, "orders");
            const q = query(
                ordersCollectionRef,
                where("buyerId", "==", userId),
                orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(q);
            const fetchedOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setOrders(fetchedOrders);
        } catch (err) {
            setError("No se pudieron cargar tus pedidos.");
        } finally {
            setLoading(false);
        }
    }, [currentUser, loadingAuth]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // --- PASO 3: Crear funciones para abrir y cerrar el modal ---
    const handleViewDetails = (orderId) => {
        setSelectedOrderId(orderId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrderId(null);
    };
    // --- FIN ---

    if (loadingAuth || loading) {
        return <div className="text-center mt-20">Cargando tus pedidos...</div>;
    }

    if (error) {
        return <div className="text-center mt-20 text-red-600">{error}</div>;
    }

    // ... (El resto de tus validaciones y retornos no cambian)

    return (
        <div className="container mx-auto p-8 my-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-blue-800 text-center mb-6">Mis Pedidos</h2>
            {/* ... (Tu JSX para 'no hay pedidos' no cambia) ... */}

            {orders.length > 0 && (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-gray-50 p-6 rounded-lg shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold">Pedido ID: {order.id.substring(0, 8)}...</h3>
                                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                                    {order.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">Fecha: {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                            <p className="text-lg font-semibold text-blue-600 mb-4">Total: ${order.orderTotal.toLocaleString('es-MX')}</p>

                            {/* --- PASO 4: Conectar el botón para que llame a handleViewDetails --- */}
                            <div className="text-right mt-4">
                                <button
                                    onClick={() => handleViewDetails(order.id)}
                                    className="text-blue-600 hover:underline text-sm font-semibold"
                                >
                                    Ver Detalles del Pedido
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- PASO 5: Renderizar el modal cuando esté abierto --- */}
            <OrderDetailModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                orderId={selectedOrderId}
            />
        </div>
    );
};

export default OrderHistoryPage;