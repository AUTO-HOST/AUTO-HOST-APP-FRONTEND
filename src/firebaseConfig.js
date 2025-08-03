// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Tu configuración de Firebase para auto-host-refacciones
const firebaseConfig = {
    apiKey: "AIzaSyAP7ED_F_BFusSYlTEvQvLk4bavb0fu1jw",
    authDomain: "auto-host-refacciones.firebaseapp.com",
    projectId: "auto-host-refacciones",
    storageBucket: "auto-host-refacciones.appspot.com", // ¡Esto es clave para el Storage!
    messagingSenderId: "474507344675",
    appId: "1:474507344675:web:2db1eb8e1750651cc52a96"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta los servicios
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
