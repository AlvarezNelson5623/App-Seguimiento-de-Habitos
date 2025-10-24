import axios from "axios";
import { API_URL } from "../config/api"; 


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
