import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig'; // Importamos la instancia de Firestore
import { collection, doc, getDocs, deleteDoc, updateDoc, increment } from 'firebase/firestore';

const CartPage = () => {
  const navigate = useNavigate();
  const { currentUser, loadingAuth } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para cargar los ítems del carrito
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
      console.log("Ítems del carrito obtenidos:", items);
    } catch (err) {
      console.error("Error al obtener ítems del carrito:", err);
      setError("No se pudieron cargar los ítems de tu carrito. Intenta de nuevo.");
      setLoading(false);
    }
  }, [currentUser, loadingAuth]);

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  // Manejador para cambiar la cantidad de un ítem
  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    if (!currentUser) return;

    const userId = currentUser.uid;
    const itemRef = doc(db, "carts", userId, "items", itemId);
    const currentItem = cartItems.find(item => item.id === itemId);

    if (!currentItem) return;

    const pricePerUnit = currentItem.pricePerUnit;

    try {
      await updateDoc(itemRef, {
        quantity: newQuantity,
        totalPrice: newQuantity * pricePerUnit,
        updatedAt: new Date()
      });
      console.log(`Cantidad de ${currentItem.name} actualizada a ${newQuantity}.`);
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity, totalPrice: newQuantity * pricePerUnit } : item
        )
      );
    } catch (err) {
      console.error("Error al actualizar cantidad:", err);
      alert("Error al actualizar la cantidad. Intenta de nuevo.");
    }
  };

  // Manejador para eliminar un ítem del carrito
  const handleRemoveItem = async (itemId, itemName) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${itemName}" de tu carrito?`)) {
      return;
    }
    if (!currentUser) return;

    const userId = currentUser.uid;
    const itemRef = doc(db, "carts", userId, "items", itemId);

    try {
      await deleteDoc(itemRef);
      console.log(`"${itemName}" eliminado del carrito.`);
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    } catch (err) {
      console.error("Error al eliminar ítem:", err);
      alert("Error al eliminar el producto del carrito. Intenta de nuevo.");
    }
  };

  // Calcular el total del carrito
  const cartTotal = cartItems.reduce((total, item) => total + item.totalPrice, 0);

  if (loadingAuth || loading) {
    return <div className="text-center mt-20 text-blue-600 text-xl">Cargando tu carrito...</div>;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-600 text-xl">{error}</div>;
  }

  if (!currentUser) {
    return (
      <div className="text-center mt-20">
        <p className="text-red-600 text-xl mb-4">Debes iniciar sesión para ver tu carrito.</p>
        <button onClick={() => navigate('/login')} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
          Inicia Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 my-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-blue-800 text-center mb-6">Mi Carrito de Compras</h2>
      <p className="text-gray-600 text-center mb-8">Revisa los productos que has añadido.</p>

      {cartItems.length === 0 ? (
        <div className="text-center mt-10 p-8 border rounded-lg bg-gray-50">
          <p className="text-gray-600 text-xl mb-4">Tu carrito está vacío.</p>
          <Link to="/catalogo" className="text-blue-600 hover:underline text-lg">
            Explora nuestro catálogo para añadir productos.
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna de Ítems del Carrito */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                <img 
                  src={item.imageUrl || `https://placehold.it/80x80?text=${item.name.substring(0, Math.min(item.name.length, 5))}`} 
                  alt={item.name} 
                  className="w-20 h-20 object-cover rounded-md mr-4"
                />
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-600">Precio por unidad: ${item.pricePerUnit.toLocaleString('es-MX')}</p>
                  <div className="flex items-center mt-2">
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)} 
                      className="bg-gray-200 text-gray-700 px-2 py-1 rounded-l-md hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 border-t border-b text-gray-800">{item.quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)} 
                      className="bg-gray-200 text-gray-700 px-2 py-1 rounded-r-md hover:bg-gray-300"
                    >
                      +
                    </button>
                    <p className="ml-4 font-bold text-blue-600">${item.totalPrice.toLocaleString('es-MX')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleRemoveItem(item.id, item.name)} 
                  className="text-red-600 hover:text-red-800 ml-4 p-2 rounded-full hover:bg-red-100"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                </button>
              </div>
            ))}
          </div>

          {/* Columna de Resumen del Carrito */}
          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md border border-gray-200 h-fit sticky top-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Resumen del Pedido</h3>
            <div className="flex justify-between text-lg font-semibold text-gray-700 mb-2">
              <span>Subtotal:</span>
              <span>${cartTotal.toLocaleString('es-MX')}</span>
            </div>
            <p className="text-sm text-gray-500 mb-6">Los costos de envío y los impuestos se calcularán en el checkout.</p>
            <button 
              onClick={() => navigate('/checkout')} // <-- ¡MODIFICADO AQUÍ!
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md transition-colors text-lg"
            >
              Proceder al Checkout (${cartTotal.toLocaleString('es-MX')})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
