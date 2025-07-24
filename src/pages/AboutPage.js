import React from 'react'; // Corregido: solo React
import { useNavigate } from 'react-router-dom'; // Importamos useNavigate

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-8 my-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-4xl font-bold text-blue-800 text-center mb-6">Acerca de AUTO HOST</h2>
      <p className="text-gray-700 text-lg leading-relaxed mb-4">
        AUTO HOST es tu plataforma de confianza para encontrar y vender refacciones de segunda mano para vehículos. Nuestra misión es conectar a compradores y vendedores de manera eficiente, segura y transparente, contribuyendo a la economía circular y facilitando el mantenimiento automotriz.
      </p>
      <p className="text-gray-700 text-lg leading-relaxed mb-4">
        Creemos en la importancia de dar una segunda vida a las piezas automotrices, promoviendo la sostenibilidad y ofreciendo alternativas económicas y de calidad para todos.
      </p>
      <p className="text-gray-700 text-lg leading-relaxed mb-6">
        Nuestra plataforma está diseñada pensando en la facilidad de uso, con herramientas de búsqueda avanzadas, un panel intuitivo para vendedores y un sistema de mensajería integrado para una comunicación fluida.
      </p>
      
      <div className="text-center mt-8">
        <button 
          onClick={() => navigate('/catalogo')} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition-colors text-lg"
        >
          Explorar Catálogo
        </button>
      </div>
    </div>
  );
};

export default AboutPage;
