import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../firebaseConfig'; // Importamos la instancia de Firestore
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext'; // Para obtener el usuario actual, si es necesario para validación

const TicketPage = () => {
  const { orderId } = useParams(); // Obtenemos el ID del pedido de la URL
  const navigate = useNavigate();
  const { currentUser, loadingAuth } = useAuth(); // Para validar si el usuario tiene permiso para ver este ticket

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrderDetails = useCallback(async () => {
    if (loadingAuth || !orderId) { // Esperar a que la autenticación cargue y que tengamos un orderId
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderDocRef = doc(db, "orders", orderId);
      const orderDocSnap = await getDoc(orderDocRef);

      if (!orderDocSnap.exists()) {
        setError("Pedido no encontrado. El ID de transacción podría ser inválido.");
        setLoading(false);
        return;
      }

      const fetchedOrder = { id: orderDocSnap.id, ...orderDocSnap.data() };

      // Opcional: Validar que el usuario actual es el comprador o un vendedor involucrado
      if (currentUser && fetchedOrder.buyerId !== currentUser.uid && !fetchedOrder.involvedSellerUids?.includes(currentUser.uid)) {
         setError("No tienes permiso para ver los detalles de este pedido.");
         setLoading(false);
         return;
      }

      setOrder(fetchedOrder);
      setLoading(false);
      console.log("Detalles del pedido obtenidos:", fetchedOrder);

    } catch (err) {
      console.error("Error al obtener los detalles del pedido:", err);
      setError("No se pudieron cargar los detalles del pedido. Intenta de nuevo.");
      setLoading(false);
    }
  }, [orderId, currentUser, loadingAuth]); // Dependencias para useCallback

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  if (loadingAuth || loading) {
    return <div className="text-center mt-20 text-blue-600 text-xl">Cargando detalles del pedido...</div>;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-600 text-xl">{error}</div>;
  }

  if (!order) {
    return <div className="text-center mt-20 text-gray-600 text-xl">No se encontró el pedido o no tienes permiso para verlo.</div>;
  }

  // Desglose de datos reales del pedido
  const transaction = {
    productImage: order.items[0]?.imageUrl || 'https://placehold.co/80x80/e0e0e0/333333?text=Producto', // Muestra la imagen del primer producto
    productName: order.items.length > 1 ? `${order.items[0].name} y ${order.items.length - 1} más` : order.items[0]?.name || 'N/A',
    vendorEmail: order.items[0]?.sellerEmail || 'N/A', // Asume que el primer ítem representa el vendedor principal
    buyerEmail: order.buyerEmail || 'N/A',
    date: order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A',
    transactionId: order.id,
    salePrice: order.orderTotal, // El total del pedido ya incluye todos los ítems
    // La comisión y el total para el vendedor son simulados, calcula según tu lógica de negocio
    commission: order.orderTotal * 0.10, // Ejemplo: 10% de comisión
  };
  const totalForVendor = transaction.salePrice - transaction.commission;

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <svg className="w-20 h-20 text-green-500 mx-auto mb-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
        <h2 className="text-4xl font-bold text-gray-800 mb-4">¡Compra Realizada con Éxito!</h2>
        <p className="text-xl text-gray-600 mb-8">Gracias por tu confianza en AUTO HOST.</p>

        <div className="text-left mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Resumen de la Transacción</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <div className="flex items-center space-x-3 col-span-2 mb-4">
              <img src={transaction.productImage} alt="Producto" className="w-16 h-16 rounded-md" />
              <div>
                <p className="font-semibold">{transaction.productName}</p>
              </div>
            </div>
            <p><span className="font-semibold">Vendido por:</span> {transaction.vendorEmail}</p>
            <p><span className="font-semibold">Comprador:</span> {transaction.buyerEmail}</p>
            <p><span className="font-semibold">Fecha de compra:</span> {transaction.date}</p>
            <p><span className="font-semibold">ID de transacción:</span> {transaction.transactionId}</p>
          </div>
        </div>

        <div className="text-left">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Desglose Financiero</h3>
          <div className="flex justify-between text-gray-700 mb-2">
            <span>Precio de Venta</span>
            <span className="font-bold text-blue-600">${transaction.salePrice.toLocaleString('es-MX')}</span>
          </div>
          <div className="flex justify-between text-gray-700 mb-2">
            <span>Comisión AUTO HOST (10%)</span>
            <span className="font-bold text-red-600">-${transaction.commission.toLocaleString('es-MX')}</span>
          </div>
          <div className="flex justify-between text-gray-800 font-bold text-xl border-t pt-4 mt-4">
            <span>Total para el Vendedor</span>
            <span className="text-green-600">${totalForVendor.toLocaleString('es-MX')}</span>
          </div>
          <p className="text-gray-500 text-sm mt-4">
            Este desglose es visible para fines de demostración. En una aplicación real, el comprador y el vendedor verían
            vistas diferentes del ticket.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TicketPage;