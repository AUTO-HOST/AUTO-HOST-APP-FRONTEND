import React from 'react';
import { useNavigate, Link } from 'react-router-dom'; 

function PrivacyPolicyPage({ isOpen, onClose }) { 
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-3xl h-full md:h-5/6 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Políticas de Privacidad de AUTO-HOST</h2>
          <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="p-6 flex-grow overflow-y-auto">
          <p className="text-sm text-gray-500 mb-6">Última actualización: 2 de agosto de 2025</p>

          <div className="space-y-6 prose max-w-none text-gray-700">
            <p>
              En AUTO-HOST, valoramos profundamente tu privacidad y nos comprometemos a proteger tu información personal con la máxima diligencia. Esta Política de Privacidad describe cómo recopilamos, utilizamos, almacenamos, divulgamos y protegemos los datos que nos proporcionas al interactuar con nuestra plataforma, así como tus derechos en relación con dicha información.
            </p>
            
            <h3 className="text-2xl font-semibold pt-4 text-gray-800">1. Información que Recopilamos</h3>
            <p>Para poder ofrecerte nuestros servicios de intermediación en la compra y venta de refacciones, recopilamos las siguientes categorías de información:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Información de Contacto y Cuenta:</strong> Nombre completo, dirección de correo electrónico y número de teléfono. Estos datos son esenciales para la creación y gestión de tu cuenta en AUTO-HOST.</li>
              <li><strong>Datos de Vendedores:</strong> Exclusivamente para usuarios registrados como Vendedores, solicitamos información de identificación fiscal como la Clave Única de Registro de Población (CURP) o el Registro Federal de Contribuyentes (RFC), y datos bancarios como la CLABE interbancaria. Estos datos son cruciales para verificar tu identidad, cumplir con obligaciones fiscales y facilitar el procesamiento de los pagos derivados de tus ventas.</li>
              <li><strong>Datos de Compradores:</strong> Recopilamos tu dirección de envío (incluyendo calle, número, colonia, código postal y referencias) para asegurar la correcta entrega de los productos que adquieras.</li>
              <li><strong>Información de Transacciones:</strong> Detalles sobre los productos que compras o vendes, precios, cantidades, fechas de transacción y estado de los pedidos.</li>
              <li><strong>Comunicaciones:</strong> Contenido de los mensajes intercambiados entre compradores y vendedores a través de nuestra plataforma, con el fin de facilitar la comunicación y la resolución de disputas.</li>
              <li><strong>Información de Uso:</strong> Datos sobre cómo interactúas con nuestra plataforma, incluyendo páginas visitadas, tiempo de permanencia, búsquedas realizadas, tipo de dispositivo y navegador. Esto nos ayuda a mejorar la funcionalidad y la experiencia de usuario.</li>
            </ul>

            <h3 className="text-2xl font-semibold pt-4 text-gray-800">2. Uso y Finalidades de la Información</h3>
            <p>Utilizamos la información recopilada para los siguientes propósitos:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Gestión de Cuentas:</strong> Crear, mantener y gestionar tu perfil de usuario en AUTO-HOST.</li>
              <li><strong>Verificación y Seguridad:</strong> Validar la identidad de los vendedores y garantizar un entorno de mercado seguro y confiable para todas las partes.</li>
              <li><strong>Facilitar Transacciones:</strong> Procesar tus compras, ventas, pagos y coordinar los envíos de manera eficiente y segura.</li>
              <li><strong>Comunicación:</strong> Habilitar la comunicación fluida entre compradores y vendedores para consultas y detalles de productos.</li>
              <li><strong>Mejora de Servicios:</strong> Analizar el uso de la plataforma para mejorar nuestras funcionalidades, personalizar tu experiencia y desarrollar nuevas características.</li>
              <li><strong>Atención al Cliente:</strong> Responder a tus consultas, solicitudes de soporte y resolver cualquier incidencia.</li>
              <li><strong>Cumplimiento Legal:</strong> Cumplir con las leyes y regulaciones aplicables, incluyendo la prevención de fraudes y actividades ilícitas.</li>
            </ul>

            <h3 className="text-2xl font-semibold pt-4 text-gray-800">3. Compartir y Divulgar Información</h3>
            <p>Tu privacidad es una de nuestras principales prioridades. No vendemos, alquilamos ni comercializamos tu información personal con terceros para fines de marketing directo o cualquier otro uso no relacionado con nuestros servicios. Sin embargo, podríamos compartir tu información en las siguientes circunstancias:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Entre Compradores y Vendedores:</strong> Para completar una transacción, la información de contacto y envío relevante se compartirá entre el comprador y el vendedor involucrados. Por ejemplo, el vendedor recibirá la dirección de envío del comprador.</li>
              <li><strong>Proveedores de Servicios:</strong> Contratamos a terceros de confianza para que realicen servicios en nuestro nombre, como procesamiento de pagos, alojamiento de datos, servicios de envío y análisis. Estos proveedores están obligados contractualmente a proteger tu información y solo pueden usarla para los fines específicos que les encomendamos.</li>
              <li><strong>Cumplimiento Legal:</strong> Podríamos divulgar tu información si así lo exige la ley, una orden judicial, una solicitud gubernamental o para proteger nuestros derechos, propiedad o seguridad, así como los de nuestros usuarios o el público.</li>
              <li><strong>Transferencias de Negocio:</strong> En caso de una fusión, adquisición, venta de activos o reorganización, tu información personal podría ser transferida como parte de los activos de la empresa, siempre bajo la condición de mantener la confidencialidad.</li>
            </ul>

            <h3 className="text-2xl font-semibold pt-4 text-gray-800">4. Seguridad de los Datos</h3>
            <p>Implementamos medidas de seguridad técnicas, administrativas y físicas robustas para proteger tu información personal contra el acceso no autorizado, la alteración, la divulgación o la destrucción. Esto incluye el uso de cifrado, firewalls, controles de acceso y procedimientos de auditoría. Aunque nos esforzamos al máximo por proteger tu información, ningún sistema es completamente impenetrable, y no podemos garantizar la seguridad absoluta de tus datos transmitidos a través de internet.</p>

            <h3 className="text-2xl font-semibold pt-4 text-gray-800">5. Tus Derechos</h3>
            <p>De acuerdo con la legislación aplicable, tienes derecho a:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Acceso:</strong> Solicitar acceso a la información personal que tenemos sobre ti.</li>
              <li><strong>Rectificación:</strong> Solicitar la corrección de datos personales inexactos o incompletos.</li>
              <li><strong>Cancelación:</strong> Solicitar la eliminación de tu información personal cuando ya no sea necesaria para los fines para los que fue recopilada.</li>
              <li><strong>Oposición:</strong> Oponerte al uso de tus datos personales para ciertos fines.</li>
            </ul>
            <p>Para ejercer cualquiera de estos derechos, por favor contáctanos a través de [tu_email_de_soporte@ejemplo.com].</p>

            <h3 className="text-2xl font-semibold pt-4 text-gray-800">6. Cambios a esta Política de Privacidad</h3>
            <p>Podemos actualizar esta Política de Privacidad periódicamente para reflejar cambios en nuestras prácticas de datos o en la legislación aplicable. Te notificaremos sobre cualquier cambio significativo publicando la nueva política en nuestra plataforma y actualizando la fecha de "Última actualización" en la parte superior.</p>

            <p className="pt-6 font-semibold text-gray-800">
              Al utilizar los servicios de AUTO-HOST, confirmas que has leído y comprendido esta Política de Privacidad, y que aceptas sus términos.
            </p>
          </div>
          
          <p className="mt-8 text-xs text-gray-500">
            <strong>Nota legal importante:</strong> Este es un borrador de política de privacidad con fines de desarrollo y demostración. **Se recomienda encarecidamente que consultes a un profesional legal especializado en privacidad y protección de datos** para redactar una política final que asegure el cumplimiento total con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares de México (LFPDPPP) y otras regulaciones relevantes antes del lanzamiento oficial de tu plataforma. AUTO-HOST no se hace responsable de la idoneidad legal de este texto.
          </p>
        </div>

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