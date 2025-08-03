import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// Importa la URL base de tu API desde el archivo de configuración centralizado
// Asegúrate de que este archivo 'config.js' exista en tu carpeta 'src/'
import API_BASE_URL from '../config';

const OffersPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log("Intentando cargar productos en oferta...");

    try {
      // Endpoint para obtener productos en oferta
      // Asumimos que tu backend /api/products puede filtrar por 'isOnOffer=true'
      const apiUrl = `${API_BASE_URL}/products?isOnOffer=true`;
      console.log("URL de ofertas:", apiUrl);

      const response = await axios.get(apiUrl);
      console.log("Respuesta de ofertas:", response.data);

      setProducts(response.data.products); // Asumiendo que la respuesta tiene un campo 'products'
      setLoading(false);
    } catch (err) {
      console.error("Error al obtener productos en oferta:", err);
      setError("No se pudieron cargar las ofertas. Intenta de nuevo más tarde.");
      setLoading(false);
    }
  }, []); // Sin dependencias, solo se ejecuta una vez al montar

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const handleViewDetails = (productId) => {
    navigate(`/products/${productId}`);
  };

  if (loading) {
    return <div className="text-center mt-20 text-blue-600 text-xl">Cargando ofertas...</div>;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-600 text-xl">{error}</div>;
  }

  return (
    <div className="container mx-auto p-8 text-center bg-white shadow-lg rounded-lg my-8">
      <h2 className="text-4xl font-bold text-blue-800 mb-4">Ofertas Imperdibles</h2>
      <p className="text-xl text-gray-600 mb-8">
        ¡Aprovecha estos descuentos especiales marcados por nuestros vendedores!
      </p>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <svg className="w-20 h-20 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
          <p className="text-gray-500 text-lg mb-2">No hay ofertas disponibles en este momento.</p>
          <p className="text-gray-500">Los vendedores aún no han marcado productos en oferta.</p>
          <button onClick={() => navigate('/seller/add-product')} className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md transition-colors">
            ¡Marca tus productos en oferta!
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center text-center text-gray-800 max-w-[300px] mx-auto h-[400px] overflow-hidden relative">
                {/* Etiqueta de oferta */}
                <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">¡OFERTA!</span>
                <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">{product.discountPercentage}% OFF</span>

              {/* Contenedor de la imagen con altura fija */}
              <div className="w-full h-48 mb-4 overflow-hidden rounded-md flex items-center justify-center bg-gray-100">
                <img
                  src={product.imageUrl || `https://placehold.it/300x200?text=${product.name.substring(0, Math.min(product.name.length, 10))}`}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              </div>
              <h4 className="text-lg font-semibold mb-2 line-clamp-2">{product.name}</h4>
              {/* Precios: Original tachado y el de oferta */}
              <p className="text-sm text-gray-500 line-through">${product.originalPrice.toLocaleString('es-MX')}</p>
              <p className="font-bold text-xl mb-4 text-red-600">${product.price.toLocaleString('es-MX')}</p>
              <button onClick={() => handleViewDetails(product._id)} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors w-full">
                Ver Detalles
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OffersPage;