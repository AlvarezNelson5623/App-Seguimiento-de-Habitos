// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAY6IsXFTOL0-Za0qjOn7_xn6utWtqWv_o",
  authDomain: "app-habitos-saludables.firebaseapp.com",
  projectId: "app-habitos-saludables",
  storageBucket: "app-habitos-saludables.firebasestorage.app",
  messagingSenderId: "156282232291",
  appId: "1:156282232291:web:1ee9289fe3af2be32e14d6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Exporta servicios que vas a usar
export const auth = getAuth(app);
export const db = getFirestore(app);