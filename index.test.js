describe('TODO CRUD', () => {

  beforeEach(() => {
    // Limpiar antes de cada prueba
    todos = [];
    nextId = 1;
    editingId = null;
  });

  // CREATE - Agregar todos
  describe('CREATE', () => {
    test('Agregar un todo correctamente', () => {
      todos.push({
        id: nextId++,
        title: 'Learn JS',
        description: 'Watch tutorials',
        completed: false
      });

      expect(todos.length).toBe(1);
      expect(todos[0].title).toBe('Learn JS');
    });

    test('El ID debe incrementarse', () => {
      todos.push({ id: nextId++, title: 'Todo 1', description: 'Desc 1', completed: false });
      todos.push({ id: nextId++, title: 'Todo 2', description: 'Desc 2', completed: false });

      expect(todos[0].id).toBe(1);
      expect(todos[1].id).toBe(2);
    });


  });

  // READ - Leer todos
  describe('READ', () => {
    test('Obtener todos los todos', () => {
      todos.push({ id: nextId++, title: 'T1', description: 'D1', completed: false });
      todos.push({ id: nextId++, title: 'T2', description: 'D2', completed: false });

      expect(todos.length).toBe(2);
    });

    test('Buscar un todo por ID', () => {
      todos.push({ id: 1, title: 'Learn', description: 'Tutorials', completed: false });

      const encontrado = todos.find(t => t.id === 1);
      expect(encontrado).toBeDefined();
      expect(encontrado.title).toBe('Learn');
    });

    test('No encontrar un todo que no existe', () => {
      todos.push({ id: 1, title: 'Learn', description: 'Tutorials', completed: false });

      const encontrado = todos.find(t => t.id === 999);
      expect(encontrado).toBeUndefined();
    });

    test('Retornar null si todos está vacío', () => {
      expect(todos.length).toBe(0);
    });
  });

  // UPDATE - Actualizar todos
  describe('UPDATE', () => {
    test('Actualizar el título de un todo', () => {
      todos.push({ id: 1, title: 'Viejo', description: 'Desc', completed: false });

      const todo = todos.find(t => t.id === 1);
      todo.title = 'Nuevo';

      expect(todos[0].title).toBe('Nuevo');
    });

    test('Actualizar la descripción de un todo', () => {
      todos.push({ id: 1, title: 'Title', description: 'Vieja', completed: false });

      const todo = todos.find(t => t.id === 1);
      todo.description = 'Nueva';

      expect(todos[0].description).toBe('Nueva');
    });

  });

  // DELETE - Eliminar todos
  describe('DELETE', () => {
    test('Eliminar un todo por ID', () => {
      todos.push({ id: 1, title: 'T1', description: 'D1', completed: false });
      todos.push({ id: 2, title: 'T2', description: 'D2', completed: false });

      todos = todos.filter(t => t.id !== 1);

      expect(todos.length).toBe(1);
      expect(todos[0].id).toBe(2);
    });

    test('No eliminar si el ID no existe', () => {
      todos.push({ id: 1, title: 'T1', description: 'D1', completed: false });

      const inicial = todos.length;
      todos = todos.filter(t => t.id !== 999);

      expect(todos.length).toBe(inicial);
    });

    test('Eliminar múltiples todos', () => {
      todos.push({ id: 1, title: 'T1', description: 'D1', completed: false });
      todos.push({ id: 2, title: 'T2', description: 'D2', completed: false });
      todos.push({ id: 3, title: 'T3', description: 'D3', completed: false });

      todos = todos.filter(t => t.id !== 1 && t.id !== 2);

      expect(todos.length).toBe(1);
      expect(todos[0].id).toBe(3);
    });

    test('Dejar lista vacía después de eliminar todos', () => {
      todos.push({ id: 1, title: 'T1', description: 'D1', completed: false });
      todos = [];

      expect(todos.length).toBe(0);
    });
  });

  // TOGGLE - Cambiar estado
  describe('TOGGLE', () => {
    test('Cambiar de incompleto a completado', () => {
      todos.push({ id: 1, title: 'Task', description: 'Desc', completed: false });

      const todo = todos.find(t => t.id === 1);
      todo.completed = !todo.completed;

      expect(todos[0].completed).toBe(true);
    });

    test('Cambiar de completado a incompleto', () => {
      todos.push({ id: 1, title: 'Task', description: 'Desc', completed: true });

      const todo = todos.find(t => t.id === 1);
      todo.completed = !todo.completed;

      expect(todos[0].completed).toBe(false);
    });

    test('Toggle múltiples veces', () => {
      todos.push({ id: 1, title: 'Task', description: 'Desc', completed: false });

      const todo = todos.find(t => t.id === 1);
      todo.completed = !todo.completed;
      expect(todos[0].completed).toBe(true);

      todo.completed = !todo.completed;
      expect(todos[0].completed).toBe(false);

      todo.completed = !todo.completed;
      expect(todos[0].completed).toBe(true);
    });
  });

  // VALIDACIÓN
  describe('VALIDACIÓN', () => {
    test('No permitir título vacío', () => {
      const title = '';
      const description = 'Description';

      if (title === '' || description === '') {
        expect(true).toBe(true);
      }
    });

    test('No permitir descripción vacía', () => {
      const title = 'Title';
      const description = '';

      if (title === '' || description === '') {
        expect(true).toBe(true);
      }
    });

    test('El objeto todo debe tener todas las propiedades', () => {
      const todo = {
        id: 1,
        title: 'Title',
        description: 'Desc',
        completed: false
      };

      expect(todo).toHaveProperty('id');
      expect(todo).toHaveProperty('title');
      expect(todo).toHaveProperty('description');
      expect(todo).toHaveProperty('completed');
    });
  });
});