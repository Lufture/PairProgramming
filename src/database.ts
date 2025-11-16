import mysql from 'mysql2/promise';

// Interfaz para el objeto Todo
export interface Todo {
  id?: number;
  title: string;
  description: string;
  completed: boolean;
  created_at?: Date;
  updated_at?: Date;
}

// Configuración de la conexión a MySQL
const dbConfig = {
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: '123456',
  database: 'todo_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Pool de conexiones
const pool = mysql.createPool(dbConfig);

/**
 * Obtener todos los todos
 */
export async function getAllTodos(): Promise<Todo[]> {
  try {
    const [rows] = await pool.query('SELECT * FROM todos ORDER BY created_at DESC');
    return rows as Todo[];
  } catch (error) {
    console.error('Error al obtener todos:', error);
    throw error;
  }
}

/**
 * Obtener un todo por ID
 */
export async function getTodoById(id: number): Promise<Todo | null> {
  try {
    const [rows] = await pool.query('SELECT * FROM todos WHERE id = ?', [id]);
    const todos = rows as Todo[];
    return todos.length > 0 ? todos[0] : null;
  } catch (error) {
    console.error('Error al obtener todo por ID:', error);
    throw error;
  }
}

/**
 * Crear un nuevo todo
 */
export async function createTodo(title: string, description: string): Promise<Todo> {
  try {
    const [result] = await pool.query(
      'INSERT INTO todos (title, description, completed) VALUES (?, ?, ?)',
      [title, description, false]
    );

    const insertResult = result as mysql.ResultSetHeader;
    const newTodo = await getTodoById(insertResult.insertId);

    if (!newTodo) {
      throw new Error('Error al crear el todo');
    }

    return newTodo;
  } catch (error) {
    console.error('Error al crear todo:', error);
    throw error;
  }
}

/**
 * Actualizar un todo existente
 */
export async function updateTodo(
  id: number,
  title: string,
  description: string,
  completed: boolean
): Promise<Todo | null> {
  try {
    await pool.query(
      'UPDATE todos SET title = ?, description = ?, completed = ? WHERE id = ?',
      [title, description, completed, id]
    );

    return await getTodoById(id);
  } catch (error) {
    console.error('Error al actualizar todo:', error);
    throw error;
  }
}

/**
 * Eliminar un todo
 */
export async function deleteTodo(id: number): Promise<boolean> {
  try {
    const [result] = await pool.query('DELETE FROM todos WHERE id = ?', [id]);
    const deleteResult = result as mysql.ResultSetHeader;
    return deleteResult.affectedRows > 0;
  } catch (error) {
    console.error('Error al eliminar todo:', error);
    throw error;
  }
}

/**
 * Alternar el estado completado de un todo
 */
export async function toggleTodoComplete(id: number): Promise<Todo | null> {
  try {
    const todo = await getTodoById(id);
    if (!todo) return null;

    const newCompleted = !todo.completed;
    await pool.query('UPDATE todos SET completed = ? WHERE id = ?', [newCompleted, id]);

    return await getTodoById(id);
  } catch (error) {
    console.error('Error al alternar completado:', error);
    throw error;
  }
}

/**
 * Cerrar el pool de conexiones (para shutdown limpio)
 */
export async function closePool(): Promise<void> {
  await pool.end();
}