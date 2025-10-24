// src/controllers/userController.js
import db from "../models/db.js"; // conexión MySQL
import path from "path";
import { fileURLToPath } from "url";

// ✅ Función: Registrar usuario
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  try {
    // Verificar si el usuario ya existe
    const [existing] = await db.execute("SELECT id FROM usuarios WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Insertar nuevo usuario
    await db.execute(
      "INSERT INTO usuarios (nombre, email, password, foto_perfil) VALUES (?, ?, ?, ?)",
      [name, email, password, "pacific2.jpg"] // 👈 imagen por defecto
    );

    res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// ✅ Función: Login usuario
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  try {
    const [rows] = await db.execute("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (rows.length === 0 || rows[0].password !== password) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    // ✅ Devuelve los datos del usuario, incluida la foto
    res.status(200).json({
      message: "Inicio de sesión exitoso",
      user: {
        id: rows[0].id,
        nombre: rows[0].nombre,
        email: rows[0].email,
        foto_perfil: rows[0].foto_perfil,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
}; 

// ✅ NUEVO: Obtener usuario por ID
export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.execute(
      "SELECT id, nombre, email, foto_perfil FROM usuarios WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener usuario" });
  }
};
