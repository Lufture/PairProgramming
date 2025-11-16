"use strict";
// Variable global para almacenar el ID del todo en edición
let editingId = null;
/**
 * Mostrar alerta temporal
 */
function showAlert(message) {
    const alert = document.getElementById('alert');
    alert.innerText = message;
    alert.classList.remove('d-none');
    setTimeout(() => {
        alert.classList.add('d-none');
    }, 3000);
}
/**
 * Mostrar alerta en el modal
 */
function showModalAlert(message) {
    const alert = document.getElementById('modal-alert');
    alert.innerText = message;
    alert.classList.remove('d-none');
}
/**
 * Ocultar alerta del modal
 */
function hideModalAlert() {
    const alert = document.getElementById('modal-alert');
    alert.classList.add('d-none');
}
/**
 * Obtener todos los todos desde el servidor
 */
async function fetchTodos() {
    try {
        const response = await fetch('/todos');
        const data = await response.json();
        if (data.success) {
            return data.data;
        }
        else {
            throw new Error(data.error || 'Error al obtener todos');
        }
    }
    catch (error) {
        console.error('Error fetching todos:', error);
        showAlert('Error al cargar las tareas. Verifica la conexión con el servidor.');
        return [];
    }
}
/**
 * Agregar un nuevo todo
 */
async function addTodo() {
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    // Validación
    if (title === '' || description === '') {
        showAlert('Por favor, completa ambos campos.');
        return;
    }
    try {
        const response = await fetch('/add-todo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, description })
        });
        const data = await response.json();
        if (data.success) {
            // Limpiar campos
            titleInput.value = '';
            descriptionInput.value = '';
            // Recargar tabla
            await renderTable();
        }
        else {
            showAlert(data.error || 'Error al crear la tarea');
        }
    }
    catch (error) {
        console.error('Error adding todo:', error);
        showAlert('Error al agregar la tarea. Verifica la conexión.');
    }
}
/**
 * Eliminar un todo
 */
async function deleteTodo(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
        return;
    }
    try {
        const response = await fetch('/delete-todo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
        });
        const data = await response.json();
        if (data.success) {
            await renderTable();
        }
        else {
            showAlert(data.error || 'Error al eliminar la tarea');
        }
    }
    catch (error) {
        console.error('Error deleting todo:', error);
        showAlert('Error al eliminar la tarea.');
    }
}
/**
 * Abrir modal de edición
 */
async function openEditModal(id) {
    try {
        const todos = await fetchTodos();
        const todo = todos.find(t => t.id === id);
        if (!todo) {
            showAlert('Tarea no encontrada');
            return;
        }
        editingId = id;
        document.getElementById('modal-title').value = todo.title;
        document.getElementById('modal-description').value = todo.description;
        document.getElementById('modal-completed').checked = todo.completed;
        hideModalAlert();
        // Usar jQuery para abrir el modal
        window.$('#modal').modal('show');
    }
    catch (error) {
        console.error('Error opening edit modal:', error);
        showAlert('Error al abrir el editor');
    }
}
/**
 * Guardar edición del todo
 */
async function saveEdit() {
    if (editingId === null)
        return;
    const title = document.getElementById('modal-title').value.trim();
    const description = document.getElementById('modal-description').value.trim();
    const completed = document.getElementById('modal-completed').checked;
    // Validación
    if (title === '' || description === '') {
        showModalAlert('Por favor, completa ambos campos.');
        return;
    }
    try {
        const response = await fetch('/update-todo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: editingId, title, description, completed })
        });
        const data = await response.json();
        if (data.success) {
            // Cerrar modal
            window.$('#modal').modal('hide');
            editingId = null;
            // Recargar tabla
            await renderTable();
        }
        else {
            showModalAlert(data.error || 'Error al actualizar la tarea');
        }
    }
    catch (error) {
        console.error('Error saving todo:', error);
        showModalAlert('Error al guardar los cambios.');
    }
}
/**
 * Alternar estado completado
 */
async function toggleComplete(id) {
    try {
        const response = await fetch('/toggle-todo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id })
        });
        const data = await response.json();
        if (data.success) {
            await renderTable();
        }
        else {
            showAlert(data.error || 'Error al cambiar el estado');
        }
    }
    catch (error) {
        console.error('Error toggling complete:', error);
        showAlert('Error al cambiar el estado de la tarea.');
    }
}
/**
 * Renderizar tabla de todos
 */
async function renderTable() {
    const tbody = document.getElementById('tableBody');
    try {
        const todos = await fetchTodos();
        tbody.innerHTML = '';
        if (todos.length === 0) {
            const row = tbody.insertRow();
            row.innerHTML = `
        <td colspan="4" class="text-center text-muted">
          <em>No hay tareas. ¡Agrega una nueva!</em>
        </td>
      `;
            return;
        }
        todos.forEach(todo => {
            const row = tbody.insertRow();
            // Aplicar estilo si está completado
            const completedClass = todo.completed ? 'text-muted' : '';
            const completedStyle = todo.completed ? 'text-decoration: line-through;' : '';
            row.innerHTML = `
        <td class="${completedClass}" style="${completedStyle}">${escapeHtml(todo.title)}</td>
        <td class="${completedClass}" style="${completedStyle}">${escapeHtml(todo.description)}</td>
        <td class="text-center">
          <input
            type="checkbox"
            ${todo.completed ? 'checked' : ''}
            data-id="${todo.id}"
            class="toggle-checkbox"
          >
        </td>
        <td class="text-right">
          <button class="btn btn-primary btn-sm mb-1 edit-btn" data-id="${todo.id}">
            <i class="fa fa-pencil"></i>
          </button>
          <button class="btn btn-danger btn-sm mb-1 ml-1 delete-btn" data-id="${todo.id}">
            <i class="fa fa-trash"></i>
          </button>
        </td>
      `;
        });
        // Agregar event listeners a los botones y checkboxes
        attachEventListeners();
    }
    catch (error) {
        console.error('Error rendering table:', error);
        tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-danger">
          <i class="fa fa-exclamation-triangle"></i> Error al cargar las tareas
        </td>
      </tr>
    `;
    }
}
/**
 * Escapar HTML para prevenir XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
/**
 * Agregar event listeners a botones dinámicos
 */
function attachEventListeners() {
    // Botones de editar
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.getAttribute('data-id') || '0');
            openEditModal(id);
        });
    });
    // Botones de eliminar
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.getAttribute('data-id') || '0');
            deleteTodo(id);
        });
    });
    // Checkboxes de completado
    document.querySelectorAll('.toggle-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const id = parseInt(e.currentTarget.getAttribute('data-id') || '0');
            toggleComplete(id);
        });
    });
}
/**
 * Inicialización cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', () => {
    // Event listener para el botón de agregar
    document.getElementById('add')?.addEventListener('click', addTodo);
    // Event listener para el botón de guardar en el modal
    document.getElementById('modal-btn')?.addEventListener('click', saveEdit);
    // Permitir agregar con Enter en los inputs
    document.getElementById('title')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTodo();
        }
    });
    document.getElementById('description')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTodo();
        }
    });
    // Ocultar alerta del modal cuando se cierra
    window.$('#modal').on('hidden.bs.modal', () => {
        hideModalAlert();
        editingId = null;
    });
    // Cargar todos al iniciar
    renderTable();
    console.log('✅ Aplicación ToDo TypeScript inicializada');
});
