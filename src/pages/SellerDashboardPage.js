import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

const SellerDashboardPage = ({ onSellerDashboard }) => {
  const navigate = useNavigate();
  const { currentUser, loadingAuth } = useAuth();
  const [sellerProducts, setSellerProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [productNameToDelete, setProductNameToDelete] = useState('');

  useEffect(() => {
    if (onSellerDashboard) {
      onSellerDashboard();
    }
  }, [onSellerDashboard]);

  const fetchSellerProducts = useCallback(async () => {
    if (loadingAuth) return;

    if (!currentUser || !currentUser.firestoreProfile || currentUser.firestoreProfile.userType !== 'Vendedor') {
      setLoadingProducts(false);
      setError("Acceso denegado. Debes iniciar sesión como vendedor para ver este panel.");
      return;
    }

    setLoadingProducts(true);
    setError(null);
    console.log(`Intentando cargar productos para el vendedor: ${currentUser.uid}`);

    try {
      const response = await axios.get(`http://localhost:5000/api/products?sellerId=${currentUser.uid}`);
      console.log("Productos del vendedor obtenidos:", response.data);
      setSellerProducts(Array.isArray(response.data.products) ? response.data.products : []);
      setLoadingProducts(false);
    } catch (err) {
      console.error("Error al obtener productos del vendedor:", err);
      setError("No se pudieron cargar tus productos. Intenta de nuevo más tarde.");
      setLoadingProducts(false);
    }
  }, [currentUser, loadingAuth]);

  useEffect(() => {
    fetchSellerProducts();
  }, [fetchSellerProducts]);

  const handleEditProduct = (productId) => {
    console.log("Editar producto:", productId);
    navigate(`/seller/edit-product/${productId}`);
  };

  const handleDeleteProduct = (productId, productName) => {
    console.log("DEBUG-FRONTEND: Inició handleDeleteProduct para ID:", productId, "Nombre:", productName);
    setProductToDelete(productId);
    setProductNameToDelete(productName);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    console.log("DEBUG-FRONTEND: ¡handleConfirmDelete iniciado!");
    if (!productToDelete) {
        console.log("DEBUG-FRONTEND: productToDelete es null, cancelando confirmación real.");
        return; 
    }

    setLoadingProducts(true); 
    setError(null);

    try {
      console.log("DEBUG-FRONTEND: Verificando currentUser y token antes de DELETE.");
      if (!currentUser || !currentUser.getIdToken) {
        setError("Error de autenticación. Por favor, inicia sesión de nuevo.");
        setLoadingProducts(false);
        console.log("DEBUG-FRONTEND: Error: No hay currentUser o getIdToken no disponible para DELETE.");
        return;
      }
      const idToken = await currentUser.getIdToken();
      console.log("DEBUG-FRONTEND: ID Token obtenido. Iniciando petición axios.delete.");
      console.log("DEBUG-FRONTEND: URL de DELETE:", `http://localhost:5000/api/products/${productToDelete}`);

      const response = await axios.delete(`http://localhost:5000/api/products/${productToDelete}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      console.log("DEBUG-FRONTEND: Petición DELETE enviada con éxito. Respuesta recibida:", response.data);
      setSellerProducts(prevProducts => prevProducts.filter(product => product._id !== productToDelete));
      setLoadingProducts(false);
      alert("¡Producto eliminado exitosamente!"); 
      console.log("DEBUG-FRONTEND: Producto eliminado de la UI y mensaje de éxito.");

    } catch (err) {
      console.error("DEBUG-FRONTEND: Error en la petición DELETE:", err.response ? err.response.data : err.message);
      setError(`Error al eliminar producto: ${err.response && err.response.data && err.response.data.message ? err.response.data.message : err.message}`);
      setLoadingProducts(false);
    } finally {
        setProductToDelete(null);
        setProductNameToDelete('');
        setIsModalOpen(false);
    }
  };

  const handleToggleFavorite = (productId) => {
    console.log("Alternar favorito para producto:", productId);
    // Lógica para marcar/desmarcar como favorito (si aplica)
  };

  if (loadingAuth || loadingProducts) {
    return (
      <div className="text-center mt-20 text-blue-600 text-xl">
        {loadingAuth ? 'Verificando acceso al panel...' : 'Cargando tus productos...'}
      </div>
    );
  }

  if (error) {
    return <div className="text-center mt-20 text-red-600 text-xl">{error}</div>;
  }

  if (!currentUser || !currentUser.firestoreProfile || currentUser.firestoreProfile.userType !== 'Vendedor') {
    return (
      <div className="text-center mt-20">
        <p className="text-red-600 text-xl mb-4">No tienes permiso para acceder a este panel. Debes iniciar sesión como vendedor.</p>
        <button onClick={() => navigate('/login')} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
          Inicia Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      {/* Botón superior de Añadir Refacción */}
      <div className="flex justify-end mb-6">
        <button 
          onClick={() => navigate('/seller/add-product')} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full flex items-center shadow-lg transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
          Añadir Refacción
        </button>
      </div>

      <h2 className="text-4xl font-bold text-blue-800 mb-8">Portal del Vendedor</h2>
      <p className="text-gray-600 mb-8">Bienvenido de nuevo, {currentUser.firestoreProfile.name || currentUser.email}.</p>

      {/* --- Navegación Interna del Vendedor (NUEVO) --- */}
      <div class="flex justify-center space-x-4 mb-8">
        <button 
          onClick={() => navigate('/seller-dashboard')}
          className="px-6 py-2 rounded-full font-semibold text-lg transition-colors 
                     bg-blue-600 text-white shadow-md hover:bg-blue-700"
        >
          Mi Dashboard
        </button>
        <button 
          onClick={() => navigate('/seller/orders')}
          className="px-6 py-2 rounded-full font-semibold text-lg transition-colors 
                     bg-gray-200 text-gray-800 hover:bg-gray-300"
        >
          Mis Ventas
        </button>
      </div>

      {/* --- Dashboard Summary Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Productos Totales */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Productos Totales</p>
            <p className="text-3xl font-bold text-blue-700">{Array.isArray(sellerProducts) ? sellerProducts.length : 0}</p>
          </div>
          <div className="rounded-full p-3 bg-blue-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-700" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6h-2c0-2.21-1.79-4-4-4s-4 1.79-4 4H6c-1.11 0-2 .89-2 2v10c0 1.11.89 2 2 2h12c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM10 4h4v2h-4V4zm6 14H6V8h12v10z"/>
            </svg>
          </div>
        </div>

        {/* Valor del Inventario - Círculo verde con ICONO DE DÓLAR FUERTE */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Valor del Inventario</p>
            <p className="text-3xl font-bold text-green-700">
              ${Array.isArray(sellerProducts) ? sellerProducts.reduce((sum, product) => sum + product.price, 0).toLocaleString('es-MX') : '0'}
            </p>
          </div>
          <div className="rounded-full p-3 bg-green-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-700" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 18H8V6h2c.83 0 1.5-.67 1.5-1.5S10.83 3 10 3H8V2H10c1.83 0 3.5 1.67 3.5 3.5s-1.67 3.5-3.5 3.5H8v2h2c1.83 0 3.5 1.67 3.5 3.5S11.83 18 10 18H8v2h2c1.83 0 3.5-1.67 3.5-3.5s-1.67-3.5-3.5-3.5H8v2z"/>
            </svg>
          </div>
        </div>

        {/* Ventas (30 días) - Círculo naranja con ICONO DE GRÁFICO ASCENDENTE FUERTE */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Ventas (30 días)</p>
            <p className="text-3xl font-bold text-orange-700">12</p>
          </div>
          <div className="rounded-full p-3 bg-orange-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-orange-700" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 6L12 10L8 6L2 12V16H22V8L16 6zM2 18H22V20H2V18z"/>
            </svg>
          </div>
        </div>

        {/* Calificación */}
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Calificación</p>
            <p className="text-3xl font-bold text-yellow-700">4.8 / 5</p>
          </div>
          <div className="rounded-full p-3 bg-yellow-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-yellow-700" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 17.27L18.18 21.02L16.54 13.88L22 9.27L14.81 8.64L12 2L9.19 8.64L2 9.27L7.46 13.88L5.82 21.02L12 17.27Z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* --- Mi Inventario (Tabla) --- */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Mi Inventario</h3>
        {Array.isArray(sellerProducts) && sellerProducts.length === 0 ? (
          <p className="text-gray-600 text-center">No has publicado ningún producto aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PRODUCTO</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ESTADO</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STOCK</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PRECIO</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(sellerProducts) && sellerProducts.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-full object-cover" 
                            src={product.imageUrl || `https://placehold.it/40x40?text=${product.name.substring(0, Math.min(product.name.length, 3))}`} 
                            alt={product.name} 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.condition === 'Nuevo' ? 'bg-green-100 text-green-800' :
                        product.condition === 'Usado' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {product.condition}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.price.toLocaleString('es-MX')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button onClick={() => handleToggleFavorite(product._id)} className="text-gray-400 hover:text-yellow-500">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 17.27L18.18 21.02L16.54 13.88L22 9.27L14.81 8.64L12 2L9.19 8.64L2 9.27L7.46 13.88L5.82 21.02L12 17.27Z"/>
                          </svg>
                        </button>
                        <button onClick={() => handleEditProduct(product._id)} className="text-blue-600 hover:text-blue-900">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 2.34 2.34 1.83-1.83zM3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/>
                          </svg>
                        </button>
                        <button onClick={() => handleDeleteProduct(product._id, product.name)} className="text-red-600 hover:text-red-900">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemType="este producto"
        itemName={productNameToDelete}
      />
    </div>
  );
};

export default SellerDashboardPage;
