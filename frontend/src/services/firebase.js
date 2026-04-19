import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDe9YOkDD9mkWE9axAmgXmArD6f6rWkU9A",
  authDomain: "bonetto-pedidos.firebaseapp.com",
  projectId: "bonetto-pedidos",
  storageBucket: "bonetto-pedidos.firebasestorage.app",
  messagingSenderId: "982413232445",
  appId: "1:982413232445:web:b1a2cbcdfde35ecde9dd54"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, signInWithEmailAndPassword, signOut };
export default app;
