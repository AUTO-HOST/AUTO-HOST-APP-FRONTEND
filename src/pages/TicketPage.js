import React from 'react';

const TicketPage = () => { // Renombrado a TicketPage
  // Datos de ejemplo para la transacción
  const transaction = {
    productImage: 'https://placehold.co/80x80/e0e0e0/333333?text=Cofre',
    productName: 'Cofre Toyota Corolla 2022 Genérica Cofre',
    vendorEmail: 'pedrodazaevjuarezolguin@gmail.com',
    buyerEmail: 'pedrodazaevjuarezolguin@gmail.com',
    date: '10/7/2025',
    transactionId: 'AH-17522080317643',
    salePrice: 1524,
    commission: 152.4,
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
            <span className="font-bold text-blue-600">${transaction.salePrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-700 mb-2">
            <span>Comisión AUTO HOST (10%)</span>
            <span className="font-bold text-red-600">-${transaction.commission.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-800 font-bold text-xl border-t pt-4 mt-4">
            <span>Total para el Vendedor</span>
            <span className="text-green-600">${totalForVendor.toLocaleString()}</span>
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