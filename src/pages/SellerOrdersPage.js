import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig'; // Importamos la instancia de Firestore
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

const SellerOrdersPage = () => {
  const navigate = useNavigate();
  const { currentUser, loadingAuth } = useAuth();
  const [salesOrders, setSalesOrders] = useState([]); // Usamos 'salesOrders' para diferenciar de 'orders' del comprador
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para cargar los pedidos de venta del vendedor
  const fetchSalesOrders = useCallback(async () => {
    if (loadingAuth || !currentUser || !currentUser.firestoreProfile || currentUser.firestoreProfile.userType !== 'Vendedor') {
      setLoading(false);
      setError("Acceso denegado. Debes iniciar sesión como vendedor para ver tus ventas.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sellerId = currentUser.uid;
      const ordersCollectionRef = collection(db, "orders");
      
      // Consulta para obtener pedidos donde el vendedor actual es uno de los vendedores de los ítems
      // ¡ATENCIÓN! Esta consulta requiere un índice compuesto en Firestore.
      // El índice será para: items.sellerId (array-contains) y createdAt (desc)
      const q = query(
        ordersCollectionRef,
        where("items", "array-contains", { sellerId: sellerId }), // Buscar si el sellerId está en el array de ítems
        orderBy("createdAt", "desc") // Ordenar por fecha de creación
      );

      const querySnapshot = await getDocs(q);

      const fetchedSalesOrders = [];
      querySnapshot.forEach((doc) => {
        const orderData = doc.data();
        // Filtrar los ítems del pedido para mostrar solo los que pertenecen a este vendedor
        const sellerSpecificItems = orderData.items.filter(item => item.sellerId === sellerId);
        
        // Si el pedido contiene ítems de este vendedor, lo añadimos
        if (sellerSpecificItems.length > 0) {
          fetchedSalesOrders.push({ 
            id: doc.id, 
            ...orderData, 
            items: sellerSpecificItems // Solo los ítems relevantes para este vendedor
          });
        }
      });
      setSalesOrders(fetchedSalesOrders);
      setLoading(false);
      console.log("Pedidos de venta del vendedor obtenidos:", fetchedSalesOrders);
    } catch (err) {
      console.error("Error al obtener pedidos de venta:", err);
      // FirebaseError: The query requires an index.
      if (err.code === 'failed-precondition' && err.message.includes('The query requires an index')) {
          setError(`Error: La consulta requiere un índice. Por favor, crea el índice en la consola de Firebase: ${err.message.split('You can create it here: ')[1]}`);
          console.error("URL del índice:", err.message.split('You can create it here: ')[1]);
      } else {
          setError("No se pudieron cargar tus ventas. Intenta de nuevo.");
      }
      setLoading(false);
    }
  }, [currentUser, loadingAuth]);

  useEffect(() => {
    fetchSalesOrders();
  }, [fetchSalesOrders]);

  if (loadingAuth || loading) {
    return (
      <div className="text-center mt-20 text-blue-600 text-xl">Cargando tus ventas...</div>
    );
  }

  if (error) {
    return <div className="text-center mt-20 text-red-600 text-xl">{error}</div>;
  }

  if (!currentUser || currentUser.firestoreProfile.userType !== 'Vendedor') {
    return (
      <div className="text-center mt-20">
        <p className="text-red-600 text-xl mb-4">No tienes permiso para acceder a esta sección. Debes iniciar sesión como vendedor.</p>
        <button onClick={() => navigate('/login')} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
          Inicia Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 my-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-blue-800 text-center mb-6">Mis Ventas</h2>
      <p className="text-gray-600 text-center mb-8">Aquí puedes ver el historial de tus ventas y pedidos.</p>

      {salesOrders.length === 0 ? (
        <div className="text-center mt-10 p-8 border rounded-lg bg-gray-50">
          <p className="text-gray-600 text-xl mb-4">No has realizado ninguna venta aún.</p>
          <Link to="/seller/add-product" className="text-blue-600 hover:underline text-lg">
            Publica tu primer producto para empezar a vender.
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {salesOrders.map((order) => (
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
              <p className="text-sm text-gray-600 mb-2">Fecha de compra: {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleString() : 'N/A'}</p>
              <p className="text-lg font-semibold text-blue-600 mb-4">Total de tu venta: ${order.orderTotal.toLocaleString('es-MX')}</p> {/* Total del pedido completo */}

              <h4 className="text-md font-semibold text-gray-700 mb-2">Tus productos en este pedido:</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {order.items.map((item, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span>{item.name} (x{item.quantity})</span>
                    <span>${item.totalPrice.toLocaleString('es-MX')}</span>
                  </li>
                ))}
              </ul>
              
              <div className="text-right mt-4">
                <button onClick={() => console.log('Ver detalles del pedido de venta:', order.id)} className="text-blue-600 hover:underline text-sm">
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

export default SellerOrdersPage;