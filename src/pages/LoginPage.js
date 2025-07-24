import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebaseConfig'; // Importamos la instancia de auth
import { signInWithEmailAndPassword } from 'firebase/auth'; // Función para iniciar sesión

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault(); // Evita que la página se recargue al enviar el formulario
    setLoading(true);
    setError(null);

    try {
      // Intenta iniciar sesión con Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Usuario inició sesión con éxito:", userCredential.user);

      // Si el inicio de sesión es exitoso, redirigimos al usuario.
      // Por ahora, redirigiremos a la página de inicio.
      // Más adelante, podríamos redirigir a un dashboard de usuario/vendedor.
      navigate('/'); // Redirige a la página principal

    } catch (firebaseError) {
      console.error("Error al iniciar sesión:", firebaseError);
      let errorMessage = "Error al iniciar sesión. Por favor, verifica tu email y contraseña.";

      // Mensajes de error específicos de Firebase Authentication
      switch (firebaseError.code) {
        case 'auth/invalid-email':
          errorMessage = "El formato del email no es válido.";
          break;
        case 'auth/user-disabled':
          errorMessage = "Tu cuenta ha sido deshabilitada.";
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = "Email o contraseña incorrectos.";
          break;
        default:
          errorMessage = firebaseError.message; // Mensaje genérico de Firebase
          break;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-blue-800 text-center mb-6">Ingresa a tu cuenta</h2>
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">Email:</label>
            <input
              type="email"
              id="email"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">Contraseña:</label>
            <input
              type="password"
              id="password"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold text-lg transition-colors duration-200"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;