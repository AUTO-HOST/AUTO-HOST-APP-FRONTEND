import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
// Importa la URL base de tu API desde un archivo de configuración centralizado
// Asegúrate de que este archivo 'config.js' exista en tu carpeta 'src/'
import API_BASE_URL from '../config'; 


const AddProductPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

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
    sellerEmail: currentUser ? currentUser.email : '',
    isOnOffer: false,
    originalPrice: '',
    discountPercentage: '',
  });

  const [imageFile, setImageFile] = useState(null);

  const categories = ['Motor', 'Frenos', 'Suspensión', 'Eléctrico', 'Carrocería', 'Transmisión', 'Accesorios'];
  const conditions = ['Nuevo', 'Usado', 'Reacondicionado'];

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!currentUser || !currentUser.uid) {
      setError("No estás logueado como vendedor. Por favor, inicia sesión.");
      setLoading(false);
      return;
    }

    if (!productData.name || !productData.description || !productData.price || !productData.category || !productData.condition || !productData.stock) {
      setError("Por favor, completa todos los campos obligatorios.");
      setLoading(false);
      return;
    }
    if (!imageFile) {
      setError("Por favor, sube una imagen del producto.");
      setLoading(false);
      return;
    }

    try {
      const idToken = await currentUser.getIdToken();

      const formDataToSend = new FormData();

      for (const key in productData) {
        formDataToSend.append(key, productData[key]);
      }

      formDataToSend.append('user', currentUser.uid);
      formDataToSend.append('image', imageFile);

      // --- CAMBIO IMPORTANTE AQUÍ: Usando API_BASE_URL ---
      const response = await axios.post(`${API_BASE_URL}/products`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${idToken}`,
        },
      });
      // --- FIN DEL CAMBIO IMPORTANTE ---

      console.log("Producto añadido con éxito:", response.data);
      setSuccessMessage("¡Producto publicado exitosamente!");
      setProductData({
        name: '', description: '', price: '', category: 'Motor', condition: 'Nuevo', stock: '1',
        marca_refaccion: '', lado: '', numero_parte: '', sellerEmail: currentUser.email,
        isOnOffer: false, originalPrice: '', discountPercentage: '',
      });
      setImageFile(null);
      setTimeout(() => navigate('/seller-dashboard'), 2000);

    } catch (err) {
      console.error("Error al añadir producto:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(`Error: ${err.response.data.message}`);
      } else {
        setError("Error al publicar el producto. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="text-center mt-20">
        <p className="text-red-600 text-xl mb-4">Debes iniciar sesión para publicar productos.</p>
        <button onClick={() => navigate('/login')} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
          Inicia Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl bg-white rounded-lg shadow-lg my-8">
      <h2 className="text-3xl font-bold text-blue-800 text-center mb-6">Publicar Nuevo Producto</h2>
      <p className="text-gray-600 text-center mb-8">Llena los detalles de tu refacción para publicarla en AUTO HOST.</p>

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
          <label htmlFor="image" className="block text-gray-700 text-lg font-medium mb-2">Imagen del Producto *</label>
          <input
            type="file"
            id="image"
            name="image"
            className="w-full p-3 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            accept="image/*" // Solo acepta archivos de imagen
            onChange={handleImageChange}
            required // La imagen es requerida
            disabled={loading}
          />
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
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-semibold text-lg transition-colors duration-200"
          disabled={loading}
        >
          {loading ? 'Publicando...' : 'Publicar Producto'}
        </button>
        <Link to="/seller-dashboard" className="block text-center text-blue-600 hover:underline mt-4">
          Volver al Panel del Vendedor
        </Link>
      </form>
    </div>
  );
};

export default AddProductPage;