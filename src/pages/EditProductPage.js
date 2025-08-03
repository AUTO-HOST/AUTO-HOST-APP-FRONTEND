import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
// Importa la URL base de tu API desde un archivo de configuración centralizado
// Asegúrate de que este archivo 'config.js' exista en tu carpeta 'src/' con la URL de tu backend
import API_BASE_URL from '../config'; 


const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Motor', 
    condition: 'Nuevo', 
    stock: '1', 
    marca_refaccion: '', 
    lado: '', 
    numero_parte: '', 
    sellerEmail: '', 
    isOnOffer: false,
    originalPrice: '',
    discountPercentage: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const categories = ['Motor', 'Frenos', 'Suspensión', 'Eléctrico', 'Carrocería', 'Transmisión', 'Accesorios'];
  const conditions = ['Nuevo', 'Usado', 'Reacondicionado'];

  const fetchProductDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // --- CAMBIO IMPORTANTE AQUÍ: Usando API_BASE_URL ---
      const response = await axios.get(`${API_BASE_URL}/products/${id}`);
      // --- FIN DEL CAMBIO IMPORTANTE ---
      const fetchedProduct = response.data;

      if (!currentUser || fetchedProduct.user !== currentUser.uid) {
        setError("Acceso denegado. No tienes permiso para editar este producto.");
        setLoading(false);
        return;
      }

      setProductData({
        name: fetchedProduct.name || '',
        description: fetchedProduct.description || '',
        price: fetchedProduct.price || '',
        category: fetchedProduct.category || 'Motor',
        condition: fetchedProduct.condition || 'Nuevo',
        stock: fetchedProduct.stock || '1',
        marca_refaccion: fetchedProduct.marca_refaccion || '',
        lado: fetchedProduct.lado || '',
        numero_parte: fetchedProduct.numero_parte || '',
        sellerEmail: fetchedProduct.sellerEmail || currentUser.email,
        isOnOffer: fetchedProduct.isOnOffer || false,
        originalPrice: fetchedProduct.originalPrice || '',
        discountPercentage: fetchedProduct.discountPercentage || '',
      });
      setCurrentImageUrl(fetchedProduct.imageUrl || '');
      setLoading(false);
    } catch (err) {
      console.error("Error al obtener detalles del producto para edición:", err);
      setLoading(false);
      if (err.response && err.response.status === 404) {
        setError("Producto no encontrado para edición.");
      } else if (err.response && err.response.status === 403) {
        setError("No tienes permiso para editar este producto.");
      } else {
        setError("Error al cargar los detalles del producto. Intenta de nuevo.");
      }
    }
  }, [id, currentUser]);

  useEffect(() => {
    fetchProductDetails();
  }, [fetchProductDetails]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    } else {
      setImageFile(null);
    }
  };

  // --- FUNCIÓN handleSubmit CON LOGS DE DEPURACIÓN ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("DEBUG-FRONTEND: handleSubmit iniciado."); // Log 1

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    console.log("DEBUG-FRONTEND: Validando usuario logueado."); // Log 2
    if (!currentUser || !currentUser.uid) {
      setError("No estás logueado. Por favor, inicia sesión.");
      setLoading(false);
      console.log("DEBUG-FRONTEND: Error: Usuario no logueado."); // Log 3
      return;
    }

    console.log("DEBUG-FRONTEND: Validando campos obligatorios."); // Log 4
    if (!productData.name || !productData.description || !productData.price || !productData.category || !productData.condition || !productData.stock) {
        setError("Por favor, completa todos los campos obligatorios.");
        setLoading(false);
        console.log("DEBUG-FRONTEND: Error: Campos obligatorios incompletos."); // Log 5
        return;
    }

    try {
      console.log("DEBUG-FRONTEND: Obteniendo ID Token."); // Log 6
      const idToken = await currentUser.getIdToken();
      console.log("DEBUG-FRONTEND: ID Token obtenido. Preparando FormData."); // Log 7

      const formDataToSend = new FormData();
      
      for (const key in productData) {
        formDataToSend.append(key, productData[key]);
      }
      
      if (imageFile) {
        formDataToSend.append('image', imageFile); 
        console.log("DEBUG-FRONTEND: Nueva imagen seleccionada y añadida a FormData."); // Log 8
      } else {
        console.log("DEBUG-FRONTEND: No se seleccionó nueva imagen."); // Log 9
      }

      console.log("DEBUG-FRONTEND: Enviando petición PUT a backend."); // Log 10
      // --- CAMBIO IMPORTANTE AQUÍ: Usando API_BASE_URL ---
      const response = await axios.put(`${API_BASE_URL}/products/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${idToken}`, 
        },
      });
      // --- FIN DEL CAMBIO IMPORTANTE ---

      console.log("DEBUG-FRONTEND: Petición PUT enviada con éxito. Respuesta recibida:", response.data); // Log 11
      setSuccessMessage("¡Producto actualizado exitosamente!");
      setLoading(false);
      setTimeout(() => navigate('/seller-dashboard'), 2000); 

    } catch (err) {
      console.error("DEBUG-FRONTEND: Error en la petición PUT (catch):", err.response ? err.response.data : err.message); // Log 12
      setError(`Error al actualizar producto: ${err.response && err.response.data && err.response.data.message ? err.response.data.message : err.message}`);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-20 text-blue-600 text-xl">Cargando producto para edición...</div>;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-600 text-xl">{error}</div>;
  }

  if (!productData.name && !loading) {
    return <div className="text-center mt-20 text-gray-600 text-xl">Producto no encontrado o acceso denegado.</div>;
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl bg-white rounded-lg shadow-lg my-8">
      <h2 className="text-3xl font-bold text-blue-800 text-center mb-6">Editar Producto</h2>
      <p className="text-gray-600 text-center mb-8">Modifica los detalles de tu refacción.</p>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {successMessage && <p className="text-green-600 text-center mb-4">{successMessage}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre del Producto */}
        <div>
          <label htmlFor="name" className="block text-gray-700 text-lg font-medium mb-2">Nombre del Producto *</label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ej: Faro delantero derecho, Bomba de gasolina"
            value={productData.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="description" className="block text-gray-700 text-lg font-medium mb-2">Descripción *</label>
          <textarea
            id="description"
            name="description"
            rows="4"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe tu refacción detalladamente (compatibilidad, estado, etc.)"
            value={productData.description}
            onChange={handleChange}
            required
            disabled={loading}
          ></textarea>
        </div>

        {/* Precio y Stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-gray-700 text-lg font-medium mb-2">Precio *</label>
            <input
              type="number"
              id="price"
              name="price"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="$ Ej: 500.00"
              value={productData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="stock" className="block text-gray-700 text-lg font-medium mb-2">Stock *</label>
            <input
              type="number"
              id="stock"
              name="stock"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: 1, 5"
              value={productData.stock}
              onChange={handleChange}
              required
              min="1"
              disabled={loading}
            />
          </div>
        </div>

        {/* Categoría y Condición */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-gray-700 text-lg font-medium mb-2">Categoría *</label>
            <select
              id="category"
              name="category"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={productData.category}
              onChange={handleChange}
              required
              disabled={loading}
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="condition" className="block text-gray-700 text-lg font-medium mb-2">Condición *</label>
            <select
              id="condition"
              name="condition"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={productData.condition}
              onChange={handleChange}
              required
              disabled={loading}
            >
              {conditions.map(cond => <option key={cond} value={cond}>{cond}</option>)}
            </select>
          </div>
        </div>

        {/* Campos específicos de Refacción */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="marca_refaccion" className="block text-gray-700 text-lg font-medium mb-2">Marca de Refacción</label>
            <input
              type="text"
              id="marca_refaccion"
              name="marca_refaccion"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: Bosch, NGK"
              value={productData.marca_refaccion}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="lado" className="block text-gray-700 text-lg font-medium mb-2">Lado (si aplica)</label>
            <input
              type="text"
              id="lado"
              name="lado"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: Izquierdo, Derecho"
              value={productData.lado}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="numero_parte" className="block text-gray-700 text-lg font-medium mb-2">Número de Parte</label>
            <input
              type="text"
              id="numero_parte"
              name="numero_parte"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: ABC12345, #555"
              value={productData.numero_parte}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        {/* Imagen del Producto */}
        <div>
          <label htmlFor="image" className="block text-gray-700 text-lg font-medium mb-2">Imagen del Producto</label>
          {currentImageUrl && (
            <div className="mb-2">
              <p className="text-sm text-gray-600">Imagen actual:</p>
              <img src={currentImageUrl} alt="Current Product" className="w-32 h-32 object-cover rounded-md border border-gray-200" />
            </div>
          )}
          <input
            type="file"
            id="image"
            name="image"
            className="w-full p-3 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            accept="image/*"
            onChange={handleImageChange}
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">Sube una nueva imagen para reemplazar la actual.</p>
        </div>

        {/* Campos de Oferta (Opcional) */}
        <div className="border border-gray-300 p-4 rounded-md space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isOnOffer"
              name="isOnOffer"
              checked={productData.isOnOffer}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={loading}
            />
            <label htmlFor="isOnOffer" className="ml-2 text-gray-700 font-medium">¿Está en oferta?</label>
          </div>
          {productData.isOnOffer && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="originalPrice" className="block text-gray-700 text-lg font-medium mb-2">Precio Original</label>
                <input
                  type="number"
                  id="originalPrice"
                  name="originalPrice"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="$ Ej: 700.00"
                  value={productData.originalPrice}
                  onChange={handleChange}
                  required={productData.isOnOffer}
                  min="0"
                  step="0.01"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="discountPercentage" className="block text-gray-700 text-lg font-medium mb-2">Porcentaje de Descuento</label>
                <input
                  type="number"
                  id="discountPercentage"
                  name="discountPercentage"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: 10, 25"
                  value={productData.discountPercentage}
                  onChange={handleChange}
                  required={productData.isOnOffer}
                  min="0"
                  max="100"
                  disabled={loading}
                />
              </div>
            </div>
          )}
        </div>

        {/* Botón de Enviar Formulario */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold text-lg transition-colors duration-200"
          disabled={loading}
        >
          {loading ? 'Actualizando...' : 'Actualizar Producto'}
        </button>
        <Link to="/seller-dashboard" className="block text-center text-blue-600 hover:underline mt-4">
          Volver al Panel del Vendedor
        </Link>
      </form>
    </div>
  );
};

export default EditProductPage;