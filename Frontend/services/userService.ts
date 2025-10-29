// Frontend/src/services/userService.ts
import API from "./api";
import { API_URL } from "../config/api"; 

export const getUserProfile = async (userId: string) => {
  try {
    const response = await API.get(`/users/${userId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error al obtener perfil del usuario");
  }
};



