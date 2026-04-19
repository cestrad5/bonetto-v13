import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  signOut 
} from "./firebase";
import { api, getProfile } from "./api";

/**
 * Login with Google
 */
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const token = await user.getIdToken();
    
    // Save token for the interceptor
    localStorage.setItem('token', token);
    
    // Get role and additional info from our Backend (Sheets)
    const profile = await getProfile();
    return { ...profile, uid: user.uid, token };
  } catch (error) {
    console.error("Google Login Error:", error);
    throw error;
  }
};

/**
 * Login with Email and Password
 */
export const loginWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    const token = await user.getIdToken();
    
    localStorage.setItem('token', token);
    
    const profile = await getProfile();
    return { ...profile, uid: user.uid, token };
  } catch (error) {
    console.error("Email Login Error:", error);
    throw error;
  }
};

/**
 * Logout
 */
export const logoutUser = async () => {
  await signOut(auth);
  localStorage.removeItem('token');
};
