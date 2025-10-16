let todos = [];
    let nextId = 1;
    let editingId = null;

    function showAlert(message) {
      const alert = document.getElementById('alert');
      alert.innerText = message;
      alert.classList.remove('d-none');
      setTimeout(() => {
        alert.classList.add('d-none');
      }, 3000);
    }

    function addTodo() {
      const title = document.getElementById('title');
      const description = document.getElementById('description');

      if (title.value === '' || description.value === '') {
        showAlert('Please fill in both fields.');
        return;
      }

      const todo = {
        id: nextId++,
        title: title.value,
        description: description.value,
        completed: false
      };

      todos.push(todo);
      title.value = '';
      description.value = '';
      renderTable();
    }

    function deleteTodo(id) {
      todos = todos.filter(t => t.id !== id);
      renderTable();
    }

    function openEditModal(id) {
      const todo = todos.find(t => t.id === id);
      if (!todo) return;

      editingId = id;
      document.getElementById('modal-title').value = todo.title;
      document.getElementById('modal-description').value = todo.description;
      document.getElementById('modal-completed').checked = todo.completed;

      $('#modal').modal('show');
    }

    function saveEdit() {
      const title = document.getElementById('modal-title').value;
      const description = document.getElementById('modal-description').value;
      const completed = document.getElementById('modal-completed').checked;

      if (title === '' || description === '') {
        document.getElementById('modal-alert').innerText = 'Please fill in both fields.';
        document.getElementById('modal-alert').classList.remove('d-none');
        return;
      }

      const todo = todos.find(t => t.id === editingId);
      if (todo) {
        todo.title = title;
        todo.description = description;
        todo.completed = completed;
      }

      $('#modal').modal('hide');
      renderTable();
    }

    function toggleComplete(id) {
      const todo = todos.find(t => t.id === id);
      if (todo) {
        todo.completed = !todo.completed;
        renderTable();
      }
    }

    function renderTable() {
      const tbody = document.getElementById('tableBody');
      tbody.innerHTML = '';

      todos.forEach(todo => {
        const row = tbody.insertRow();
        row.innerHTML = `
          <td>${todo.title}</td>
          <td>${todo.description}</td>
          <td class="text-center">
            <input type="checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleComplete(${todo.id})">
          </td>
          <td class="text-right">
            <button class="btn btn-primary mb-1" onclick="openEditModal(${todo.id})">
              <i class="fa fa-pencil"></i>
            </button>
            <button class="btn btn-danger mb-1 ml-1" onclick="deleteTodo(${todo.id})">
              <i class="fa fa-trash"></i>
            </button>
          </td>
        `;
      });
    }

    document.addEventListener('DOMContentLoaded', function () {
      document.getElementById('add').addEventListener('click', addTodo);
      document.getElementById('modal-btn').addEventListener('click', saveEdit);

      document.getElementById('title').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTodo();
      });

      document.getElementById('description').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTodo();
      });

      document.getElementById('modal-alert').classList.add('d-none');
      renderTable();
    });