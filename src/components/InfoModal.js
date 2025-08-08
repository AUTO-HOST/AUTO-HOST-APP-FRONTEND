import React from 'react';

const InfoModal = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-6 w-11/12 max-w-md text-center"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
};

export default InfoModal;