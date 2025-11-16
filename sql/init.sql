-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS todo_db;

-- Usar la base de datos
USE todo_db;

-- Eliminar tabla si existe (para desarrollo)
DROP TABLE IF EXISTS todos;

-- Crear tabla todos
CREATE TABLE todos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar algunos datos de ejemplo (opcional)
INSERT INTO todos (title, description, completed) VALUES
  ('Learn TypeScript', 'Study TypeScript fundamentals', false),
  ('Setup Docker', 'Configure MySQL with Docker', true),
  ('Build CRUD App', 'Create a fullstack ToDo application', false);

-- Verificar que se creó correctamente
SELECT * FROM todos;