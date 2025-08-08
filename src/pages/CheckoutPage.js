import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext'; // <-- PASO 1: Importar el hook de UI
import { db } from '../firebaseConfig';
import { collection, doc, getDocs, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { currentUser, loadingAuth } = useAuth();
    const { showInfoModal } = useUI(); // <-- PASO 2: Obtener la función para mostrar el modal
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCartItems = useCallback(async () => {
        // ... (esta función no cambia)
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
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() });
            });
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
            // <-- PASO 3: Reemplazar alert()
            showInfoModal('Acción Requerida', 'Debes iniciar sesión para confirmar tu pedido.');
            navigate('/login');
            return;
        }
        if (cartItems.length === 0) {
            // <-- PASO 3: Reemplazar alert()
            showInfoModal('Carrito Vacío', 'Tu carrito está vacío. No hay productos para comprar.');
            navigate('/cart');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const involvedSellerUids = [...new Set(cartItems.map(item => item.sellerId))];
            const ordersCollectionRef = collection(db, "orders");

            const newOrder = {
                buyerId: currentUser.uid,
                buyerEmail: currentUser.email,
                buyerName: currentUser.firestoreProfile?.name || currentUser.email,
                items: cartItems.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    imageUrl: item.imageUrl,
                    pricePerUnit: item.pricePerUnit,
                    quantity: item.quantity,
                    totalPrice: item.totalPrice,
                    sellerId: item.sellerId,
                    sellerEmail: item.sellerEmail,
                })),
                orderTotal: orderTotal,
                shippingAddress: currentUser.firestoreProfile?.address || 'N/A',
                shippingCP: currentUser.firestoreProfile?.cp || 'N/A',
                status: 'Pendiente',
                createdAt: serverTimestamp(),
                involvedSellerUids: involvedSellerUids,
            };

            await addDoc(ordersCollectionRef, newOrder);

            const userId = currentUser.uid;
            const cartItemsCollectionRef = collection(db, "carts", userId, "items");
            const querySnapshot = await getDocs(cartItemsCollectionRef);
            const deletePromises = querySnapshot.docs.map(docItem =>
                deleteDoc(doc(db, "carts", userId, "items", docItem.id))
            );
            await Promise.all(deletePromises);

            setLoading(false);
            // <-- PASO 3: Reemplazar alert()
            showInfoModal('¡Pedido Confirmado!', 'Tu pedido ha sido confirmado con éxito. Gracias por tu compra.');
            navigate('/purchase-success');

        } catch (orderError) {
            console.error("Error al confirmar el pedido:", orderError);
            setError("Hubo un error al confirmar tu pedido. Intenta de nuevo.");
            setLoading(false);
        }
    };

    // ... (El resto de tu JSX no necesita cambios)

    if (loadingAuth || loading) {
        return <div className="text-center mt-20">Cargando resumen del pedido...</div>;
    }

    if (error) {
        return <div className="text-center mt-20 text-red-600">{error}</div>;
    }

    // ... (El resto de tu JSX para mostrar la página)
    return (
         <div className="container mx-auto p-8 my-8 bg-white rounded-lg shadow-lg">
             {/* ... Tu JSX para mostrar el checkout ... */}
             <h2 className="text-3xl font-bold text-center mb-6">Confirmar Pedido</h2>
             {/* ... etc ... */}
             <button
                onClick={handleConfirmOrder}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-md"
                disabled={loading}
             >
                {loading ? 'Confirmando...' : 'Confirmar Pedido'}
             </button>
         </div>
    );
};

export default CheckoutPage;
