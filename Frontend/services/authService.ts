import axios from "axios";
import { API_URL } from "../config/api"; 

// 👉 Cambia esta URL si tu backend usa otro puerto
//const API_URL = "http://10.14.97.216:3000/api"; 

// ⚠️ Usa la IP de tu PC (no 'localhost') para que Expo pueda acceder desde el celular

export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/users/login`, { email, password });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error al iniciar sesión");
  }
};

export const register = async (  name: string ,email: string,password: string) => {
  try {
    const response = await axios.post(`${API_URL}/users/register`, { email, password, name });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error al registrar usuario");
  }
};
