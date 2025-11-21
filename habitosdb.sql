-- --------------------------------------------------------
-- CREAR BASE DE DATOS
-- --------------------------------------------------------
DROP DATABASE IF EXISTS habitosdb;
CREATE DATABASE habitosdb CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE habitosdb;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

-- --------------------------------------------------------
-- TABLA: usuarios
-- --------------------------------------------------------
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `foto_perfil` varchar(255) DEFAULT 'pacific2.jpg',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- DATOS ORIGINALES (únicos que se mantienen)
INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `fecha_registro`, `foto_perfil`) VALUES
(9, 'Nelson Alvarez ', 'nelson@dominio.com', '123456', '2025-11-17 15:30:31', 'pacific3.jpg'),
(10, 'Andrés Avella', 'andres@dominio.com', '123456', '2025-11-17 15:31:38', 'pacific2.jpg'),
(11, 'Alexander Sandoval', 'alexander@dominio.com', '123456', '2025-11-17 15:32:02', 'pacific2.jpg');


-- --------------------------------------------------------
-- TABLA: habitos
-- --------------------------------------------------------
CREATE TABLE `habitos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `es_global` tinyint(1) DEFAULT 1,
  `creado_por` int(11) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `creado_por` (`creado_por`),
  CONSTRAINT `habitos_ibfk_1` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- DATOS: hábitos globales + hábitos personalizados
INSERT INTO `habitos` (`id`, `nombre`, `descripcion`, `categoria`, `es_global`, `creado_por`, `fecha_creacion`) VALUES
(1, 'Beber agua', 'Tomar al menos 8 vasos de agua al día', 'Salud', 1, NULL, '2025-10-24 19:37:58'),
(2, 'Leer 30 minutos', 'Leer diariamente para mejorar conocimiento', 'Crecimiento personal', 1, NULL, '2025-10-24 19:37:58'),
(3, 'Ejercicio', 'Hacer ejercicio 30 minutos', 'Salud', 1, NULL, '2025-10-24 19:37:58'),
(4, 'Dormir 8 horas', 'Dormir adecuadamente para mantener energía', 'Salud', 1, NULL, NOW()),
(5, 'No azúcar por un día', 'Evitar bebidas azucaradas y dulces', 'Salud', 1, NULL, NOW()),
(6, 'Meditación', 'Meditar al menos 10 minutos', 'Bienestar', 1, NULL, NOW()),
(7, 'Aprender algo nuevo', 'Consumir 1 contenido educativo al día', 'Educación', 1, NULL, NOW()),

-- Hábitos creados por usuarios
(11, 'Codificar', 'Hacer el backend', 'Educación', 0, 9, '2025-11-17 15:54:54'),
(12, 'Front-end', 'Desarrollar interfaz', 'Educación', 0, 11, '2025-11-17 16:26:16'),
(13, 'Nadar', 'Curso principiante', 'Salud', 0, 9, '2025-11-17 20:11:27'),
(14, 'Correr', 'Dar mínimo 10 vueltas a la cancha', 'Deporte', 0, 9, '2025-11-17 21:17:12'),
(15, 'Leer documentación', 'Avanzar en documentación técnica', 'Educación', 0, 10, NOW()),
(16, 'Practicar Inglés', 'Practicar speaking o listening', 'Educación', 0, 11, NOW());


-- --------------------------------------------------------
-- TABLA: usuarios_habitos
-- --------------------------------------------------------
CREATE TABLE `usuarios_habitos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `habito_id` int(11) NOT NULL,
  `fecha_inicio` date DEFAULT curdate(),
  `hora_objetivo` time DEFAULT NULL,
  `frecuencia` enum('diario','semanal','mensual') DEFAULT 'diario',
  `meta` int(11) DEFAULT 1,
  `dias_semana` varchar(100) DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `notas` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `habito_id` (`habito_id`),
  CONSTRAINT `usuarios_habitos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `usuarios_habitos_ibfk_2` FOREIGN KEY (`habito_id`) REFERENCES `habitos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ASIGNACIONES DE HÁBITOS CON DATOS DE PRUEBA
INSERT INTO `usuarios_habitos` (`id`, `usuario_id`, `habito_id`, `fecha_inicio`, `hora_objetivo`, `frecuencia`, `meta`, `dias_semana`, `notas`, `activo`) VALUES
(1, 9, 1, '2025-11-19', '08:00:00', 'diario', 1, NULL, 'Tomar agua al despertar', 1),
(2, 9, 3, '2025-11-19', '18:00:00', 'diario', 1, NULL, 'Ejercicio ligero', 1),
(3, 9, 11, '2025-11-19', '10:00:00', 'diario', 10, NULL, 'Codificar backend', 1),
(4, 9, 13, '2025-11-19', NULL, 'semanal', 2, 'lunes,viernes', 'Nadar 1 hora', 1),
(5, 10, 2, '2025-11-19', '20:00:00', 'diario', 1, NULL, 'Lectura nocturna', 1),
(6, 10, 6, '2025-11-19', '07:00:00', 'diario', 1, NULL, 'Meditación', 1),
(7, 11, 12, '2025-11-19', '14:00:00', 'diario', 1, NULL, 'Frontend React Native', 1),
(8, 11, 16, '2025-11-19', '19:00:00', 'diario', 1, NULL, 'Práctica inglés', 1);


-- --------------------------------------------------------
-- TABLA: registros_habitos
-- --------------------------------------------------------
CREATE TABLE `registros_habitos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_habito_id` int(11) NOT NULL,
  `fecha` date NOT NULL DEFAULT curdate(),
  `realizado` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `usuario_habito_id` (`usuario_habito_id`),
  CONSTRAINT `registros_habitos_ibfk_1` FOREIGN KEY (`usuario_habito_id`) REFERENCES `usuarios_habitos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- REGISTROS PARA MOSTRAR PROGRESO
INSERT INTO `registros_habitos` (`usuario_habito_id`, `fecha`, `realizado`) VALUES
(1, '2025-11-19', 1),
(1, '2025-11-20', 1),
(1, '2025-11-21', 0),

(2, '2025-11-19', 1),
(2, '2025-11-20', 0),

(3, '2025-11-19', 1),
(3, '2025-11-20', 1),
(3, '2025-11-21', 1),

(4, '2025-11-17', 1),
(4, '2025-11-20', 0),

(5, '2025-11-19', 0),
(5, '2025-11-20', 1),

(7, '2025-11-19', 1),
(7, '2025-11-20', 0),

(8, '2025-11-19', 1),
(8, '2025-11-20', 1);
