import React from 'react'; // Importamos React por defecto
import { Link } from 'react-router-dom'; // Importamos Link

const Footer = () => {
  return (
    <footer className="bg-blue-900 text-white py-8 px-4 rounded-t-lg shadow-inner">
      <div className="container mx-auto text-center">
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 mb-6">
          <Link to="/politica-privacidad" className="hover:text-blue-300 transition-colors">Políticas de Privacidad</Link>
          <span className="hidden sm:inline">|</span>
          <Link to="/acerca-de" className="hover:text-blue-300 transition-colors">Acerca de Nosotros</Link>
        </div>
        <p className="text-sm text-blue-200">
          &copy; 2025 AUTO HOST. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
