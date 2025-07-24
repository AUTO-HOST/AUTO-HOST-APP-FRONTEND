import React from 'react'; // Importamos React por defecto
// import { X } from 'lucide-react'; // Icono de cerrar <-- ¡ESTA LÍNEA ELIMINADA!

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemType, itemName }) => {
  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm(); // Llama a la función de confirmación pasada por prop
    onClose();   // Cierra el modal
  };

  return (
    // Fondo oscuro semitransparente
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose} // Cierra si se hace clic fuera
    >
      {/* Contenedor del Modal */}
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-sm flex flex-col"
        onClick={e => e.stopPropagation()} // Evita cerrar si se hace clic dentro
      >
        {/* Encabezado del Modal */}
        <div className="p-4 border-b flex justify-between items-center bg-red-600 text-white rounded-t-lg">
          <h2 className="text-xl font-bold">Confirmar Eliminación</h2>
          <button type="button" onClick={onClose} className="p-1 rounded-full text-white hover:bg-red-700">
            {/* Icono X de lucide-react eliminado. Se reemplaza por texto. */}
            X
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 text-gray-800">
          <p className="mb-4">
            ¿Estás seguro de que quieres eliminar est{itemType === 'este producto' ? 'e' : 'a'}
            <span className="font-semibold"> {itemType}</span>
            <span className="font-bold text-red-700"> {itemName && `"${itemName}"`}</span>?
          </p>
          <p className="text-sm text-gray-600">Esta acción es irreversible.</p>
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
            type="button"
            onClick={handleConfirm}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;