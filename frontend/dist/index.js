"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let todos = [];
function loadTodos() {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch("http://localhost:3000/todos");
        todos = yield res.json();
        renderTable();
    });
}
function addTodo() {
    return __awaiter(this, void 0, void 0, function* () {
        const title = document.getElementById("title").value;
        const desc = document.getElementById("description").value;
        yield fetch("http://localhost:3000/todos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, description: desc })
        });
        loadTodos();
    });
}
function deleteTodo(id) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fetch(`http://localhost:3000/todos/${id}`, { method: "DELETE" });
        loadTodos();
    });
}
function renderTable() {
    const tbody = document.getElementById("tableBody");
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
    var _a;
    (_a = document.getElementById("add")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", addTodo);
    loadTodos();
});
