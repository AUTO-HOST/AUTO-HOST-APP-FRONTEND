import React from 'react';
import { useNavigate } from 'react-router-dom';

const OffersPage = () => { // Renombrado a OffersPage
  const navigate = useNavigate();
  return (
    <div className="container mx-auto p-8 text-center bg-white shadow-lg rounded-lg mt-8">
      <h2 className="text-4xl font-bold text-blue-800 mb-4">Ofertas Imperdibles</h2>
      <p className="text-xl text-gray-600 mb-8">
        ¡Aprovecha estos descuentos especiales marcados por nuestros vendedores!
      </p>
      <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
        <svg className="w-20 h-20 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
        <p className="text-gray-500 text-lg mb-2">No hay ofertas disponibles en este momento.</p>
        <p className="text-gray-500">Los vendedores aún no han marcado productos en oferta.</p>
      </div>
    </div>
  );
};

export default OffersPage;