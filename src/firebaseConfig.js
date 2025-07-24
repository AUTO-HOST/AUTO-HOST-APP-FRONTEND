// Importa las funciones que necesitas del SDKs que usarás
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Para autenticación
import { getFirestore } from "firebase/firestore"; // Para Cloud Firestore
import { getStorage } from "firebase/storage"; // Para Cloud Storage (subir imágenes)

// Tu configuración de Firebase (LA QUE ACABAS DE COPIAR Y CONFIRMAR)
const firebaseConfig = {
    apiKey: "AIzaSyAP7ED_F_BFusSYlTEvQvLk4bavb0fu1jw",
    authDomain: "auto-host-refacciones.firebaseapp.com",
    projectId: "auto-host-refacciones",
    storageBucket: "auto-host-refacciones.firebasestorage.app",
    messagingSenderId: "474507344675",
    appId: "1:474507344675:web:2db1eb8e1750651cc52a96"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta los servicios que usarás en tu aplicación
export const auth = getAuth(app); // Para la autenticación
export const db = getFirestore(app); // Para Cloud Firestore
export const storage = getStorage(app); // Para Cloud Storage

// Puedes exportar el 'app' si lo necesitas en algún otro lugar (opcional)
export default app;