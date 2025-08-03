import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// Importa la URL base de tu API desde el archivo de configuración centralizado
// Asegúrate de que este archivo 'config.js' exista en tu carpeta 'src/'
import API_BASE_URL from '../config'; 

const CatalogPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Estados para los filtros ---
  const [searchName, setSearchName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');

  // --- ESTADOS PARA LA PAGINACIÓN ---
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(9);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // --- NUEVO ESTADO PARA EL ORDENAMIENTO ---
  const [sortOrder, setSortOrder] = useState('recent'); // 'recent', 'priceAsc', 'priceDesc'

  // --- Opciones para los filtros ---
  const categories = ['Motor', 'Frenos', 'Suspensión', 'Eléctrico', 'Carrocería', 'Transmisión', 'Accesorios'];
  const conditions = ['Nuevo', 'Usado', 'Reacondicionado'];
  const brands = ['Chevrolet', 'Nissan', 'Volkswagen', 'Ford', 'Toyota', 'Honda', 'BMW', 'Mercedes-Benz'];

  // --- Función para limpiar filtros ---
  const handleClearFilters = () => {
    setSearchName('');
    setSelectedCategory('');
    setSelectedCondition('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedBrand('');
    setSortOrder('recent'); // Al limpiar filtros, también reseteamos el orden
    setCurrentPage(1);
  };

  // Manejador para checkboxes/radio buttons y ordenamiento
  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1); // Al cambiar cualquier filtro, volvemos a la primera página
    switch (filterType) {
      case 'category':
        setSelectedCategory(value);
        break;
      case 'condition':
        setSelectedCondition(value);
        break;
      case 'brand':
        setSelectedBrand(value);
        break;
      case 'sortOrder': // Nuevo caso para el ordenamiento
        setSortOrder(value);
        break;
      default:
        break;
    }
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log("Intentando cargar productos con filtros, paginación y ordenamiento...");

    try {
      // --- Construir los parámetros de la URL ---
      const queryParams = new URLSearchParams();
      if (searchName) queryParams.append('name', searchName);
      if (selectedCategory) queryParams.append('category', selectedCategory);
      if (selectedCondition) queryParams.append('condition', selectedCondition);
      if (minPrice) queryParams.append('minPrice', minPrice);
      if (maxPrice) queryParams.append('maxPrice', maxPrice);
      if (selectedBrand) queryParams.append('brand', selectedBrand);

      // ¡AÑADIR PARÁMETROS DE PAGINACIÓN Y ORDENAMIENTO!
      queryParams.append('page', currentPage);
      queryParams.append('limit', productsPerPage);
      queryParams.append('sort', sortOrder); // <-- ¡AÑADIDO PARÁMETRO DE ORDENAMIENTO!

      // --- CAMBIO IMPORTANTE AQUÍ: Usando API_BASE_URL ---
      const apiUrl = `${API_BASE_URL}/products?${queryParams.toString()}`;
      // --- FIN DEL CAMBIO IMPORTANTE ---
      console.log("URL de la API con filtros, paginación y ordenamiento:", apiUrl);

      const response = await axios.get(apiUrl);
      console.log("Respuesta completa de productos con paginación y ordenamiento:", response.data);

      setProducts(response.data.products);
      setTotalProducts(response.data.totalProducts);
      setTotalPages(Math.ceil(response.data.totalProducts / productsPerPage));

      setLoading(false);
    } catch (err) {
      console.error("Error al obtener productos con filtros, paginación y ordenamiento:", err);
      setError("No se pudieron cargar los productos. Intenta de nuevo más tarde.");
      setLoading(false);
    }
  }, [searchName, selectedCategory, selectedCondition, minPrice, maxPrice, selectedBrand, currentPage, productsPerPage, sortOrder]); // Dependencias actualizadas

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [fetchProducts]);

  const handleViewDetails = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (loading) {
    return <div className="text-center mt-20 text-blue-600 text-xl">Cargando productos...</div>;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-600 text-xl">{error}</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-4xl font-bold text-blue-800 mb-8">Catálogo de Refacciones</h2>
      <div className="flex flex-col md:flex-row gap-8">
        {/* --- Panel de Filtros --- */}
        <div className="w-full md:w-1/4 bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold text-gray-800 flex items-center">
              <span className="mr-2">
                <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01.293.707V19a1 1 0 01-1 1H4a1 1 0 01-1-1V7.293a1 1 0 01.293-.707L3 4z"></path>
                </svg>
              </span>
              Filtros
            </h3>
            <button onClick={handleClearFilters} className="text-sm text-blue-600 hover:text-blue-800">Limpiar</button>
          </div>

          {/* Buscar por nombre */}
          <div className="mb-6">
            <label htmlFor="searchName" className="block text-gray-700 text-lg font-medium mb-2">Buscar por nombre</label>
            <input
              type="text"
              id="searchName"
              name="searchName"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej., Faro, Bomba..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>

          {/* Categoría - Radio Buttons */}
          <div className="mb-6">
            <label className="block text-gray-700 text-lg font-medium mb-2">Categoría</label>
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat} className="flex items-center">
                  <input
                    type="radio"
                    id={`category-${cat}`}
                    name="category"
                    value={cat}
                    checked={selectedCategory === cat}
                    onChange={() => handleFilterChange('category', cat)}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor={`category-${cat}`} className="ml-2 text-gray-800">{cat}</label>
                </div>
              ))}
              <div className="flex items-center">
                <input
                  type="radio"
                  id="category-Todas"
                  name="category"
                  value=""
                  checked={selectedCategory === ''}
                  onChange={() => handleFilterChange('category', '')}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="category-Todas" className="ml-2 text-gray-800 font-semibold">Todas</label>
              </div>
            </div>
          </div>

          {/* Condición - Radio Buttons */}
          <div className="mb-6">
            <label className="block text-gray-700 text-lg font-medium mb-2">Condición</label>
            <div className="space-y-2">
              {conditions.map((cond) => (
                <div key={cond} className="flex items-center">
                  <input
                    type="radio"
                    id={`condition-${cond}`}
                    name="condition"
                    value={cond}
                    checked={selectedCondition === cond}
                    onChange={() => handleFilterChange('condition', cond)}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor={`condition-${cond}`} className="ml-2 text-gray-800">{cond}</label>
                </div>
              ))}
              <div className="flex items-center">
                <input
                  type="radio"
                  id="condition-Todas"
                  name="condition"
                  value=""
                  checked={selectedCondition === ''}
                  onChange={() => handleFilterChange('condition', '')}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="condition-Todas" className="ml-2 text-gray-800 font-semibold">Todas</label>
              </div>
            </div>
          </div>

          {/* Precio */}
          <div className="mb-6">
            <label className="block text-gray-700 text-lg font-medium mb-2">Precio</label>
            <div className="flex gap-4">
              <input
                type="number"
                className="w-1/2 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <input
                type="number"
                className="w-1/2 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Marca de la refacción - Radio Buttons */}
          <div className="mb-6">
            <label htmlFor="brand" className="block text-gray-700 text-lg font-medium mb-2">Marca de la refacción</label>
            <div className="space-y-2">
              {brands.map((brand) => (
                <div key={brand} className="flex items-center">
                  <input
                    type="radio"
                    id={`brand-${brand}`}
                    name="brand"
                    value={brand}
                    checked={selectedBrand === brand}
                    onChange={() => handleFilterChange('brand', brand)}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor={`brand-${brand}`} className="ml-2 text-gray-800">{brand}</label>
                </div>
              ))}
              <div className="flex items-center">
                <input
                  type="radio"
                  id="brand-Todas"
                  name="brand"
                  value=""
                  checked={selectedBrand === ''}
                  onChange={() => handleFilterChange('brand', '')}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="brand-Todas" className="ml-2 text-gray-800 font-semibold">Todas</label>
              </div>
            </div>
          </div>

          {/* --- Control de Ordenamiento (NUEVO) --- */}
          <div className="mb-6">
            <label htmlFor="sortOrder" className="block text-gray-700 text-lg font-medium mb-2">Ordenar por</label>
            <select
              id="sortOrder"
              name="sortOrder"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            >
              <option value="recent">Más Recientes</option>
              <option value="priceAsc">Precio: Menor a Mayor</option>
              <option value="priceDesc">Precio: Mayor a Menor</option>
            </select>
          </div>
        </div>

        {/* --- Lista de Productos --- */}
        <div className="w-full md:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.length > 0 ? (
            products
              .filter(product => product.name !== 'a3' && product.name !== 'a22')
              .map((product) => (
              <div key={product._id} className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center text-center text-gray-800 max-w-[300px] mx-auto h-[400px] overflow-hidden">
                {/* Contenedor de la imagen con altura fija */}
                <div className="w-full h-48 mb-4 overflow-hidden rounded-md flex items-center justify-center bg-gray-100">
                  <img
                    src={product.imageUrl || `https://placehold.it/300x200?text=${product.name.substring(0, Math.min(product.name.length, 10))}`}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <h4 className="text-lg font-semibold mb-2 line-clamp-2">{product.name}</h4>
                <p className="font-bold text-xl mb-4 text-blue-600">${product.price.toLocaleString('es-MX')}</p>
                <button onClick={() => handleViewDetails(product._id)} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors w-full">
                  Ver Detalles
                </button>
              </div>
            ))
          ) : (
            <div className="md:col-span-3 text-center text-gray-500 text-xl mt-10">No hay productos disponibles en este momento.</div>
          )}
        </div>
      </div>

      {/* --- Controles de Paginación --- */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
          >
            Anterior
          </button>
          <span className="text-lg font-semibold">Página {currentPage} de {totalPages}</span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default CatalogPage;