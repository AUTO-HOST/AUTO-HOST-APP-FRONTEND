import React, { useState } from 'react';
import axios from 'axios';

// Componente para el modal de contacto inicial.
// Se muestra cuando un comprador quiere contactar a un vendedor por primera vez.
const ContactSellerModal = ({ isOpen, onClose, onSubmit, productName, sellerName }) => {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Si el modal no debe estar abierto, no renderiza nada.
    if (!isOpen) {
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return; // No enviar mensajes vacíos

        setIsLoading(true);
        try {
            // Llama a la función onSubmit que le pasamos desde la página de detalle,
            // enviando el texto del mensaje.
            await onSubmit(message);
            setMessage(''); // Limpia el campo de texto
            onClose(); // Cierra el modal después de enviar
        } catch (error) {
            console.error("Error al enviar el mensaje:", error);
            alert(`Error: ${error.message}`); // Muestra un error si algo falla
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // Fondo oscuro semitransparente
        <div
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in"
            onClick={onClose} // Permite cerrar el modal haciendo clic fuera de él
        >
            {/* Contenedor del Modal */}
            <div
                className="bg-white rounded-lg shadow-2xl w-full max-w-lg"
                onClick={e => e.stopPropagation()} // Evita que el modal se cierre al hacer clic dentro de él
            >
                <form onSubmit={handleSubmit}>
                    {/* Encabezado del Modal */}
                    <div className="p-6 border-b">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">Contactar al Vendedor</h2>
                                <p className="text-sm text-gray-500">
                                    Pregunta sobre: <span className="font-semibold">{productName}</span>
                                </p>
                            </div>
                            <button type="button" onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200">
                                {/* Icono X de lucide-react eliminado. Puedes poner un texto o un SVG simple si lo necesitas. */}
                                X
                            </button>
                        </div>
                    </div>

                    {/* Cuerpo del Modal */}
                    <div className="p-6">
                        <label htmlFor="message" className="font-semibold text-gray-700 block mb-2">
                            Tu Mensaje para {sellerName}
                        </label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Escribe tu pregunta aquí... ¿La pieza es compatible con un modelo 2015? ¿Cuál es el mejor precio?"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                            rows="5"
                            required
                        ></textarea>
                    </div>

                    {/* Pie del Modal */}
                    <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
                        >
                            {isLoading ? 'Enviando...' : 'Enviar Mensaje'}
                            {/* Icono Send de lucide-react eliminado. Puedes poner un SVG simple si lo necesitas o dejar solo texto. */}
                            {!isLoading && <span>&#10148;</span>} {/* Ejemplo de flecha Unicode */}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContactSellerModal;