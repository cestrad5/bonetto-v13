import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut } from "firebase/auth";

// La API key de Firebase Web no es secreta (está pensada para viajar en el
// bundle del cliente; la seguridad real la dan las reglas de Firebase/el
// backend) — el problema de tenerla hardcodeada era otro: no había forma de
// apuntar a un proyecto Firebase distinto en dev/staging sin tocar código.
// Ahora sale de variables de entorno, con los valores actuales como default
// para no romper despliegues existentes que no las definan.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDe9YOkDD9mkWE9axAmgXmArD6f6rWkU9A",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "bonetto-pedidos.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bonetto-pedidos",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "bonetto-pedidos.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "982413232445",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:982413232445:web:b1a2cbcdfde35ecde9dd54"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, signInWithEmailAndPassword, signOut };
export default app;
