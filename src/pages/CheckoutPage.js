import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { db } from '../firebaseConfig';
import { collection, doc, getDocs } from 'firebase/firestore';
import axios from 'axios';
import API_BASE_URL from '../config';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { currentUser, loadingAuth } = useAuth();
    const { showInfoModal } = useUI();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCartItems = useCallback(async () => {
        if (loadingAuth || !currentUser) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const userId = currentUser.uid;
            const cartItemsCollectionRef = collection(db, "carts", userId, "items");
            const querySnapshot = await getDocs(cartItemsCollectionRef);
            const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCartItems(items);
        } catch (err) {
            setError("No se pudieron cargar los ítems de tu carrito.");
        } finally {
            setLoading(false);
        }
    }, [currentUser, loadingAuth]);

    useEffect(() => {
        fetchCartItems();
    }, [fetchCartItems]);

    const orderTotal = cartItems.reduce((total, item) => total + item.totalPrice, 0);

    // --- LÓGICA DE CONFIRMACIÓN DE PEDIDO (ACTUALIZADA) ---
    const handleConfirmOrder = async () => {
        if (cartItems.length === 0) {
            showInfoModal('Carrito Vacío', 'No hay productos en tu carrito para comprar.');
            return;
        }
        setLoading(true);
        try {
            // 1. Obtener el token de autenticación del usuario
            const idToken = await currentUser.getIdToken();

            // 2. Preparar los datos que enviaremos al backend
            const orderData = {
                items: cartItems,
                orderTotal: orderTotal,
            };

            // 3. Llamar a nuestro nuevo y seguro endpoint del backend
            await axios.post(`${API_BASE_URL}/orders`, orderData, {
                headers: {
                    'Authorization': `Bearer ${idToken}`
                }
            });

            // 4. Si todo sale bien, mostrar modal de éxito y redirigir
            showInfoModal('¡Pedido Confirmado!', 'Tu pedido ha sido confirmado con éxito. Gracias por tu compra.');
            navigate('/purchase-success');

        } catch (orderError) {
            console.error("Error al confirmar el pedido:", orderError);
            const errorMessage = orderError.response?.data?.message || 'Intenta de nuevo.';
            showInfoModal('Error', `Hubo un error al confirmar tu pedido. ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    // --- (El resto de las validaciones y retornos no cambian) ---

    if (loadingAuth || loading) {
        return <div className="text-center mt-20">Cargando...</div>;
    }
    if (error) {
        return <div className="text-center mt-20 text-red-600">{error}</div>;
    }
    // ... (otras validaciones)

    // --- DISEÑO MEJORADO (JSX) ---
    return (
        <div className="container mx-auto p-4 md:p-8 my-8">
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
                <h2 className="text-3xl font-bold text-blue-800 text-center mb-6">Confirmar Pedido</h2>
                <p className="text-gray-600 text-center mb-8">Revisa tu pedido y dirección antes de confirmar la compra.</p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Columna de Productos y Resumen */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="border rounded-lg p-4">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Productos en tu Pedido</h3>
                            {cartItems.map(item => (
                                <div key={item.id} className="flex items-center justify-between border-b py-3 last:border-b-0">
                                    <div className="flex items-center">
                                        <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                                        <div>
                                            <p className="font-semibold text-gray-800">{item.name}</p>
                                            <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                                            <p className="text-sm text-gray-500">Vendido por: {item.sellerEmail}</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-lg text-blue-600">${item.totalPrice.toLocaleString('es-MX')}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Columna de Totales y Dirección */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="border rounded-lg p-4">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Información de Envío</h3>
                            <div className="text-gray-700 space-y-1">
                                <p><strong>Nombre:</strong> {currentUser.displayName || currentUser.email}</p>
                                {/* Aquí podrías agregar campos de dirección si los tuvieras en el perfil */}
                                <p><strong>Dirección:</strong> (No especificada)</p>
                                <p className="text-xs text-gray-500 mt-2">(La información se toma de tu perfil de usuario)</p>
                            </div>
                        </div>

                        <div className="border rounded-lg p-4 bg-gray-50">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Resumen de Pago</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between"><span>Subtotal:</span><span>${orderTotal.toLocaleString('es-MX')}</span></div>
                                <div className="flex justify-between"><span>Envío:</span><span>Gratis</span></div>
                                <div className="flex justify-between text-xl font-bold text-blue-800 border-t pt-2 mt-2">
                                    <span>Total:</span>
                                    <span>${orderTotal.toLocaleString('es-MX')}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleConfirmOrder}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md text-lg"
                            disabled={loading}
                        >
                            {loading ? 'Procesando...' : 'Confirmar y Pagar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;