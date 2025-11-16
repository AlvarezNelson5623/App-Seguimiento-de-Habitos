import express from "express";
import db from "../models/db.js";

const router = express.Router();

// Asignar hábito al usuario
router.post("/asignar", async (req, res) => {
  const {
    usuario_id,
    habito_id,
    frecuencia,
    meta,
    hora_objetivo,
    dias_semana,
    notas
  } = req.body;

  try {
    await db.query(
      `INSERT INTO usuarios_habitos 
        (usuario_id, habito_id, frecuencia, meta, hora_objetivo, dias_semana, notas, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        usuario_id,
        habito_id,
        frecuencia,
        meta,
        hora_objetivo || null,
        dias_semana || null,
        notas || null
      ]
    );

    res.json({ success: true, message: "Hábito asignado correctamente" });

  } catch (error) {
    console.error("Error asignando hábito:", error);
    res.status(500).json({ message: "Error asignando hábito" });
  }
});

export default router;
