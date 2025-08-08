import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { db } from '../firebaseConfig';
import { collection, doc, getDocs, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';

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

    const handleConfirmOrder = async () => {
        if (!currentUser) {
            showInfoModal('Acción Requerida', 'Debes iniciar sesión para confirmar tu pedido.');
            navigate('/login');
            return;
        }
        if (cartItems.length === 0) {
            showInfoModal('Carrito Vacío', 'Tu carrito está vacío. No hay productos para comprar.');
            navigate('/cart');
            return;
        }
        setLoading(true); // Usamos el estado 'loading' general
        try {
            const involvedSellerUids = [...new Set(cartItems.map(item => item.sellerId))];
            const newOrder = {
                buyerId: currentUser.uid,
                buyerEmail: currentUser.email,
                items: cartItems.map(item => ({...item})), // Copia simple de los items
                orderTotal: orderTotal,
                status: 'Pendiente',
                createdAt: serverTimestamp(),
                involvedSellerUids: involvedSellerUids,
            };
            await addDoc(collection(db, "orders"), newOrder);

            const cartItemsRef = collection(db, "carts", currentUser.uid, "items");
            const cartSnapshot = await getDocs(cartItemsRef);
            const deletePromises = cartSnapshot.docs.map(docItem => deleteDoc(docItem.ref));
            await Promise.all(deletePromises);

            showInfoModal('¡Pedido Confirmado!', 'Tu pedido ha sido confirmado con éxito. Gracias por tu compra.');
            navigate('/purchase-success');
        } catch (orderError) {
            console.error("Error al confirmar el pedido:", orderError);
            showInfoModal('Error', 'Hubo un error al confirmar tu pedido. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    if (loadingAuth || loading) {
        return <div className="text-center mt-20">Cargando...</div>;
    }
    if (error) {
        return <div className="text-center mt-20 text-red-600">{error}</div>;
    }
    if (!currentUser) {
        return (
            <div className="text-center mt-20">
                <p className="text-red-600 mb-4">Debes iniciar sesión para ver esta página.</p>
                <button onClick={() => navigate('/login')} className="bg-blue-600 text-white py-2 px-4 rounded">Inicia Sesión</button>
            </div>
        );
    }
    if (cartItems.length === 0 && !loading) {
        return (
            <div className="text-center mt-20">
                <p className="text-gray-600 mb-4">Tu carrito está vacío.</p>
                <Link to="/catalogo" className="text-blue-600 hover:underline">Explora nuestro catálogo</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8 my-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-blue-800 text-center mb-8">Confirmar Pedido</h2>
            <div className="space-y-6 mb-8">
                <div className="p-6 border rounded-lg">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Productos en tu Pedido:</h3>
                    <div className="space-y-3">
                        {cartItems.map(item => (
                            <div key={item.id} className="flex justify-between items-center border-b pb-2">
                                <div className="flex items-center">
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="w-12 h-12 object-cover rounded-md mr-3"
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-800">{item.name}</p>
                                        <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                                    </div>
                                </div>
                                <p className="font-bold text-blue-600">${item.totalPrice.toLocaleString('es-MX')}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-6 border rounded-lg">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Resumen del Pedido:</h3>
                    <div className="flex justify-between font-semibold mb-2">
                        <span>Subtotal:</span>
                        <span>${orderTotal.toLocaleString('es-MX')}</span>
                    </div>
                    <div className="flex justify-between text-2xl font-bold text-blue-800 border-t pt-4 mt-4">
                        <span>Total a Pagar:</span>
                        <span>${orderTotal.toLocaleString('es-MX')}</span>
                    </div>
                </div>
            </div>
            <button
                onClick={handleConfirmOrder}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-md text-xl"
                disabled={loading}
            >
                {loading ? 'Confirmando...' : 'Confirmar Pedido'}
            </button>
        </div>
    );
};

export default CheckoutPage;