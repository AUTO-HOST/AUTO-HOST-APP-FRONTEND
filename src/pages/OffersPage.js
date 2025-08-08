import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';

const OffersPage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOffers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const apiUrl = `${API_BASE_URL}/products?isOnOffer=true`;
            const response = await axios.get(apiUrl);
            // CORRECCIÓN: Nos aseguramos de que 'products' sea siempre un array
            setProducts(response.data.products || []);
            setLoading(false);
        } catch (err) {
            console.error("Error al obtener productos en oferta:", err);
            setError("No se pudieron cargar las ofertas. Intenta de nuevo más tarde.");
            setLoading(false);
        }
    }, []);

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

            {/* CORRECCIÓN: Comprobamos si 'products' existe antes de hacer el map */}
            {products && products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-gray-500 text-lg">No hay ofertas disponibles en este momento.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        // CORRECCIÓN: Comprobamos si el producto individual y sus precios existen
                        product && product.originalPrice != null && product.price != null && (
                            <div key={product._id} className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center text-center">
                                <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">¡OFERTA!</span>
                                {product.discountPercentage &&
                                    <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">{product.discountPercentage}% OFF</span>
                                }
                                <div className="w-full h-48 mb-4">
                                    <img
                                        src={product.imageUrl || `https://placehold.it/300x200`}
                                        alt={product.name}
                                        className="w-full h-full object-cover rounded-md"
                                    />
                                </div>
                                <h4 className="text-lg font-semibold mb-2">{product.name}</h4>
                                <p className="text-sm text-gray-500 line-through">${product.originalPrice.toLocaleString('es-MX')}</p>
                                <p className="font-bold text-xl mb-4 text-red-600">${product.price.toLocaleString('es-MX')}</p>
                                <button onClick={() => handleViewDetails(product._id)} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md w-full">
                                    Ver Detalles
                                </button>
                            </div>
                        )
                    ))}
                </div>
            )}
        </div>
    );
};

export default OffersPage;