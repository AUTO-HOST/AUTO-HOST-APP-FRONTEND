import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom'; // CAMBIADO a HashRouter

// Importa tus componentes desde sus respectivos archivos
import Header from './components/Header';
import Footer from './components/Footer';
import HomePageContent from './pages/HomePageContent';
import CatalogPage from './pages/CatalogPage';
import OffersPage from './pages/OffersPage';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import TicketPage from './pages/TicketPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import RegisterPage from './pages/RegisterPage';
import AddProductPage from './pages/AddProductPage';
import MessagesPage from './pages/MessagesPage';
import EditProductPage from './pages/EditProductPage';
import CartPage from './pages/CartPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import SellerOrdersPage from './pages/SellerOrdersPage'; 

// Importa el AuthProvider y useAuth
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { loadingAuth } = useAuth();

  if (loadingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 font-sans text-blue-600 text-2xl">
        <p>Cargando aplicación...</p>
        <svg className="animate-spin h-10 w-10 text-blue-600 mt-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 0012 4.001 8.001 0 004.001 12c-.135.812-.227 1.631-.278 2.454m0 0A7.966 7.966 0 0112 20c1.231 0 2.41-.301 3.454-.877M4 14h.01M16 14h.01M20 14h.01M20 10h.01M4 10h.01M12 18h.01M12 6h.01M18 10h.01M6 18h.01M18 6h.01"></path>
        </svg>
      </div>
    );
  }

  const onSellerDashboardHandler = () => {
    console.log('Manejador global del panel de vendedor activado (simulado).');
  };

  return (
    <Router> {/* CAMBIADO: Ahora es HashRouter y se ELIMINA el basename */}
      <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
        <Header />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePageContent />} />
            <Route path="/catalogo" element={<CatalogPage />} />
            <Route path="/ofertas" element={<OffersPage />} />
            <Route path="/acerca-de" element={<AboutPage />} />
            <Route path="/login" element={<LoginPage />} />

            <Route path="/register" element={<RegisterPage />} />

            <Route path="/register-success" element={
              <div className="text-center mt-20 text-blue-600 text-xl">
                ¡Registro exitoso! ¡Bienvenido a AUTO HOST!
                <p className="mt-4"><Link to="/login" className="text-blue-500 hover:underline">Inicia sesión aquí</Link></p>
              </div>
            } />

            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/purchase-success" element={<TicketPage />} />
            <Route path="/politica-privacidad" element={<PrivacyPolicyPage />} />

            <Route path="/seller-dashboard" element={<SellerDashboardPage onSellerDashboard={onSellerDashboardHandler} />} />
            <Route path="/seller/add-product" element={<AddProductPage />} />
            <Route path="/seller/edit-product/:id" element={<EditProductPage />} />

            {/* Rutas de Mensajes */}
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/:productId/:otherUserId" element={<h1 className="text-center mt-20 text-gray-700">Detalle de Conversación</h1>} />

            {/* Ruta del Carrito */}
            <Route path="/cart" element={<CartPage />} />

            {/* Ruta del Historial de Pedidos del Comprador */}
            <Route path="/my-orders" element={<OrderHistoryPage />} />

            {/* ¡NUEVA RUTA para el Historial de Ventas del Vendedor! */}
            <Route path="/seller/orders" element={<SellerOrdersPage />} /> 

            <Route path="*" element={<h1 className="text-center text-3xl mt-20 text-gray-700">404: Página no encontrada</h1>} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;