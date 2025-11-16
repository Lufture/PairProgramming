import http, { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';
import {
  getAllTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodoComplete,
  closePool
} from './database';

const PORT = 3000;

/**
 * Obtener el tipo MIME según la extensión del archivo
 */
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Servir archivos estáticos desde /public
 */
function serveStaticFile(res: ServerResponse, filePath: string): void {
  const fullPath = path.join(__dirname, 'public', filePath);

  fs.readFile(fullPath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - File Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`, 'utf-8');
      }
    } else {
      const mimeType = getMimeType(fullPath);
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(content, 'utf-8');
    }
  });
}

/**
 * Parsear el body de una petición POST
 */
function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Enviar respuesta JSON
 */
function sendJSON(res: ServerResponse, statusCode: number, data: any): void {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(data));
}

/**
 * Crear servidor HTTP
 */
const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  const pathname = url.pathname;
  const method = req.method || 'GET';

  console.log(`${method} ${pathname}`);

  try {
    // Servir página principal
    if (pathname === '/' && method === 'GET') {
      serveStaticFile(res, 'index.html');
      return;
    }

    // Servir JavaScript del frontend
    if (pathname === '/app.js' && method === 'GET') {
      serveStaticFile(res, 'app.js');
      return;
    }

    // Obtener todos los todos
    if (pathname === '/todos' && method === 'GET') {
      const todos = await getAllTodos();
      sendJSON(res, 200, { success: true, data: todos });
      return;
    }

    // Agregar un nuevo todo
    if (pathname === '/add-todo' && method === 'POST') {
      const body = await parseBody(req);

      // Validaciones
      if (!body.title || !body.description) {
        sendJSON(res, 400, {
          success: false,
          error: 'Title and description are required'
        });
        return;
      }

      if (body.title.trim() === '' || body.description.trim() === '') {
        sendJSON(res, 400, {
          success: false,
          error: 'Title and description cannot be empty'
        });
        return;
      }

      const newTodo = await createTodo(body.title, body.description);
      sendJSON(res, 201, { success: true, data: newTodo });
      return;
    }

    // Actualizar un todo
    if (pathname === '/update-todo' && method === 'POST') {
      const body = await parseBody(req);

      // Validaciones
      if (!body.id || !body.title || !body.description) {
        sendJSON(res, 400, {
          success: false,
          error: 'ID, title and description are required'
        });
        return;
      }

      if (body.title.trim() === '' || body.description.trim() === '') {
        sendJSON(res, 400, {
          success: false,
          error: 'Title and description cannot be empty'
        });
        return;
      }

      const updatedTodo = await updateTodo(
        body.id,
        body.title,
        body.description,
        body.completed
      );

      if (!updatedTodo) {
        sendJSON(res, 404, { success: false, error: 'Todo not found' });
        return;
      }

      sendJSON(res, 200, { success: true, data: updatedTodo });
      return;
    }

    // Eliminar un todo
    if (pathname === '/delete-todo' && method === 'POST') {
      const body = await parseBody(req);

      if (!body.id) {
        sendJSON(res, 400, { success: false, error: 'ID is required' });
        return;
      }

      const deleted = await deleteTodo(body.id);

      if (!deleted) {
        sendJSON(res, 404, { success: false, error: 'Todo not found' });
        return;
      }

      sendJSON(res, 200, { success: true, message: 'Todo deleted' });
      return;
    }

    // Alternar estado completado
    if (pathname === '/toggle-todo' && method === 'POST') {
      const body = await parseBody(req);

      if (!body.id) {
        sendJSON(res, 400, { success: false, error: 'ID is required' });
        return;
      }

      const updatedTodo = await toggleTodoComplete(body.id);

      if (!updatedTodo) {
        sendJSON(res, 404, { success: false, error: 'Todo not found' });
        return;
      }

      sendJSON(res, 200, { success: true, data: updatedTodo });
      return;
    }

    // Ruta no encontrada
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 - Page Not Found</h1>', 'utf-8');

  } catch (error) {
    console.error('Error en servidor:', error);
    sendJSON(res, 500, {
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Iniciar servidor
 */
server.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📊 Base de datos: MySQL en localhost:3307`);
  console.log(`💾 Database: todo_db`);
  console.log(`\nPresiona Ctrl+C para detener el servidor`);
});

/**
 * Manejo de cierre gracioso
 */
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Cerrando servidor...');

  server.close(async () => {
    console.log('✅ Servidor HTTP cerrado');
    await closePool();
    console.log('✅ Conexión a base de datos cerrada');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('\n\n🛑 Señal SIGTERM recibida');
  await closePool();
  process.exit(0);
});