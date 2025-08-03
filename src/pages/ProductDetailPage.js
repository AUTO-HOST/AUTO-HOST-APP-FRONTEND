import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ContactSellerModal from '../components/ContactSellerModal';

// Importa la URL base de tu API desde el archivo de configuración centralizado
// Asegúrate de que este archivo 'config.js' exista en tu carpeta 'src/'
import API_BASE_URL from '../config';

// Importaciones de Firestore para el carrito (estas NO necesitan cambio de URL)
import { db } from '../firebaseConfig';
import { collection, doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore'; 

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  const fetchProductDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // --- CAMBIO IMPORTANTE AQUÍ: Usando API_BASE_URL para GET de producto ---
      const response = await axios.get(`${API_BASE_URL}/products/${id}`);
      // --- FIN DEL CAMBIO IMPORTANTE ---
      setProduct(response.data);
      console.log("Detalles del producto obtenidos:", response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error al obtener detalles del producto:", err);
      setLoading(false);
      if (err.response && err.response.status === 404) {
        setError("Producto no encontrado.");
      } else {
        setError("Error al cargar los detalles del producto. Intenta de nuevo.");
      }
    }
  }, [id]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  const calculateDisplayPrice = () => {
    if (product.isOnOffer && product.originalPrice && product.discountPercentage) {
      const discountedPrice = product.originalPrice * (1 - product.discountPercentage / 100);
      return discountedPrice;
    }
    return product.price;
  };

  // --- FUNCIÓN handleBuyNow (Esta sigue usando FIRESTORE, no necesita cambio de URL) ---
  const handleBuyNow = async () => {
    if (!currentUser || !currentUser.uid) {
      alert("Debes iniciar sesión para añadir productos al carrito.");
      navigate('/login');
      return;
    }

    if (product.stock <= 0) {
      alert("Este producto no tiene stock disponible.");
      return;
    }

    const itemPrice = calculateDisplayPrice();
    const userId = currentUser.uid;
    const cartRef = doc(db, "carts", userId);
    const cartItemRef = collection(cartRef, "items");

    try {
      const cartDocSnap = await getDoc(cartRef);

      if (!cartDocSnap.exists()) {
        await setDoc(cartRef, { userId: userId, createdAt: new Date() });
        console.log("Carrito creado para el usuario:", userId);
      }

      const itemInCartRef = doc(cartItemRef, product._id);
      const itemInCartSnap = await getDoc(itemInCartRef);

      if (itemInCartSnap.exists()) {
        await updateDoc(itemInCartRef, {
          quantity: increment(1),
          totalPrice: increment(itemPrice),
          updatedAt: new Date()
        });
        console.log(`Cantidad de ${product.name} incrementada en el carrito.`);
        alert(`¡Se añadió otra unidad de "${product.name}" al carrito!`);
      } else {
        await setDoc(itemInCartRef, {
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
        console.log(`"${product.name}" añadido al carrito.`);
        alert(`¡"${product.name}" añadido al carrito!`);
      }

    } catch (cartError) {
      console.error("Error al añadir producto al carrito:", cartError);
      alert("Hubo un error al añadir el producto al carrito. Intenta de nuevo.");
    }
  };

  const handleContactSeller = () => {
    if (!currentUser) {
      alert("Debes iniciar sesión para contactar al vendedor.");
      navigate('/login');
      return;
    }
    setShowContactModal(true);
  };

  const handleSendMessage = async (messageContent) => {
    if (!currentUser || !currentUser.uid) {
      alert("Error: No estás autenticado para enviar mensajes.");
      return false;
    }
    if (!product || !product.user) {
      alert("Error: No se pudo identificar al vendedor del producto.");
      return false;
    }

    try {
      const idToken = await currentUser.getIdToken();

      const messageData = {
        senderId: currentUser.uid,
        senderEmail: currentUser.email,
        receiverId: product.user,
        receiverEmail: product.sellerEmail,
        productId: product._id,
        productName: product.name,
        content: messageContent,
      };

      console.log("Enviando mensaje al backend:", messageData);

      // --- CAMBIO IMPORTANTE AQUÍ: Usando API_BASE_URL para POST de mensajes ---
      const response = await axios.post(`${API_BASE_URL}/messages`, messageData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });
      // --- FIN DEL CAMBIO IMPORTANTE ---

      console.log("Mensaje enviado con éxito:", response.data);
      alert("¡Mensaje enviado al vendedor!");
      return true;
    } catch (error) {
      console.error("Error al enviar el mensaje:", error.response ? error.response.data : error.message);
      alert(`Error al enviar mensaje: ${error.response && error.response.data ? error.response.data.message : error.message}`);
      return false;
    }
  };

  if (loading) {
    return <div className="text-center mt-20 text-blue-600 text-xl">Cargando detalles del producto...</div>;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-600 text-xl">{error}</div>;
  }

  if (!product) {
    return <div className="text-center mt-20 text-gray-600 text-xl">No se pudo cargar el producto.</div>;
  }

  const displayPrice = calculateDisplayPrice();

  return (
    <div className="container mx-auto p-8 my-8 bg-white rounded-lg shadow-lg">
      <button onClick={() => navigate(-1)} className="mb-6 text-blue-600 hover:underline flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Volver
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Columna de Imagen */}
        <div className="md:col-span-1">
          <img
            src={product.imageUrl || `https://placehold.it/600x400?text=${product.name.substring(0, Math.min(product.name.length, 15))}`}
            alt={product.name}
            className="w-full h-auto rounded-lg shadow-md object-cover"
            style={{ maxHeight: '500px' }}
          />
          </div>

        {/* Columna de Detalles del Producto */}
        <div className="md:col-span-1 flex flex-col justify-between">
          <div>
            <h1 className="text-4xl font-bold text-blue-800 mb-4">{product.name}</h1>

            {/* Display de precios y oferta */}
            {product.isOnOffer ? (
                <div className="mb-4">
                    <p className="text-xl text-gray-500 line-through">Precio Original: ${product.originalPrice.toLocaleString('es-MX')}</p>
                    <p className="text-3xl font-bold text-red-600">
                        Precio Oferta: ${displayPrice.toLocaleString('es-MX')}
                        <span className="text-lg text-red-500 ml-2">({product.discountPercentage}% OFF)</span>
                    </p>
                </div>
            ) : (
                <p className="text-3xl font-bold text-blue-600 mb-4">${product.price.toLocaleString('es-MX')}</p>
            )}

            <p className="text-gray-700 text-lg leading-relaxed mb-6">{product.description}</p>

            <div className="grid grid-cols-2 gap-4 text-gray-700 mb-6">
              <p><strong>Categoría:</strong> {product.category}</p>
              <p><strong>Condición:</strong> {product.condition}</p>
              {product.stock > 0 && <p><strong>Stock:</strong> {product.stock} unidades</p>}
              {product.marca_refaccion && <p><strong>Marca:</strong> {product.marca_refaccion}</p>}
              {product.lado && <p><strong>Lado:</strong> {product.lado}</p>}
              {product.numero_parte && <p><strong>Número de Parte:</strong> {product.numero_parte}</p>}
            </div>

            {/* Información del Vendedor */}
            <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Información del Vendedor</h3>
              <p className="text-gray-700">Email: {product.sellerEmail || 'No disponible'}</p>
            </div>
          </div>

          {/* Botones de Acción (Comprar, Contactar) */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            {product.stock > 0 ? (
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md transition-colors text-lg"
              >
                Comprar Ahora (${displayPrice.toLocaleString('es-MX')})
              </button>
            ) : (
              <button className="flex-1 bg-gray-400 text-white font-bold py-3 px-6 rounded-md cursor-not-allowed text-lg" disabled>
                Sin Stock
              </button>
            )}
            <button
              onClick={handleContactSeller}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition-colors text-lg"
            >
              Contactar Vendedor
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Contacto con el Vendedor */}
      {showContactModal && (
        <ContactSellerModal
          isOpen={showContactModal} // Pasa el estado de apertura
          onClose={handleCloseContactModal} // Función para cerrar el modal
          onSubmit={handleSendMessage} // Función para enviar el mensaje
          productName={product.name}
          sellerName={product.sellerEmail} // Usamos el email del vendedor como nombre en el modal
          // Si product.user (UID del vendedor) tiene un nombre en Firestore, podrías buscarlo aquí
        />
      )}
    </div>
  );
};

export default ProductDetailPage;