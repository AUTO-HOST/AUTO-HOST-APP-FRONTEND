import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext'; // <-- PASO 1: Importar el hook de UI
import ContactSellerModal from '../components/ContactSellerModal';
import API_BASE_URL from '../config';
import { db } from '../firebaseConfig';
import { collection, doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { showInfoModal } = useUI(); // <-- PASO 2: Obtener la función para mostrar el modal

    // ... (El resto de tus estados se mantienen igual)
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showContactModal, setShowContactModal] = useState(false);

    const handleCloseContactModal = () => {
        setShowContactModal(false);
    };

    const fetchProductDetails = useCallback(async () => {
        // ... (Esta función no cambia)
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/products/${id}`);
            setProduct(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Error al obtener detalles del producto:", err);
            setLoading(false);
            setError("Error al cargar los detalles del producto.");
        }
    }, [id]);

    useEffect(() => {
        fetchProductDetails();
    }, [fetchProductDetails]);

    const calculateDisplayPrice = () => {
        // ... (Esta función no cambia)
        if (product.isOnOffer && product.originalPrice && product.discountPercentage) {
            const discountedPrice = product.originalPrice * (1 - product.discountPercentage / 100);
            return discountedPrice;
        }
        return product.price;
    };

    const handleBuyNow = async () => {
        if (!currentUser) {
            // <-- PASO 3: Reemplazar alert()
            showInfoModal('Acción Requerida', 'Debes iniciar sesión para añadir productos al carrito.');
            navigate('/login');
            return;
        }

        if (product.stock <= 0) {
            // <-- PASO 3: Reemplazar alert()
            showInfoModal('Producto Agotado', 'Este producto no tiene stock disponible.');
            return;
        }

        const itemPrice = calculateDisplayPrice();
        const userId = currentUser.uid;
        const cartRef = doc(db, "carts", userId);
        const cartItemRef = collection(cartRef, "items");

        try {
            // ... (lógica de carrito)
            const itemInCartRef = doc(cartItemRef, product._id);
            const itemInCartSnap = await getDoc(itemInCartRef);

            if (itemInCartSnap.exists()) {
                await updateDoc(itemInCartRef, { quantity: increment(1) });
                // <-- PASO 3: Reemplazar alert()
                showInfoModal('Carrito Actualizado', `¡Se añadió otra unidad de "${product.name}" al carrito!`);
            } else {
                await setDoc(itemInCartRef, {
                    // ... (datos del producto)
                    productId: product._id,
                    name: product.name,
                    imageUrl: product.imageUrl,
                    pricePerUnit: itemPrice,
                    quantity: 1,
                    totalPrice: itemPrice,
                    sellerId: product.user,
                    sellerEmail: product.sellerEmail,
                    addedAt: new Date()
                });
                // <-- PASO 3: Reemplazar alert()
                showInfoModal('Carrito de Compras', `¡"${product.name}" añadido al carrito!`);
            }
        } catch (cartError) {
            console.error("Error al añadir producto al carrito:", cartError);
            // <-- PASO 3: Reemplazar alert()
            showInfoModal('Error', 'Hubo un error al añadir el producto al carrito. Intenta de nuevo.');
        }
    };

    const handleContactSeller = () => {
        if (!currentUser) {
            // <-- PASO 3: Reemplazar alert()
            showInfoModal('Acción Requerida', 'Debes iniciar sesión para contactar al vendedor.');
            navigate('/login');
            return;
        }
        setShowContactModal(true);
    };

    const handleSendMessage = async (messageContent) => {
        // ... (Tu lógica para enviar mensajes no cambia, solo las alertas de error)
        try {
            const idToken = await currentUser.getIdToken();
            const messageData = {
                productId: product._id,
                productName: product.name,
                content: messageContent,
            };
            await axios.post(`${API_BASE_URL}/messages/send`, messageData, {
                headers: { 'Authorization': `Bearer ${idToken}` },
            });
            // <-- PASO 3: Reemplazar alert()
            showInfoModal('Éxito', '¡Mensaje enviado al vendedor!');
            return true;
        } catch (error) {
            console.error("Error al enviar el mensaje:", error);
            // <-- PASO 3: Reemplazar alert()
            const errorMessage = error.response?.data?.message || 'Ocurrió un error inesperado.';
            showInfoModal('Error', `Error al enviar mensaje: ${errorMessage}`);
            return false;
        }
    };

    // ... (El resto de tu JSX no necesita cambios, solo asegúrate de que el componente <InfoModal /> ya está en App.js)

    if (loading) return <div className="text-center mt-20">Cargando...</div>;
    if (error) return <div className="text-center mt-20 text-red-500">{error}</div>;
    if (!product) return <div className="text-center mt-20">Producto no encontrado.</div>;

    const displayPrice = calculateDisplayPrice();

    return (
        // Tu JSX existente va aquí, no necesita cambios
        <div className="container mx-auto p-8 my-8 bg-white rounded-lg shadow-lg">
            {/* ... Tu JSX ... */}
             <button onClick={() => navigate(-1)} className="mb-6 text-blue-600 hover:underline">Volver</button>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <img src={product.imageUrl} alt={product.name} className="product-detail-image" />
                </div>
                <div>
                    <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
                    <p className="text-3xl font-bold text-blue-600 mb-4">${displayPrice.toLocaleString('es-MX')}</p>
                    <p className="text-lg mb-6">{product.description}</p>
                     {/* ... Resto de los detalles y botones ... */}
                      <div className="flex gap-4 mt-6">
                        <button onClick={handleBuyNow} className="bg-green-600 text-white font-bold py-3 px-6 rounded">Comprar Ahora</button>
                        <button onClick={handleContactSeller} className="bg-blue-600 text-white font-bold py-3 px-6 rounded">Contactar Vendedor</button>
                      </div>
                </div>
             </div>
            {showContactModal && (
                <ContactSellerModal
                    isOpen={showContactModal}
                    onClose={handleCloseContactModal}
                    onSubmit={handleSendMessage}
                    productName={product.name}
                    sellerName={product.sellerEmail}
                />
            )}
        </div>
    );
};

export default ProductDetailPage;
