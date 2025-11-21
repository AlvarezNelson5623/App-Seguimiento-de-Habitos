import express from "express";
import db from "../models/db.js";

const router = express.Router();

/**
 * OBTENER ESTADÍSTICAS GENERALES DEL USUARIO
 * /api/estadisticas/:usuario_id
 */
router.get("/:usuario_id", async (req, res) => {
  const { usuario_id } = req.params;

  try {
    //
    // 1️⃣ Total de hábitos activos del usuario
    //
    const [habitosActivos] = await db.execute(
      `SELECT COUNT(*) AS total FROM usuarios_habitos 
       WHERE usuario_id = ? AND activo = 1`,
      [usuario_id]
    );

    //
    // 2️⃣ Hábitos cumplidos HOY
    //
    const [cumplidosHoy] = await db.execute(
      `SELECT COUNT(*) AS total FROM registros_habitos r
       JOIN usuarios_habitos uh ON uh.id = r.usuario_habito_id
       WHERE uh.usuario_id = ? 
       AND r.fecha = CURRENT_DATE
       AND r.realizado = 1`,
      [usuario_id]
    );

    //
    // 3️⃣ Porcentaje general de cumplimiento
    //
    const [generalCumplimiento] = await db.execute(
      `SELECT 
         SUM(r.realizado) AS cumplidos,
         COUNT(r.id) AS totales
       FROM registros_habitos r
       JOIN usuarios_habitos uh ON uh.id = r.usuario_habito_id
       WHERE uh.usuario_id = ?`,
      [usuario_id]
    );

    const porcentajeGeneral =
      generalCumplimiento[0].totales > 0
        ? Math.round(
            (generalCumplimiento[0].cumplidos /
              generalCumplimiento[0].totales) *
              100
          )
        : 0;

    //
    // 4️⃣ Porcentaje por hábito
    //
    const [porHabito] = await db.execute(
      `SELECT 
          h.nombre AS habito,
          uh.id AS usuario_habito_id,
          COUNT(r.id) AS total_registros,
          SUM(r.realizado) AS total_cumplidos,
          ROUND((SUM(r.realizado) / COUNT(r.id)) * 100, 0) AS porcentaje
        FROM usuarios_habitos uh
        JOIN habitos h ON uh.habito_id = h.id
        LEFT JOIN registros_habitos r ON r.usuario_habito_id = uh.id
        WHERE uh.usuario_id = ?
        GROUP BY uh.id`,
      [usuario_id]
    );

    //
    // 5️⃣ Cumplimientos por mes (para gráficos)
    //
    const [mensual] = await db.execute(
      `SELECT 
          MONTH(r.fecha) AS mes,
          SUM(r.realizado) AS cumplidos
        FROM registros_habitos r
        JOIN usuarios_habitos uh ON uh.id = r.usuario_habito_id
        WHERE uh.usuario_id = ?
        GROUP BY MONTH(r.fecha)
        ORDER BY mes`,
      [usuario_id]
    );

    //
    // 6️⃣ Empaquetar estadística SOLO una vez y enviar 🚀
    //
    res.json({
      global: {
        totalHabitos: habitosActivos[0].total,
        habitosCumplidosHoy: cumplidosHoy[0].total,
        porcentajeGeneral,
      },
      porHabito,
      mensual,
    });
  } catch (error) {
    console.error("Error cargando estadísticas:", error);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
});

export default router;
