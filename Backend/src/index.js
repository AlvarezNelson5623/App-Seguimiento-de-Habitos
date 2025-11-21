// src/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import habitRoutes from "./routes/habitRoutes.js";
import usuariosHabitosRoutes from "./routes/usuariosHabitosRoutes.js";
import registrosHabitosRoutes from "./routes/registrosHabitosRoutes.js";
import estadisticasRoutes from "./routes/estadisticasRoutes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/habitos", habitRoutes); 
app.use("/api/usuarios-habitos", usuariosHabitosRoutes);
app.use("/api/registros-habitos", registrosHabitosRoutes);
app.use("/api/estadisticas", estadisticasRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
