// src/controllers/habitController.js
import db from "../models/db.js";

// ✅ Obtener todos los hábitos globales (predefinidos por el sistema)
export const getGlobalHabits = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM habitos WHERE es_global = 1");
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener hábitos globales" });
  }
};

// ✅ Obtener los hábitos de un usuario específico
export const getUserHabits = async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.execute(
      `SELECT h.*
       FROM usuarios_habitos uh
       JOIN habitos h ON uh.habito_id = h.id
       WHERE uh.usuario_id = ? AND uh.activo = 1`,
      [userId]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener hábitos del usuario" });
  }
};

// ✅ Agregar un hábito personalizado creado por el usuario
export const addCustomHabit = async (req, res) => {
  const { nombre, descripcion, categoria, userId } = req.body;
  if (!nombre || !userId) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  try {
    const [result] = await db.execute(
      "INSERT INTO habitos (nombre, descripcion, categoria, es_global, creado_por) VALUES (?, ?, ?, 0, ?)",
      [nombre, descripcion, categoria || null, userId]
    );

    // lo agregamos también a la tabla usuarios_habitos
    await db.execute(
      "INSERT INTO usuarios_habitos (usuario_id, habito_id) VALUES (?, ?)",
      [userId, result.insertId]
    );

    res.status(201).json({ message: "Hábito personalizado agregado", id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear hábito personalizado" });
  }
};

// ✅ Asociar un hábito global existente al usuario
export const addExistingHabit = async (req, res) => {
  const { userId, habitId } = req.body;
  if (!userId || !habitId) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  try {
    await db.execute(
      "INSERT INTO usuarios_habitos (usuario_id, habito_id) VALUES (?, ?)",
      [userId, habitId]
    );
    res.status(201).json({ message: "Hábito agregado al usuario" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al asignar hábito al usuario" });
  }
};

// ✅ Eliminar hábito del usuario
export const removeUserHabit = async (req, res) => {
  const { userId, habitId } = req.body;
  try {
    await db.execute(
      "DELETE FROM usuarios_habitos WHERE usuario_id = ? AND habito_id = ?",
      [userId, habitId]
    );
    res.status(200).json({ message: "Hábito eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar hábito" });
  }
};
