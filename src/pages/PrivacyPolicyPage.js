import React from 'react';
// Ya no necesitamos useNavigate ni Link si solo se usa como modal,
// pero los mantendré por si se usa en otro contexto.
import { useNavigate, Link } from 'react-router-dom'; 

// Este componente ahora recibirá 'isOpen' y 'onClose' como props
function PrivacyPolicyPage({ isOpen, onClose }) { 
  // Si el modal no está abierto, no renderizamos nada
  if (!isOpen) {
    return null;
  }

  // navigate aquí no es necesario si el modal controla el cierre con onClose
  // const navigate = useNavigate();

  return (
    // Fondo oscuro semitransparente del modal
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose} // Permite cerrar el modal haciendo clic fuera de él
    >
      {/* Contenedor del Modal - Evita que se cierre al hacer clic dentro */}
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-3xl h-full md:h-5/6 flex flex-col"
        onClick={e => e.stopPropagation()} // Detiene la propagación del clic para que no cierre el modal
      >
        {/* Encabezado del Modal con botón de cerrar */}
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Políticas de Privacidad de AUTO-HOST</h2>
          <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200">
            {/* Icono de cerrar (X) */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Cuerpo del Modal (contenido desplazable) */}
        <div className="p-6 flex-grow overflow-y-auto"> {/* <-- overflow-y-auto para scroll */}
          <p className="text-sm text-gray-500 mb-6">Última actualización: 10 de julio de 2025</p>

          <div className="space-y-4 prose max-w-none">
            <p>
              En AUTO-HOST, valoramos tu privacidad y nos comprometemos a proteger tu información personal. Esta Política de Privacidad explica cómo recopilamos, usamos y protegemos los datos que nos proporcionas al utilizar nuestra plataforma.
            </p>
            
            <h2 className="text-2xl font-semibold pt-4">1. Información que Recopilamos</h2>
            <p>
              Para operar nuestra plataforma y ofrecerte nuestros servicios, recopilamos la siguiente información:
            </p>
            <ul className="list-disc list-inside">
              <li><strong>Para Compradores y Vendedores:</strong> Nombre completo, dirección de correo electrónico, y número de teléfono.</li>
              <li><strong>Exclusivamente para Vendedores:</strong> Clave Única de Registro de Población (CURP) o Registro Federal de Contribuyentes (RFC) y CLABE interbancaria para fines de verificación de identidad y para procesar los pagos de sus ventas.</li>
              <li><strong>Para Compradores:</strong> Dirección de envío para la entrega de los productos.</li>
            </ul>

            <h2 className="text-2xl font-semibold pt-4">2. Uso de la Información</h2>
            <p>
              Utilizamos tu información para los siguientes propósitos:
            </p>
            <ul className="list-disc list-inside">
              <li>Crear y gestionar tu cuenta en AUTO-HOST.</li>
              <li>Verificar la identidad de los vendedores para garantizar un mercado seguro y confiable.</li>
              <li>Facilitar la comunicación entre compradores y vendedores.</li>
              <li>Procesar transacciones, pagos y envíos de forma segura.</li>
              <li>Mejorar nuestros servicios y la experiencia general del usuario en la plataforma.</li>
            </ul>

            <h2 className="text-2xl font-semibold pt-4">3. Seguridad de los Datos</h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas robustas para proteger tus datos personales contra el acceso no autorizado, la alteración, la divulgación o la destrucción. Tu información es almacenada en servidores seguros y el acceso a ella está restringido.
            </p>
            
            <h2 className="text-2xl font-semibold pt-4">4. No Compartimos tus Datos</h2>
            <p>
              Tu privacidad es primordial. No vendemos, alquilamos ni compartimos tu información personal con terceros para fines de marketing. La información de contacto solo se comparte entre el comprador y el vendedor en la medida estrictamente necesaria para completar una transacción (por ejemplo, para coordinar el envío).
            </p>

            <p className="pt-6 font-semibold">
              Al utilizar los servicios de AUTO-HOST, aceptas los términos descritos en esta Política de Privacidad.
            </p>
          </div>
          
          <p className="mt-8 text-xs text-gray-500">
            <strong>Nota legal:</strong> Este es un borrador de política de privacidad con fines de desarrollo. Se recomienda encarecidamente que consultes a un profesional legal para redactar una política final que asegure el cumplimiento total con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares de México antes del lanzamiento oficial de tu plataforma.
          </p>
        </div>

        {/* Pie del Modal (opcional, para botones de cerrar o aceptar) */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button 
            type="button" 
            onClick={onClose} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;