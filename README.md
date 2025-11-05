# App de Seguimiento de Hábitos

Este proyecto contiene el **frontend** y **backend** de la App de Seguimiento de Hábitos.

> ⚠️ Importante: El proyecto **no funcionará sin un archivo `.env`** correctamente configurado en el backend con las variables de entorno necesarias (base de datos, puerto, JWT, etc.).


# Base de Datos Actual en Xampp

> Script temporal 

 ```

-- --------------------------------------------------
-- Crear base de datos
-- --------------------------------------------------
CREATE DATABASE IF NOT EXISTS `habitosdb` 
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_general_ci;

USE `habitosdb`;

-- --------------------------------------------------
-- Estructura de tabla para la tabla `usuarios`
-- --------------------------------------------------
CREATE TABLE `usuarios` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `fecha_registro` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `foto_perfil` VARCHAR(255) NOT NULL DEFAULT 'pacific2.jpg',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_general_ci;

CREATE TABLE `habitos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` TEXT,
  `categoria` VARCHAR(100),
  `es_global` TINYINT(1) DEFAULT 1,  -- 1 = creado por el sistema, 0 = creado por usuario
  `creado_por` INT DEFAULT NULL,      -- si es personalizado, quién lo creó
  `fecha_creacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`creado_por`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


INSERT INTO `habitos` (`nombre`, `descripcion`, `categoria`, `es_global`)
VALUES
('Beber agua', 'Tomar al menos 8 vasos de agua al día', 'Salud', 1),
('Leer 30 minutos', 'Leer un libro o artículo al menos 30 minutos diarios', 'Crecimiento personal', 1),
('Ejercicio', 'Hacer actividad física al menos 30 minutos', 'Salud', 1);

CREATE TABLE `usuarios_habitos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NOT NULL,
  `habito_id` INT NOT NULL,
  `fecha_inicio` DATE DEFAULT (CURRENT_DATE),
  `hora_objetivo` TIME DEFAULT NULL,
  `activo` TINYINT(1) DEFAULT 1,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`habito_id`) REFERENCES `habitos`(`id`) ON DELETE CASCADE,
  UNIQUE KEY (`usuario_id`, `habito_id`) -- evita duplicar el mismo hábito en un usuario
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


  ```