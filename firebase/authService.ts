// /firebase/authService.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { collection, getDocs, query, where, getFirestore } from "firebase/firestore";
import { auth } from "./firebaseConfig";

const db = getFirestore();

// Registrar usuario
export const register = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Iniciar sesión con usuario o correo
export const login = async (userIdentifier: string, password: string) => {
  let email = userIdentifier;

  // Si no contiene "@", asumimos que es un nombre de usuario
  if (!userIdentifier.includes("@")) {
    const q = query(
      collection(db, "users"), // colección donde guardas username y email
      where("username", "==", userIdentifier)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Usuario no encontrado");
    }

    email = querySnapshot.docs[0].data().email; // obtenemos el correo asociado al username
  }

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
