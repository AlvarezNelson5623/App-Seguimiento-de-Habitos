import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { collection, getDocs, query, where, getFirestore } from "firebase/firestore";
import { auth } from "./firebaseConfig";

const db = getFirestore();

// Registrar usuario (sin mantener sesión activa)
export const register = async (email: string, password: string) => {
  // Crear usuario
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  // Cerrar sesión inmediatamente después de registrar
  await signOut(auth);

  // Retornar el objeto del usuario creado (para Firestore)
  return userCredential;
};

// Iniciar sesión con usuario o correo
export const login = async (userIdentifier: string, password: string) => {
  let email = userIdentifier;

  if (!userIdentifier.includes("@")) {
    const q = query(collection(db, "users"), where("username", "==", userIdentifier));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) throw new Error("Usuario no encontrado");
    email = querySnapshot.docs[0].data().email;
  }

  return signInWithEmailAndPassword(auth, email, password);
};

export const logout = () => signOut(auth);

export const onAuthChange = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);

export const getCurrentUser = () => auth.currentUser;
