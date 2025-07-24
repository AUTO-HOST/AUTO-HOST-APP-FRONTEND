import React, { useState, useEffect, useCallback } from 'react'; // <-- ¡CORREGIDO AQUÍ!
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { collection, doc, getDocs, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
// ... (resto del código)

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { currentUser, loadingAuth } = useAuth();
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

      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      setCartItems(items);
      setLoading(false);
      console.log("Ítems del carrito obtenidos para checkout:", items);
    } catch (err) {
      console.error("Error al obtener ítems del carrito para checkout:", err);
      setError("No se pudieron cargar los ítems de tu carrito. Intenta de nuevo.");
      setLoading(false);
    }
  }, [currentUser, loadingAuth]);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const orderTotal = cartItems.reduce((total, item) => total + item.totalPrice, 0);

  const handleConfirmOrder = async () => {
    if (!currentUser) {
      alert("Debes iniciar sesión para confirmar tu pedido.");
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      alert("Tu carrito está vacío. No hay productos para comprar.");
      navigate('/cart');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("DEBUG: Procesando pedido...");
      
      // Extraer UIDs de vendedores únicos de los ítems del carrito
      const involvedSellerUids = [...new Set(cartItems.map(item => item.sellerId))]; // <-- Asegúrate que 'sellerId' exista en los ítems del carrito

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
        involvedSellerUids: involvedSellerUids, // <-- ¡Este campo DEBE estar aquí!
      };

      const orderDocRef = await addDoc(ordersCollectionRef, newOrder);
      console.log("DEBUG: Pedido guardado en Firestore con ID:", orderDocRef.id);

      const userId = currentUser.uid;
      const cartItemsCollectionRef = collection(db, "carts", userId, "items");
      const querySnapshot = await getDocs(cartItemsCollectionRef);

      const deletePromises = [];
      querySnapshot.forEach((docItem) => {
        deletePromises.push(deleteDoc(doc(db, "carts", userId, "items", docItem.id)));
      });
      await Promise.all(deletePromises);

      console.log("DEBUG: Carrito vaciado en Firestore.");
      setLoading(false);
      alert("¡Tu pedido ha sido confirmado con éxito! Gracias por tu compra.");
      navigate('/purchase-success'); 
      
    } catch (orderError) {
      console.error("Error al confirmar el pedido:", orderError);
      setError("Hubo un error al confirmar tu pedido. Intenta de nuevo.");
      setLoading(false);
    }
  };


  if (loadingAuth || loading) {
    return (
      <div className="text-center mt-20 text-blue-600 text-xl">Cargando resumen del pedido...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-20 text-red-600 text-xl">{error}</div>
    );
  }

  if (!currentUser) {
    return (
      <div className="text-center mt-20">
        <p className="text-red-600 text-xl mb-4">Debes iniciar sesión para confirmar tu pedido.</p>
        <button onClick={() => navigate('/login')} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
          Inicia Sesión
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center mt-20 p-8 border rounded-lg bg-gray-50">
        <p className="text-gray-600 text-xl mb-4">Tu carrito está vacío. No hay productos para checkout.</p>
        <Link to="/catalogo" className="text-blue-600 hover:underline text-lg">
          Explora nuestro catálogo para añadir productos.
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 my-8 bg-white rounded-lg shadow-lg">
      <button onClick={() => navigate(-1)} className="mb-6 text-blue-600 hover:underline flex items-center">
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Volver al Carrito
      </button>

      <h2 className="text-3xl font-bold text-blue-800 text-center mb-6">Confirmar Pedido</h2>
      <p className="text-gray-600 text-center mb-8">Revisa tu pedido antes de confirmar la compra.</p>

      {/* Detalles del Pedido */}
      <div className="space-y-6 mb-8">
        <div className="card p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Productos en tu Pedido:</h3>
          <div className="space-y-3">
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between items-center border-b pb-2">
                <div className="flex items-center">
                  <img 
                    src={item.imageUrl || `https://placehold.it/50x50?text=${item.name.substring(0, Math.min(item.name.length, 5))}`} 
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

        {/* Resumen de Totales */}
        <div className="card p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Resumen del Pedido:</h3>
          <div className="flex justify-between text-lg font-semibold text-gray-700 mb-2">
            <span>Subtotal de productos:</span>
            <span>${orderTotal.toLocaleString('es-MX')}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold text-gray-700 mb-2">
            <span>Envío:</span>
            <span>$0.00 (Simulado)</span>
          </div>
          <div className="flex justify-between text-2xl font-bold text-blue-800 border-t pt-4 mt-4">
            <span>Total a Pagar:</span>
            <span>${orderTotal.toLocaleString('es-MX')}</span>
          </div>
        </div>

        {/* Información de Envío (Simulada) */}
        <div className="card p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Información de Envío:</h3>
          <p className="text-gray-700"><strong>Nombre:</strong> {currentUser.firestoreProfile?.name || 'N/A'}</p>
          <p className="text-gray-700"><strong>Dirección:</strong> {currentUser.firestoreProfile?.address || 'N/A'}</p>
          <p className="text-gray-700"><strong>C.P.:</strong> {currentUser.firestoreProfile?.cp || 'N/A'}</p>
          <p className="text-sm text-gray-500 mt-2">
            (Esta información se toma de tu perfil. Asegúrate de que esté actualizada en tu sección de perfil.)
          </p>
        </div>
      </div>

      {/* Botón de Confirmar Pedido */}
      <button 
        onClick={handleConfirmOrder}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-md transition-colors text-xl"
        disabled={loading}
      >
        {loading ? 'Confirmando Pedido...' : `Confirmar Pedido ($${orderTotal.toLocaleString('es-MX')})`}
      </button>

      <p className="text-center text-gray-600 mt-4 text-sm">
        Al confirmar, aceptas nuestros Términos y Condiciones.
      </p>
    </div>
  );
};

export default CheckoutPage;
