import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig'; // Importamos la instancia de Firestore
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const { currentUser, loadingAuth } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para cargar los pedidos del usuario
  const fetchOrders = useCallback(async () => {
    if (loadingAuth || !currentUser) { // Esperar a que la autenticación cargue y haya un usuario
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userId = currentUser.uid;
      const ordersCollectionRef = collection(db, "orders");
      
      // Crear una consulta para obtener solo los pedidos donde el usuario actual es el comprador
      const q = query(
        ordersCollectionRef,
        where("buyerId", "==", userId),
        orderBy("createdAt", "desc") // Ordenar por fecha de creación, los más recientes primero
      );

      const querySnapshot = await getDocs(q);

      const fetchedOrders = [];
      querySnapshot.forEach((doc) => {
        fetchedOrders.push({ id: doc.id, ...doc.data() }); // Añadir el ID del documento de Firestore
      });
      setOrders(fetchedOrders);
      setLoading(false);
      console.log("Pedidos del usuario obtenidos:", fetchedOrders);
    } catch (err) {
      console.error("Error al obtener pedidos:", err);
      setError("No se pudieron cargar tus pedidos. Intenta de nuevo.");
      setLoading(false);
    }
  }, [currentUser, loadingAuth]); // Depende de currentUser y loadingAuth

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loadingAuth || loading) {
    return (
      <div className="text-center mt-20 text-blue-600 text-xl">Cargando tus pedidos...</div>
    );
  }

  if (error) {
    return <div className="text-center mt-20 text-red-600 text-xl">{error}</div>;
  }

  if (!currentUser) { // Si no hay usuario logueado, pedirle que inicie sesión
    return (
      <div className="text-center mt-20">
        <p className="text-red-600 text-xl mb-4">Debes iniciar sesión para ver tus pedidos.</p>
        <button onClick={() => navigate('/login')} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
          Inicia Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 my-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-blue-800 text-center mb-6">Mis Pedidos</h2>
      <p className="text-gray-600 text-center mb-8">Aquí puedes ver el historial de tus compras.</p>

      {orders.length === 0 ? (
        <div className="text-center mt-10 p-8 border rounded-lg bg-gray-50">
          <p className="text-gray-600 text-xl mb-4">No has realizado ningún pedido aún.</p>
          <Link to="/catalogo" className="text-blue-600 hover:underline text-lg">
            Explora nuestro catálogo para empezar a comprar.
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Pedido ID: {order.id.substring(0, 8)}...</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  order.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'Completado' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Fecha: {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleString() : 'N/A'}</p>
              <p className="text-lg font-semibold text-blue-600 mb-4">Total: ${order.orderTotal.toLocaleString('es-MX')}</p>

              <h4 className="text-md font-semibold text-gray-700 mb-2">Productos:</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {order.items.map((item, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span>{item.name} (x{item.quantity})</span>
                    <span>${item.totalPrice.toLocaleString('es-MX')}</span>
                  </li>
                ))}
              </ul>
              
              {/* Opcional: Botón para ver detalles del pedido (si se implementa una página de detalle de pedido) */}
              <div className="text-right mt-4">
                <button onClick={() => console.log('Ver detalles del pedido:', order.id)} className="text-blue-600 hover:underline text-sm">
                  Ver Detalles del Pedido
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;