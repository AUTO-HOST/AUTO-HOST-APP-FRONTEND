import React, { createContext, useState, useContext } from 'react';

const UIContext = createContext();

export const useUI = () => {
  return useContext(UIContext);
};

export const UIProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
  });

  const showInfoModal = (title, message) => {
    setModalState({ isOpen: true, title, message });
  };

  const hideInfoModal = () => {
    setModalState({ isOpen: false, title: '', message: '' });
  };

  const value = {
    ...modalState,
    showInfoModal,
    hideInfoModal,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};