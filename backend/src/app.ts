import express from "express";
import cors from "cors";
import { pool } from "./db";

const app = express();
app.use(cors());
app.use(express.json());

// GET
app.get("/todos", async (_, res) => {
  const [rows] = await pool.query("SELECT * FROM todo");
  res.json(rows);
});

// POST
app.post("/todos", async (req, res) => {
  const { title, description } = req.body;

  await pool.query(
    "INSERT INTO todo (title, description) VALUES (?, ?)",
    [title, description]
  );

  res.json({ ok: true });
});

// DELETE
app.delete("/todos/:id", async (req, res) => {
  await pool.query("DELETE FROM todo WHERE id=?", [req.params.id]);
  res.json({ ok: true });
});

// PUT
app.put("/todos/:id", async (req, res) => {
  const { title, description, completed } = req.body;

  await pool.query(
    "UPDATE todo SET title=?, description=?, completed=? WHERE id=?",
    [title, description, completed, req.params.id]
  );

  res.json({ ok: true });
});

// PATCH completed
app.patch("/todos/:id", async (req, res) => {
  const { completed } = req.body;

  await pool.query(
    "UPDATE todo SET completed=? WHERE id=?",
    [completed, req.params.id]
  );

  res.json({ ok: true });
});

app.listen(3000, () => console.log("API running on port 3000"));
