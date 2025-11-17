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


// Eliminar (desactivar) un hábito asignado al usuario
router.delete("/eliminar/:usuarioId/:habitoId", async (req, res) => {
  const { usuarioId, habitoId } = req.params;

  try {
    await db.query(
      `UPDATE usuarios_habitos 
       SET activo = 0
       WHERE usuario_id = ? AND habito_id = ?`,
      [usuarioId, habitoId]
    );

    res.json({ success: true, message: "Hábito eliminado correctamente" });

  } catch (error) {
    console.error("Error eliminando hábito:", error);
    res.status(500).json({ message: "Error al eliminar hábito" });
  }
});




export default router;
