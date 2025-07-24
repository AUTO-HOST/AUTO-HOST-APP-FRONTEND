import React from 'react'; // Importamos React por defecto
import { useNavigate, Link } from 'react-router-dom'; // Importamos los Hooks individualmente
import { useAuth } from '../context/AuthContext';

// Importamos el logo aquí (ya ajustado a .png)
import AUTO_HOST_Logo from '../assets/logo_AUTOHOST.png'; 

const Header = () => {
  const navigate = useNavigate();
  const { currentUser, logout, loadingAuth } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      console.log("Sesión cerrada con éxito.");
      navigate('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (loadingAuth) {
    return (
      <header className="bg-white shadow-md py-4 px-6 rounded-b-lg">
        <nav className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-extrabold text-blue-800">Cargando...</h1>
          </div>
          <ul className="flex space-x-6 text-lg font-semibold text-gray-700">
            <li><button onClick={() => navigate('/')} className="hover:text-blue-600 transition-colors">Inicio</button></li>
            <li><button onClick={() => navigate('/catalogo')} className="hover:text-blue-600 transition-colors">Catálogo</button></li>
            <li><button onClick={() => navigate('/ofertas')} className="hover:text-blue-600 transition-colors">Ofertas</button></li>
            <li><button onClick={() => navigate('/acerca-de')} className="hover:text-blue-600 transition-colors">Acerca de</button></li>
          </ul>
          <div className="text-gray-500">Cargando usuario...</div>
        </nav>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-md py-4 px-6 rounded-b-lg">
      <nav className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {/* Tu logo real */}
          <img
            src={AUTO_HOST_Logo}
            alt="AUTO HOST Logo"
            className="h-12 w-auto"
          />
        </div>

        <ul className="flex space-x-6 text-lg font-semibold text-gray-700">
          <li><button onClick={() => navigate('/')} className="hover:text-blue-600 transition-colors">Inicio</button></li>
          <li><button onClick={() => navigate('/catalogo')} className="hover:text-blue-600 transition-colors">Catálogo</button></li>
          <li><button onClick={() => navigate('/ofertas')} className="hover:text-blue-600 transition-colors">Ofertas</button></li>
          <li><button onClick={() => navigate('/acerca-de')} className="hover:text-blue-600 transition-colors">Acerca de</button></li>
        </ul>

        <div className="flex items-center space-x-4">
          {currentUser ? (
            <>
              {/* Botón de Mensajes */}
              <button
                onClick={() => navigate('/messages')}
                className="text-gray-700 font-medium hover:text-blue-600 transition-colors py-2 px-3 rounded-full"
              >
                Mensajes
              </button>

              {/* Botón de Mi Carrito */}
              <button
                onClick={() => navigate('/cart')}
                className="text-gray-700 font-medium hover:text-blue-600 transition-colors py-2 px-3 rounded-full"
              >
                Mi Carrito
              </button>

              {/* Botón de Mis Pedidos (para compradores) */}
              <button
                onClick={() => navigate('/my-orders')}
                className="text-gray-700 font-medium hover:text-blue-600 transition-colors py-2 px-3 rounded-full"
              >
                Mis Pedidos
              </button>

              {/* Muestra "Panel de Vendedor" solo si el usuario es de tipo 'Vendedor' */}
              {currentUser.firestoreProfile && currentUser.firestoreProfile.userType === 'Vendedor' && (
                <button
                  onClick={() => navigate('/seller-dashboard')}
                  className="text-orange-600 font-bold hover:text-orange-700 transition-colors py-2 px-3 rounded-full"
                >
                  Panel de Vendedor
                </button>
              )}
              
              <span className="text-gray-700 font-medium">
                Hola, {currentUser.firestoreProfile && currentUser.firestoreProfile.name ? currentUser.firestoreProfile.name : currentUser.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-full transition-colors shadow-md"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="text-gray-700 font-medium hover:text-blue-600 transition-colors">
                Ingresar
              </button>
              <button onClick={() => navigate('/register')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-full transition-colors shadow-md">
                Crear cuenta
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
