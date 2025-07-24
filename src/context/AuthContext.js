import React, { createContext, useContext, useState, useEffect } from 'react'; // 'use' eliminado de aquí
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          firebaseUser.firestoreProfile = userDocSnap.data();
          setCurrentUser(firebaseUser);
          console.log("Usuario autenticado y perfil de Firestore cargado:", firebaseUser);
        } else {
          setCurrentUser(firebaseUser);
          console.warn("Usuario autenticado, pero perfil de Firestore no encontrado. UID:", firebaseUser.uid);
        }
      } else {
        setCurrentUser(null);
        console.log("No hay usuario autenticado.");
      }
      setLoadingAuth(false);
    });

    return unsubscribe;
  }, []);

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    currentUser,
    loadingAuth,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loadingAuth && children}
    </AuthContext.Provider>
  );
};
