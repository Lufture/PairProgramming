interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

let todos: Todo[] = [];

async function loadTodos() {
  const res = await fetch("http://localhost:3000/todos");
  todos = await res.json();
  renderTable();
}

async function addTodo() {
  const title = (document.getElementById("title") as HTMLInputElement).value;
  const desc = (document.getElementById("description") as HTMLInputElement).value;

  await fetch("http://localhost:3000/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description: desc })
  });

  loadTodos();
}

async function deleteTodo(id: number) {
  await fetch(`http://localhost:3000/todos/${id}`, { method: "DELETE" });
  loadTodos();
}

function renderTable() {
  const tbody = document.getElementById("tableBody") as HTMLTableSectionElement;
  tbody.innerHTML = "";

  todos.forEach(t => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${t.title}</td>
      <td>${t.description}</td>
      <td>${t.completed ? "✔" : "❌"}</td>
      <td>
        <button onclick="deleteTodo(${t.id})" class="btn btn-danger">Delete</button>
      </td>
    `;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("add")?.addEventListener("click", addTodo);
  loadTodos();
});
