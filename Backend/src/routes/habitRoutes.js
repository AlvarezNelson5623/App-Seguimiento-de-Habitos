import express from "express";
import db from "../models/db.js";

const router = express.Router();

// Obtener hábitos actuales del usuario (usuarios_habitos)
router.get("/usuario/:id", async (req, res) => {
  const usuarioId = req.params.id;

  try {
    const [habitos] = await db.query(
      `SELECT h.*
       FROM usuarios_habitos uh
       JOIN habitos h ON h.id = uh.habito_id
       WHERE uh.usuario_id = ? AND uh.activo = 1`,
      [usuarioId]
    );

    res.json(habitos);
  } catch (error) {
    console.error("Error al obtener hábitos del usuario:", error);
    res.status(500).json({ message: "Error al obtener hábitos del usuario" });
  }
});

// Obtener hábitos recomendados (los que el usuario aún no tiene)
router.get("/recomendados/:id", async (req, res) => {
  const usuarioId = req.params.id;

  try {
    const [habitos] = await db.query(
      `SELECT *
       FROM habitos
       WHERE id NOT IN (
         SELECT habito_id FROM usuarios_habitos WHERE usuario_id = ?
       )`,
      [usuarioId]
    );

    res.json(habitos);
  } catch (error) {
    console.error("Error al obtener hábitos recomendados:", error);
    res.status(500).json({ message: "Error al obtener hábitos recomendados" });
  }
});

// -----------------------------------------
// Crear un nuevo hábito (personalizado por el usuario)
router.post("/", async (req, res) => {
  try {
    const { nombre, descripcion, categoria, creado_por } = req.body;

    if (!nombre || !creado_por) {
      return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    const [result] = await db.query(
      `INSERT INTO habitos (nombre, descripcion, categoria, es_global, creado_por)
       VALUES (?, ?, ?, 0, ?)`,
      [nombre, descripcion || null, categoria || null, creado_por]
    );

    res.json({
      message: "Hábito creado con éxito",
      id: result.insertId
    });

  } catch (error) {
    console.error("Error al crear hábito:", error);
    res.status(500).json({ message: "Error al crear hábito" });
  }
});
// -----------------------------------------




export default router;
