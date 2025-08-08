import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Importa tus componentes
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

// Importa los hooks y componentes necesarios
import { useAuth } from './context/AuthContext';
import { useUI } from './context/UIContext';           // <-- AÑADIDO
import InfoModal from './components/InfoModal';         // <-- AÑADIDO

function AppContent() {
  const { loadingAuth } = useAuth();
  const { isOpen, title, message, hideInfoModal } = useUI(); // <-- AÑADIDO: Obtenemos el estado del modal

  if (loadingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Cargando aplicación...</p>
        {/* SVG de carga */}
      </div>
    );
  }

  const onSellerDashboardHandler = () => {
    console.log('Manejador global del panel de vendedor activado (simulado).');
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
        <Header />

        <main className="flex-grow">
          <Routes>
            {/* ...todas tus rutas existentes... */}
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
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/:productId/:otherUserId" element={<h1 className="text-center mt-20 text-gray-700">Detalle de Conversación</h1>} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/my-orders" element={<OrderHistoryPage />} />
            <Route path="/seller/orders" element={<SellerOrdersPage />} />
            <Route path="*" element={<h1 className="text-center text-3xl mt-20 text-gray-700">404: Página no encontrada</h1>} />
          </Routes>
        </main>

        {/* --- AÑADIDO: Renderizamos el Modal aquí para que esté disponible globalmente --- */}
        <InfoModal
          isOpen={isOpen}
          title={title}
          message={message}
          onClose={hideInfoModal}
        />

        <Footer />
      </div>
    </Router>
  );
}

// Esta función App ya no necesita el AuthProvider porque lo movimos a index.js
function App() {
  return (
    <AppContent />
  );
}

export default App;