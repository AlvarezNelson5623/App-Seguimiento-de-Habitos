import express from "express";
import db from "../models/db.js";

const router = express.Router();

/*
-----------------------------------------------------
 MARCAR UN HÁBITO COMO REALIZADO EN UNA FECHA
-----------------------------------------------------
*/
router.post("/marcar", async (req, res) => {
  const { usuario_habito_id, fecha } = req.body;

  if (!usuario_habito_id || !fecha) {
    return res.status(400).json({ message: "Faltan datos obligatorios" });
  }

  try {
    // Verificar si ya existe el registro del día
    const [existe] = await db.query(
      `SELECT id FROM registros_habitos 
       WHERE usuario_habito_id = ? AND fecha = ?`,
      [usuario_habito_id, fecha]
    );

    if (existe.length > 0) {
      // Actualizar
      await db.query(
        `UPDATE registros_habitos SET realizado = 1 WHERE id = ?`,
        [existe[0].id]
      );
    } else {
      // Crear nuevo registro
      await db.query(
        `INSERT INTO registros_habitos (usuario_habito_id, fecha, realizado)
         VALUES (?, ?, 1)`,
        [usuario_habito_id, fecha]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error al marcar hábito:", error);
    res.status(500).json({ message: "Error al marcar hábito" });
  }
});


/*
-----------------------------------------------------
 OBTENER SI EL USUARIO YA MARCÓ UN HÁBITO HOY
-----------------------------------------------------
*/
router.get("/estado/:usuarioHabitoId", async (req, res) => {
  const usuarioHabitoId = req.params.usuarioHabitoId;
  const fecha = req.query.fecha; // YYYY-MM-DD

  try {
    const [rows] = await db.query(
      `SELECT realizado 
       FROM registros_habitos 
       WHERE usuario_habito_id = ? AND fecha = ?`,
      [usuarioHabitoId, fecha]
    );

    res.json(rows.length > 0 ? rows[0] : { realizado: null });
  } catch (error) {
    console.error("Error consultando estado del hábito:", error);
    res.status(500).json({ message: "Error consultando estado" });
  }
});


/*
-----------------------------------------------------
 REGISTRAR AUTOMÁTICAMENTE “NO REALIZADO”
-----------------------------------------------------
*/
router.post("/no-realizado", async (req, res) => {
  const { usuario_id, habito_id, fecha } = req.body;

  try {
    await db.query(
      `INSERT IGNORE INTO registros_habitos 
      (usuario_id, habito_id, fecha, realizado)
      VALUES (?, ?, ?, 0)`,
      [usuario_id, habito_id, fecha]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error registrando no realizado:", error);
    res.status(500).json({ message: "Error registrando no realizado" });
  }
});


router.get("/programados", async (req, res) => {
  const { usuario_id, fecha } = req.query;

  try {
    // 1. Obtener hábitos activos del usuario
    const [habitos] = await db.query(
      `SELECT uh.id AS usuario_habito_id, uh.fecha_inicio, uh.frecuencia, uh.meta,
              h.nombre, h.descripcion
       FROM usuarios_habitos uh
       JOIN habitos h ON h.id = uh.habito_id
       WHERE uh.usuario_id = ? AND uh.activo = 1`,
      [usuario_id]
    );

    const fechaConsulta = new Date(fecha);

    const habitosProgramados = [];

    for (const habito of habitos) {
      const fechaInicio = new Date(habito.fecha_inicio);
      const diasDiferencia = Math.floor((fechaConsulta - fechaInicio) / (1000 * 60 * 60 * 24));

      if (diasDiferencia < 0) continue;  // antes de empezar
      if (diasDiferencia >= habito.meta) continue; // se pasó el rango

      // 2. Consultar si ya tiene registro ese día
      const [reg] = await db.query(
        `SELECT realizado 
         FROM registros_habitos
         WHERE usuario_habito_id = ? AND fecha = ?`,
        [habito.usuario_habito_id, fecha]
      );

      habitosProgramados.push({
        usuario_habito_id: habito.usuario_habito_id,
        nombre: habito.nombre,
        descripcion: habito.descripcion,
        realizado: reg.length > 0 ? reg[0].realizado : null
      });
    }

    res.json(habitosProgramados);

  } catch (error) {
    console.error("Error obteniendo hábitos programados:", error);
    res.status(500).json({ message: "Error obteniendo hábitos programados" });
  }
});


export default router;
