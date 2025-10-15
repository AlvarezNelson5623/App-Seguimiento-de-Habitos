// src/services/api.ts
import axios from "axios";
import { API_URL } from "../config/api"; 

const API = axios.create({
  baseURL: API_URL, // ⬅️ cambiar por la IP local de tu PC
  timeout: 5000,
});

export default API;
