// src/controllers/userController.js
import db from "../models/db.js"; // tu conexión MySQL

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
      "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)",
      [name, email, password] //  en producción: hashea la contraseña
    );

    res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

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

    res.status(200).json({ message: "Inicio de sesión exitoso", user: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
