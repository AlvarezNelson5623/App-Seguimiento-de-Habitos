import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    User
} from "firebase/auth";
import { auth } from "./firebaseConfig";

// Registrar usuario
export const register = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Iniciar sesión
export const login = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Cerrar sesión
export const logout = () => {
  return signOut(auth);
};

// Escuchar cambios de autenticación
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Obtener usuario actual
export const getCurrentUser = () => {
  return auth.currentUser;
};