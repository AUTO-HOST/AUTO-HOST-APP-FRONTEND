import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePageContent = () => {
  const navigate = useNavigate(); // Hook para la navegación programática

  return (
    <>
      {/* Sección Hero: Fondo azul oscuro, texto blanco, padding vertical, texto centrado, bordes inferiores redondeados, sombra */}
      <section className="bg-blue-800 text-white py-20 text-center rounded-b-lg shadow-lg">
        {/* Contenedor centrado para el contenido del hero */}
        <div className="container mx-auto px-4">
          {/* Título principal */}
          <h2 className="text-5xl font-extrabold mb-4 leading-tight">
            ENCUENTRA LAS MEJORES REFACCIONES
          </h2>
          {/* Descripción */}
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Calidad, confianza y los mejores precios del mercado de segunda mano.
          </p>
          {/* Botón para ir al catálogo */}
          <button onClick={() => navigate('/catalogo')} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-colors shadow-lg">
            Ir al Catálogo de Piezas
          </button>
        </div>
      </section>

      {/* Sección "¿Cómo funciona?": Fondo blanco, bordes redondeados, sombra, margen superior */}
      <section className="py-12 bg-white rounded-lg shadow-md mt-8 container mx-auto px-4">
        {/* Título de la sección */}
        <h3 className="text-3xl font-bold text-center text-gray-800 mb-8">¿Cómo funciona?</h3>
        {/* Grid responsivo para las 3 columnas de características */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {/* Columna 1: Busca tu pieza */}
          <div className="flex flex-col items-center p-4">
            {/* Icono de lupa (SVG inline) */}
            <svg className="w-16 h-16 text-blue-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">1. Busca tu pieza</h4>
            <p className="text-gray-600">
              Usa nuestros filtros avanzados para encontrar la refacción exacta que necesitas por nombre,
              categoría o marca.
            </p>
          </div>

          {/* Columna 2: Compra con Confianza */}
          <div className="flex flex-col items-center p-4">
            {/* Icono de escudo con check (SVG inline) */}
            <svg className="w-16 h-16 text-green-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 4.016A11.955 11.955 0 002.944 12c0 2.97.97 5.728 2.618 8.056A11.955 11.955 0 0012 21.056c2.97 0 5.728-.97 8.056-2.618A11.955 11.955 0 0021.056 12c0-2.97-.97-5.728-2.618-8.056z"></path></svg>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">2. Compra con Confianza</h4>
            <p className="text-gray-600">
              Todas las transacciones son seguras. Tu pago se retiene hasta que confirmes la recepción del
              producto.
            </p>
          </div>

          {/* Columna 3: Recibe tu refacción */}
          <div className="flex flex-col items-center p-4">
            {/* Icono de caja (SVG inline) */}
            <svg className="w-16 h-16 text-purple-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4m0-10h.01"></path></svg>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">3. Recibe tu refacción</h4>
            <p className="text-gray-600">
              Recibe tu pieza directamente en la puerta de tu casa o taller, con seguimiento de envío
              integrado.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePageContent; // Exporta el componente