# App de Seguimiento de Hábitos

Este proyecto contiene el **frontend** y **backend** de la App de Seguimiento de Hábitos.

> ⚠️ Importante: El proyecto **no funcionará sin un archivo `.env`** correctamente configurado en el backend con las variables de entorno necesarias (base de datos, puerto, JWT, etc.).


# Base de Datos Actual en Xampp

> Script temporal 

 ```

-- --------------------------------------------------
-- Crear base de datos
-- --------------------------------------------------
CREATE DATABASE IF NOT EXISTS `habitosbd` 
  DEFAULT CHARACTER SET utf8mb4 
  COLLATE utf8mb4_general_ci;

USE `habitosbd`;

-- --------------------------------------------------
-- Estructura de tabla para la tabla `usuarios`
-- --------------------------------------------------
CREATE TABLE `usuarios` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `fecha_registro` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_general_ci;



  ```