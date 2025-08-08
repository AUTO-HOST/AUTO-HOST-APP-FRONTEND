import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext'; // <-- AÑADE ESTA LÍNEA (si no la tenías)
import { UIProvider } from './context/UIContext';   // <-- AÑADE ESTA LÍNEA

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Envolvemos la App con ambos Providers */}
    <AuthProvider>
      <UIProvider>
        <App />
      </UIProvider>
    </AuthProvider>
  </React.StrictMode>
);

