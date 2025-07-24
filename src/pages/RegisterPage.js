import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import PrivacyPolicyPage from './PrivacyPolicyPage'; // Importamos la página de Políticas para usarla como modal

const RegisterPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [firebaseError, setFirebaseError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false); // Nuevo estado para el modal de PP

  // --- Estados para todos los datos del formulario ---
  // ¡TODAS LAS DECLARACIONES DE ESTADO Y FUNCIONES DEBEN IR AQUÍ ARRIBA DEL RETURN!
  const [formData, setFormData] = useState({
    userType: 'Vendedor',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    address: '',
    cp: '',
    curp_rfc: '',
    clabe: '',
    privacyAccepted: false,
  });

  // Manejador genérico para todos los inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // --- Funciones de navegación del wizard ---
  const nextStep = () => {
    setFormError(null);
    setFirebaseError(null);

    // Validaciones por paso antes de avanzar
    switch (currentStep) {
      case 1: // Paso 1: Datos de la cuenta
        if (!formData.email || !formData.password || !formData.confirmPassword) {
          setFormError("Por favor, completa todos los campos.");
          return;
        }
        if (formData.password.length < 6) {
          setFormError("La contraseña debe tener al menos 6 caracteres.");
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setFormError("Las contraseñas no coinciden.");
          return;
        }
        break;
      case 2: // Paso 2: Tus Datos
        if (!formData.name || !formData.phone) {
          setFormError("Por favor, ingresa tu nombre y teléfono.");
          return;
        }
        // Puedes añadir validaciones de formato de teléfono aquí
        break;
      case 3: // Paso 3: Dirección
        if (!formData.address || !formData.cp) {
          setFormError("Por favor, ingresa tu dirección y código postal.");
          return;
        }
        // Puedes añadir validaciones de formato de CP aquí
        break;
      default:
        break;
    }
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  // --- Manejo del Registro Final ---
  const handleRegister = async () => {
    setLoading(true);
    setFormError(null);
    setFirebaseError(null);

    // Validación final para el Paso 4 (Confirmar)
    if (!formData.privacyAccepted) {
      setFormError("Debes aceptar las Políticas de Privacidad para continuar.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      console.log("Usuario autenticado con éxito en Firebase Auth:", user);

      const userDocRef = doc(db, "users", user.uid);
      
      const userProfileData = {
        uid: user.uid,
        email: formData.email,
        userType: formData.userType,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        cp: formData.cp,
        privacyAccepted: formData.privacyAccepted,
        createdAt: new Date(),
      };

      if (formData.userType === 'Vendedor') {
        userProfileData.curp_rfc = formData.curp_rfc;
        userProfileData.clabe = formData.clabe;
      }

      await setDoc(userDocRef, userProfileData);
      console.log("Datos de perfil guardados en Firestore con éxito.");

      navigate('/register-success');

    } catch (error) {
      console.error("Error al registrar usuario o guardar datos:", error);
      let errorMessage = "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.";

      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = "El email ya está registrado. Por favor, usa otro o inicia sesión.";
            break;
          case 'auth/invalid-email':
            errorMessage = "El formato del email no es válido.";
            break;
          case 'auth/weak-password':
            errorMessage = "La contraseña es demasiado débil (debe tener al menos 6 caracteres).";
            break;
          case 'auth/operation-not-allowed':
              errorMessage = "La operación de registro no está permitida. Habilítala en Firebase Console.";
              break;
          default:
            errorMessage = error.message;
            break;
        }
      } else {
        errorMessage = error.message || "Error al guardar los datos adicionales del usuario.";
      }
      setFirebaseError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-blue-800 text-center mb-6">Crea tu cuenta en AUTO HOST</h2>
        
        {/* Indicador de pasos */}
        <div className="flex justify-around text-center mb-8 text-sm font-medium text-gray-500">
          <span className={currentStep >= 1 ? 'text-blue-600' : ''}>① Cuenta</span>
          <span>»</span>
          <span className={currentStep >= 2 ? 'text-blue-600' : ''}>② Tus Datos</span>
          <span>»</span>
          <span className={currentStep >= 3 ? 'text-blue-600' : ''}>③ Dirección</span>
          <span>»</span>
          <span className={currentStep >= 4 ? 'text-blue-600' : ''}>④ Confirmar</span>
        </div>

        {formError && <p className="text-red-500 text-center mb-4">{formError}</p>}
        {firebaseError && <p className="text-red-500 text-center mb-4">{firebaseError}</p>}

        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Paso 1: Datos de tu cuenta</h3>
            {/* Selección Comprador/Vendedor */}
            <div className="flex rounded-lg overflow-hidden border border-gray-300">
              <button
                className={`w-1/2 py-3 text-lg font-semibold transition-colors duration-200 ${
                  formData.userType === 'Comprador' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, userType: 'Comprador' }))}
                disabled={loading}
              >
                Comprador
              </button>
              <button
                className={`w-1/2 py-3 text-lg font-semibold transition-colors duration-200 ${
                  formData.userType === 'Vendedor' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, userType: 'Vendedor' }))}
                disabled={loading}
              >
                Vendedor
              </button>
            </div>
            
            <input
              type="email"
              name="email"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <input
              type="password"
              name="password"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <input
              type="password"
              name="confirmPassword"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirmar Contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <button
              onClick={nextStep}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold text-lg transition-colors duration-200"
              disabled={loading}
            >
              Siguiente
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Paso 2: Tus Datos Personales</h3>
            <input
              type="text"
              name="name"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nombre Completo"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <input
              type="tel"
              name="phone"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Teléfono (ej. 5512345678)"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={loading}
            />
            {formData.userType === 'Vendedor' && (
              <>
                <input
                  type="text"
                  name="curp_rfc"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="CURP o RFC (solo vendedores)"
                  value={formData.curp_rfc}
                  onChange={handleChange}
                  disabled={loading}
                />
                <input
                  type="text"
                  name="clabe"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="CLABE Interbancaria (solo vendedores)"
                  value={formData.clabe}
                  onChange={handleChange}
                  disabled={loading}
                />
              </>
            )}
            <div className="flex justify-between gap-4 mt-6">
              <button
                onClick={prevStep}
                className="w-1/2 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-md font-semibold text-lg transition-colors duration-200"
                disabled={loading}
              >
                Anterior
              </button>
              <button
                onClick={nextStep}
                className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold text-lg transition-colors duration-200"
                disabled={loading}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Paso 3: Dirección</h3>
            <input
              type="text"
              name="address"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Dirección completa"
              value={formData.address}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <input
              type="text"
              name="cp"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Código Postal (C.P.)"
              value={formData.cp}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <div className="flex justify-between gap-4 mt-6">
              <button
                onClick={prevStep}
                className="w-1/2 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-md font-semibold text-lg transition-colors duration-200"
                disabled={loading}
              >
                Anterior
              </button>
              <button
                onClick={nextStep}
                className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold text-lg transition-colors duration-200"
                disabled={loading}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Paso 4: Confirmar Datos</h3>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-gray-800 space-y-2">
              <p><strong>Email:</strong> {formData.email}</p>
              <p><strong>Tipo de Usuario:</strong> {formData.userType}</p>
              <p><strong>Nombre:</strong> {formData.name}</p>
              <p><strong>Teléfono:</strong> {formData.phone}</p>
              <p><strong>Dirección:</strong> {formData.address}</p>
              <p><strong>C.P.:</strong> {formData.cp}</p>
              {formData.userType === 'Vendedor' && (
                <>
                  <p><strong>CURP/RFC:</strong> {formData.curp_rfc}</p>
                  <p><strong>CLABE:</strong> {formData.clabe}</p>
                </>
              )}
            </div>

            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                id="privacyAccepted"
                name="privacyAccepted"
                checked={formData.privacyAccepted}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={loading}
              />
              <label htmlFor="privacyAccepted" className="ml-2 text-gray-700 text-sm">
                He leído y acepto las{' '}
                <span 
                  onClick={() => setShowPrivacyModal(true)} // <-- Abre el modal
                  className="text-blue-600 hover:underline cursor-pointer" // <-- Estilo de enlace
                >
                  Políticas de Privacidad
                </span>
                .
              </label>
            </div>

            <div className="flex justify-between gap-4 mt-6">
              <button
                onClick={prevStep}
                className="w-1/2 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-md font-semibold text-lg transition-colors duration-200"
                disabled={loading}
              >
                Anterior
              </button>
              <button
                onClick={handleRegister}
                className="w-1/2 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-md font-semibold text-lg transition-colors duration-200"
                disabled={loading}
              >
                {loading ? 'Completando...' : 'Completar Registro'}
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-gray-600 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Inicia Sesión
          </Link>
        </p>
      </div>

      {/* ¡¡RENDERIZA EL MODAL AQUÍ!! */}
      <PrivacyPolicyPage 
        isOpen={showPrivacyModal} 
        onClose={() => setShowPrivacyModal(false)} 
      />
    </div>
  );
};

export default RegisterPage;