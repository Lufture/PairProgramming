"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTodos = getAllTodos;
exports.getTodoById = getTodoById;
exports.createTodo = createTodo;
exports.updateTodo = updateTodo;
exports.deleteTodo = deleteTodo;
exports.toggleTodoComplete = toggleTodoComplete;
exports.closePool = closePool;
const promise_1 = __importDefault(require("mysql2/promise"));
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
const pool = promise_1.default.createPool(dbConfig);
/**
 * Obtener todos los todos
 */
async function getAllTodos() {
    try {
        const [rows] = await pool.query('SELECT * FROM todos ORDER BY created_at DESC');
        return rows;
    }
    catch (error) {
        console.error('Error al obtener todos:', error);
        throw error;
    }
}
/**
 * Obtener un todo por ID
 */
async function getTodoById(id) {
    try {
        const [rows] = await pool.query('SELECT * FROM todos WHERE id = ?', [id]);
        const todos = rows;
        return todos.length > 0 ? todos[0] : null;
    }
    catch (error) {
        console.error('Error al obtener todo por ID:', error);
        throw error;
    }
}
/**
 * Crear un nuevo todo
 */
async function createTodo(title, description) {
    try {
        const [result] = await pool.query('INSERT INTO todos (title, description, completed) VALUES (?, ?, ?)', [title, description, false]);
        const insertResult = result;
        const newTodo = await getTodoById(insertResult.insertId);
        if (!newTodo) {
            throw new Error('Error al crear el todo');
        }
        return newTodo;
    }
    catch (error) {
        console.error('Error al crear todo:', error);
        throw error;
    }
}
/**
 * Actualizar un todo existente
 */
async function updateTodo(id, title, description, completed) {
    try {
        await pool.query('UPDATE todos SET title = ?, description = ?, completed = ? WHERE id = ?', [title, description, completed, id]);
        return await getTodoById(id);
    }
    catch (error) {
        console.error('Error al actualizar todo:', error);
        throw error;
    }
}
/**
 * Eliminar un todo
 */
async function deleteTodo(id) {
    try {
        const [result] = await pool.query('DELETE FROM todos WHERE id = ?', [id]);
        const deleteResult = result;
        return deleteResult.affectedRows > 0;
    }
    catch (error) {
        console.error('Error al eliminar todo:', error);
        throw error;
    }
}
/**
 * Alternar el estado completado de un todo
 */
async function toggleTodoComplete(id) {
    try {
        const todo = await getTodoById(id);
        if (!todo)
            return null;
        const newCompleted = !todo.completed;
        await pool.query('UPDATE todos SET completed = ? WHERE id = ?', [newCompleted, id]);
        return await getTodoById(id);
    }
    catch (error) {
        console.error('Error al alternar completado:', error);
        throw error;
    }
}
/**
 * Cerrar el pool de conexiones (para shutdown limpio)
 */
async function closePool() {
    await pool.end();
}
