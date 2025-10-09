// /firebase/userService.ts
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  getFirestore,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

const firestore = db; // referencia a Firestore

// 🟢 Crear usuario con nombre y correo
export const addUsernameToFirestore = async (
  name: string,
  email: string,
  uid?: string
) => {
  try {
    const userId = uid || email; // si tienes UID de Firebase Auth, úsalo
    await setDoc(doc(firestore, "users", userId), {
      name,
      email,
      createdAt: new Date().toISOString(),
    });
    console.log("✅ Usuario guardado en Firestore");
  } catch (error) {
    console.error("❌ Error guardando usuario en Firestore:", error);
    throw error;
  }
};

// 🔵 Obtener datos de un usuario por correo
export const getUserByEmail = async (email: string) => {
  try {
    const docRef = doc(firestore, "users", email);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("📄 Datos del usuario encontrados");
      return docSnap.data();
    } else {
      console.log("⚠️ Usuario no encontrado");
      return null;
    }
  } catch (error) {
    console.error("❌ Error obteniendo usuario por correo:", error);
    throw error;
  }
};

// 🟣 Obtener usuario por UID
export const getUserByUID = async (uid: string) => {
  try {
    const docRef = doc(firestore, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("📄 Datos del usuario por UID encontrados");
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("❌ Error obteniendo usuario por UID:", error);
    throw error;
  }
};

// 🟠 Actualizar datos de usuario (nombre, foto, etc.)
export const updateUserData = async (
  email: string,
  data: { [key: string]: any }
) => {
  try {
    const docRef = doc(firestore, "users", email);
    await setDoc(docRef, data, { merge: true }); // merge evita sobrescribir campos
    console.log("✅ Usuario actualizado correctamente");
  } catch (error) {
    console.error("❌ Error actualizando usuario:", error);
    throw error;
  }
};

// 🔴 Obtener lista completa de usuarios
export const getAllUsers = async () => {
  try {
    const usersCollection = collection(firestore, "users");
    const snapshot = await getDocs(usersCollection);
    const users = snapshot.docs.map((doc) => doc.data());
    console.log(`👥 Se obtuvieron ${users.length} usuarios`);
    return users;
  } catch (error) {
    console.error("❌ Error obteniendo todos los usuarios:", error);
    throw error;
  }
};
